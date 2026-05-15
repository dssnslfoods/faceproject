import { GoogleGenerativeAI } from "@google/generative-ai";
import { ANALYZE_FACE_SYSTEM_PROMPT, ORACLE_CHAT_SYSTEM_PROMPT } from "./prompts";
import type { HRReport, ChatMessage } from "@/types/hr-report";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const PRIMARY_MODEL =
  (import.meta.env.VITE_GEMINI_MODEL as string) || "gemini-2.5-flash";
const FALLBACK_MODELS = ["gemini-2.0-flash", "gemini-1.5-flash"];

function getClient() {
  if (!API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY ยังไม่ได้ตั้งค่า");
  }
  return new GoogleGenerativeAI(API_KEY);
}

function isOverloaded(err: any): boolean {
  const msg = String(err?.message || err || "");
  return (
    msg.includes("503") ||
    msg.includes("overload") ||
    msg.includes("high demand") ||
    msg.includes("UNAVAILABLE") ||
    msg.includes("429") ||
    msg.includes("RESOURCE_EXHAUSTED")
  );
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function friendlyError(err: any): Error {
  const msg = String(err?.message || err || "");
  if (isOverloaded(err)) {
    return new Error(
      "ระบบ AI ของ Google กำลังหนาแน่น (ผู้ใช้งานทั่วโลกพร้อมกัน) — กรุณารอ 1-2 นาที แล้วลองอีกครั้ง"
    );
  }
  if (msg.includes("401") || msg.includes("403") || msg.includes("API key")) {
    return new Error("API key ไม่ถูกต้องหรือถูก revoke — กรุณาตรวจสอบการตั้งค่า");
  }
  if (msg.includes("NetworkError") || msg.includes("Failed to fetch")) {
    return new Error("เชื่อมต่อ AI ไม่ได้ — กรุณาเช็คอินเทอร์เน็ตแล้วลองอีกครั้ง");
  }
  if (msg.includes("ไม่สามารถวิเคราะห์")) {
    return err as Error; // already friendly
  }
  return new Error(`เกิดข้อผิดพลาด: ${msg.slice(0, 200)}`);
}

/** Call a generation request with retry on overload. Each model gets 3 attempts. */
async function callWithBackoff<T>(
  fn: () => Promise<T>,
  modelLabel: string
): Promise<T> {
  const delays = [0, 1500, 3500]; // 0s, 1.5s, 3.5s
  let lastErr: any;
  for (let i = 0; i < delays.length; i++) {
    if (delays[i] > 0) await sleep(delays[i]);
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isOverloaded(err)) throw err; // non-503 → bubble up immediately
      console.warn(`[${modelLabel}] overload, attempt ${i + 1}/${delays.length}`);
    }
  }
  throw lastErr;
}

async function tryAnalyzeOnce(
  modelName: string,
  cleanBase64: string,
  strict = false
): Promise<HRReport> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: ANALYZE_FACE_SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: strict ? 0.5 : 0.7,
    },
  });

  const prompt = strict
    ? "Return ONLY valid JSON per schema. No markdown, no preamble."
    : "Analyze this candidate's presentation and return the JSON report per schema.";

  const result = await model.generateContent([
    { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
    prompt,
  ]);

  const text = result.response.text();
  const parsed = JSON.parse(text);
  if (parsed.error) throw new Error(parsed.error);
  validateReport(parsed);
  return parsed as HRReport;
}

export async function analyzeFace(imageBase64: string): Promise<HRReport> {
  const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
  const modelChain = [PRIMARY_MODEL, ...FALLBACK_MODELS];

  let lastErr: any;
  for (const modelName of modelChain) {
    try {
      // Each model: backoff retry on 503
      return await callWithBackoff(
        () => tryAnalyzeOnce(modelName, cleanBase64, false),
        modelName
      );
    } catch (err) {
      lastErr = err;

      // JSON parse error → retry once on the SAME model with stricter prompt
      const msg = String((err as any)?.message || "");
      if (
        !isOverloaded(err) &&
        (msg.includes("JSON") || msg.includes("Missing") || msg.includes("must"))
      ) {
        try {
          return await callWithBackoff(
            () => tryAnalyzeOnce(modelName, cleanBase64, true),
            `${modelName}-strict`
          );
        } catch (retryErr) {
          lastErr = retryErr;
        }
      }

      // Overloaded → fall through to next model in chain
      if (isOverloaded(err)) {
        console.warn(`[${modelName}] still overloaded after retries, trying next model`);
        continue;
      }

      // Non-recoverable → throw friendly
      throw friendlyError(err);
    }
  }

  throw friendlyError(lastErr);
}

async function tryChatOnce(
  modelName: string,
  question: string,
  report: HRReport,
  history: ChatMessage[]
): Promise<string> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: ORACLE_CHAT_SYSTEM_PROMPT(JSON.stringify(report, null, 2)),
    generationConfig: { temperature: 0.7 },
  });

  const chat = model.startChat({
    history: history.map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    })),
  });

  const result = await chat.sendMessage(question);
  return result.response.text();
}

export async function askOracle(
  question: string,
  report: HRReport,
  history: ChatMessage[]
): Promise<string> {
  const modelChain = [PRIMARY_MODEL, ...FALLBACK_MODELS];
  let lastErr: any;
  for (const modelName of modelChain) {
    try {
      return await callWithBackoff(
        () => tryChatOnce(modelName, question, report, history),
        modelName
      );
    } catch (err) {
      lastErr = err;
      if (isOverloaded(err)) continue;
      throw friendlyError(err);
    }
  }
  throw friendlyError(lastErr);
}

function validateReport(r: any): asserts r is HRReport {
  if (!r.overallSummary) throw new Error("Missing overallSummary");
  if (!Array.isArray(r.personalityTraits) || r.personalityTraits.length === 0) {
    throw new Error("personalityTraits required");
  }
  if (!Array.isArray(r.strengths)) throw new Error("strengths must be array");
  if (!Array.isArray(r.improvements)) throw new Error("improvements must be array");
  if (!Array.isArray(r.suitableRoles)) throw new Error("suitableRoles must be array");
  if (!Array.isArray(r.careerPaths)) throw new Error("careerPaths must be array");
  if (!r.workStyle) throw new Error("workStyle required");
  if (!r.recommendation) throw new Error("recommendation required");
}
