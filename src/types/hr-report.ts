// SMART HR 5.0 — Candidate analysis schema

export interface PersonalityTrait {
  key: string;              // e.g. "conscientiousness"
  name: string;             // EN — "Conscientiousness"
  nameTH: string;           // TH — "ความรับผิดชอบ"
  score: number;            // 0-100
  description: string;      // brief evidence-based observation
}

export interface StrengthItem {
  title: string;            // TH short title — e.g. "การสื่อสารชัดเจน"
  description: string;      // 1-2 sentences
  category: "communication" | "leadership" | "analytical" | "creative" | "interpersonal" | "execution";
}

export interface ImprovementItem {
  title: string;
  description: string;
  actionTip: string;        // concrete how-to
}

export interface SuitableRole {
  title: string;            // TH job title
  titleEN: string;          // EN job title
  matchScore: number;       // 0-100
  reasoning: string;        // why this role fits
  industry: string;         // sector example
}

export interface CareerPath {
  direction: string;        // e.g. "สาย Leadership"
  timeline: string;         // e.g. "3-5 ปี"
  description: string;
  milestones: string[];     // step-by-step
}

export interface DevelopmentArea {
  skill: string;            // e.g. "Public Speaking"
  priority: "high" | "medium" | "low";
  resources: string[];      // courses, certs, books
}

export interface WorkStyle {
  teamRole: string;         // "Driver", "Connector", "Strategist", "Implementer"
  environment: string;      // ideal work environment description
  communicationStyle: string;
  motivators: string[];
  stressors: string[];
}

export interface HRReport {
  overallSummary: string;             // 3-4 sentences executive summary
  confidenceLevel: "high" | "medium" | "low"; // self-assessment of AI's confidence
  personalityTraits: PersonalityTrait[]; // 5 Big-Five-style items
  strengths: StrengthItem[];          // 4-6
  improvements: ImprovementItem[];    // 2-4
  suitableRoles: SuitableRole[];      // 4-6
  careerPaths: CareerPath[];          // 2-3 alternative paths
  developmentAreas: DevelopmentArea[]; // 3-5 skills to develop
  workStyle: WorkStyle;
  redFlags: string[];                 // 0-3 cautions for HR
  recommendation: string;              // 1-2 sentence HR action recommendation
}

export interface ChatMessage {
  role: "user" | "model";
  content: string;
  timestamp: number;
}
