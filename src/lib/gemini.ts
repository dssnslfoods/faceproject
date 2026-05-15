import { GoogleGenerativeAI } from "@google/generative-ai";
import { ANALYZE_FACE_SYSTEM_PROMPT, ORACLE_CHAT_SYSTEM_PROMPT } from "./prompts";
import type { HRReport, ChatMessage } from "@/types/hr-report";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const MODEL_NAME = (import.meta.env.VITE_GEMINI_MODEL as string) || "gemini-2.5-flash";

function getClient() {
  if (!API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY ยังไม่ได้ตั้งค่า");
  }
  return new GoogleGenerativeAI(API_KEY);
}

export async function analyzeFace(imageBase64: string): Promise<HRReport> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: ANALYZE_FACE_SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
    },
  });

  const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

  const result = await model.generateContent([
    { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
    "Analyze this candidate's presentation and return the JSON report per schema.",
  ]);

  const text = result.response.text();

  try {
    const parsed = JSON.parse(text);
    if (parsed.error) throw new Error(parsed.error);
    validateReport(parsed);
    return parsed as HRReport;
  } catch (err) {
    console.warn("First parse failed, retrying...", err);
    const retry = await model.generateContent([
      { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
      "Return ONLY valid JSON per schema. No markdown, no preamble.",
    ]);
    const retryText = retry.response.text();
    const retryParsed = JSON.parse(retryText);
    if (retryParsed.error) throw new Error(retryParsed.error);
    validateReport(retryParsed);
    return retryParsed as HRReport;
  }
}

export async function askOracle(
  question: string,
  report: HRReport,
  history: ChatMessage[]
): Promise<string> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
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
