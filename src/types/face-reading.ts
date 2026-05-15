export type FiveElement = "ทอง" | "ไม้" | "น้ำ" | "ไฟ" | "ดิน";

export interface Palace {
  id: number;
  name: string;
  nameChinese: string;
  location: string;
  reading: string;
  score: number;
}

export interface FaceReading {
  overallImpression: string;
  fiveElements: {
    dominant: FiveElement;
    reasoning: string;
  };
  threeSections: {
    upper: { quality: string; meaning: string };
    middle: { quality: string; meaning: string };
    lower: { quality: string; meaning: string };
  };
  twelvePalaces: Palace[];
  lifePhases: {
    early: string;
    middle: string;
    late: string;
  };
  strengths: string[];
  cautions: string[];
  advice: string;
}

export interface ChatMessage {
  role: "user" | "model";
  content: string;
  timestamp: number;
}
