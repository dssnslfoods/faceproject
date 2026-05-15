import { GoogleGenerativeAI } from "@google/generative-ai";
import { ANALYZE_FACE_SYSTEM_PROMPT, ORACLE_CHAT_SYSTEM_PROMPT } from "./prompts";
import type { FaceReading, ChatMessage } from "@/types/face-reading";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const MODEL_NAME = (import.meta.env.VITE_GEMINI_MODEL as string) || "gemini-2.5-flash";

function getClient() {
  if (!API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY ยังไม่ได้ตั้งค่าใน .env.local");
  }
  return new GoogleGenerativeAI(API_KEY);
}

export async function analyzeFace(imageBase64: string): Promise<FaceReading> {
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
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: cleanBase64,
      },
    },
    "วิเคราะห์โหงวเฮ้งใบหน้าในภาพนี้ตามหลักศาสตร์จีนโบราณ ส่งกลับเป็น JSON ตาม schema",
  ]);

  const text = result.response.text();

  try {
    const parsed = JSON.parse(text);
    if (parsed.error) throw new Error(parsed.error);
    validateReading(parsed);
    return parsed as FaceReading;
  } catch (err) {
    console.warn("First parse failed, retrying...", err);
    const retry = await model.generateContent([
      { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
      "ส่งกลับเป็น JSON ที่ valid เท่านั้น ห้ามมี markdown code fence ห้ามมีข้อความนำ",
    ]);
    const retryText = retry.response.text();
    const retryParsed = JSON.parse(retryText);
    if (retryParsed.error) throw new Error(retryParsed.error);
    validateReading(retryParsed);
    return retryParsed as FaceReading;
  }
}

export async function askOracle(
  question: string,
  reading: FaceReading,
  history: ChatMessage[]
): Promise<string> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: ORACLE_CHAT_SYSTEM_PROMPT(JSON.stringify(reading, null, 2)),
    generationConfig: { temperature: 0.8 },
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

function validateReading(r: any): asserts r is FaceReading {
  if (!r.overallImpression) throw new Error("Missing overallImpression");
  if (!r.fiveElements?.dominant) throw new Error("Missing fiveElements");
  if (!Array.isArray(r.twelvePalaces) || r.twelvePalaces.length !== 12) {
    throw new Error("twelvePalaces must have exactly 12 items");
  }
  if (!Array.isArray(r.strengths) || !Array.isArray(r.cautions)) {
    throw new Error("strengths/cautions must be arrays");
  }
}
