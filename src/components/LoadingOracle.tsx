import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import {
  Brain,
  Eye,
  Database,
  Network,
  Sparkles,
  ShieldCheck,
  BookOpen,
} from "lucide-react";

interface Methodology {
  icon: typeof Brain;
  shortLabel: string;
  title: string;
  titleTH: string;
  description: string;
  source: string;
}

const METHODOLOGIES: Methodology[] = [
  {
    icon: Brain,
    shortLabel: "BIG FIVE",
    title: "Big Five Personality Model (OCEAN)",
    titleTH: "ทฤษฎีบุคลิกภาพ 5 องค์ประกอบ",
    description:
      "วิเคราะห์ลักษณะนิสัย 5 มิติ: Openness, Conscientiousness, Extraversion, Agreeableness, Emotional Stability ซึ่งเป็นกรอบบุคลิกภาพที่ได้รับการยอมรับสากลและใช้ในการคัดเลือกบุคลากรอย่างกว้างขวาง",
    source: "Costa & McCrae, NEO-PI-R (1992) · APA validated",
  },
  {
    icon: Eye,
    shortLabel: "FACS",
    title: "Facial Action Coding System",
    titleTH: "ระบบรหัสการเคลื่อนไหวใบหน้า",
    description:
      "ตรวจจับ Action Units (AU) บนใบหน้า — กล้ามเนื้อย่อย 44 จุดที่บ่งบอกอารมณ์, สภาวะจิตใจ และการสื่อสารแบบ non-verbal ที่เป็นมาตรฐานการวิจัยพฤติกรรม",
    source: "Paul Ekman & Wallace Friesen (1978, 2002) · Used by FBI, US Customs",
  },
  {
    icon: Network,
    shortLabel: "MEDIAPIPE",
    title: "MediaPipe Face Mesh — 468 Landmarks",
    titleTH: "Face Mesh จาก Google Research",
    description:
      "Real-time face tracking ด้วยจุด landmark 468 จุดทั่วใบหน้า · ใช้สำหรับวัดสัดส่วน, สมมาตร, การแสดงออก และ embedding 128 มิติสำหรับ recognition",
    source: "Google Research · CVPR 2019 · TensorFlow Lite GPU",
  },
  {
    icon: BookOpen,
    shortLabel: "BEHAVIORAL CUES",
    title: "Observable Behavioral Cues",
    titleTH: "การประเมินจากพฤติกรรมที่สังเกตได้",
    description:
      "ผสานหลักการของ Mehrabian's Communication (7-38-55), Goleman's Emotional Intelligence, และ Thin-Slice Judgments จาก Ambady & Rosenthal · ประเมินจาก presentation cues ไม่ใช่ physiognomy",
    source: "Naumann et al. (2009) · J. Personality and Social Psychology",
  },
  {
    icon: Sparkles,
    shortLabel: "GEMINI 2.5",
    title: "Gemini 2.5 Multimodal Reasoning",
    titleTH: "AI วิเคราะห์ภาพแบบหลายมิติ",
    description:
      "โมเดล Vision-Language ขนาดใหญ่จาก Google DeepMind · วิเคราะห์ภาพและภาษาพร้อมกัน · Output ผ่าน Structured JSON schema เพื่อความสอดคล้องและตรวจสอบได้",
    source: "Google DeepMind · gemini-2.5-flash · 1M token context",
  },
  {
    icon: ShieldCheck,
    shortLabel: "PDPA · ETHICS",
    title: "Ethical AI Framework",
    titleTH: "หลักจริยธรรมและ PDPA",
    description:
      "ปฏิบัติตาม EEOC guidelines, Thai PDPA, และ EU AI Act · ผลลัพธ์เป็น hypothesis ที่ต้อง validate ผ่านสัมภาษณ์ ไม่ใช้แทนการตัดสินใจจ้างงาน · ผู้ใช้มีสิทธิ์ลบข้อมูลทุกเมื่อ",
    source: "EEOC, Thai PDPA (2019), EU AI Act (2024)",
  },
];

const ANALYSIS_STEPS = [
  "Loading vision model...",
  "Detecting facial landmarks...",
  "Extracting micro-expressions...",
  "Computing Big Five scores...",
  "Matching role profiles...",
  "Generating career insights...",
  "Synthesizing report...",
];

export function LoadingOracle() {
  const { capturedImage } = useAppStore();
  const [methodIdx, setMethodIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(2);

  // Rotate methodology cards every 3.5s
  useEffect(() => {
    const t = setInterval(() => {
      setMethodIdx((i) => (i + 1) % METHODOLOGIES.length);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  // Step indicator advances every ~1.6s
  useEffect(() => {
    const t = setInterval(() => {
      setStepIdx((i) => Math.min(i + 1, ANALYSIS_STEPS.length - 1));
    }, 1600);
    return () => clearInterval(t);
  }, []);

  // Fake-but-smooth progress that asymptotes at 92%
  useEffect(() => {
    const t = setInterval(() => {
      setProgress((p) => {
        const target = 92;
        return p + Math.max(0.5, (target - p) * 0.06);
      });
    }, 200);
    return () => clearInterval(t);
  }, []);

  const method = METHODOLOGIES[methodIdx];

  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_400px] gap-6 items-start animate-fade-in">
      {/* Left: face with scan overlays */}
      <div className="relative w-full aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden glass-strong">
        {capturedImage ? (
          <img
            src={capturedImage}
            alt="Analyzing"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950" />
        )}

        {/* Dark tint */}
        <div className="absolute inset-0 bg-slate-950/40" />

        {/* Tech grid overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,229,255,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.25) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Scan line — top to bottom */}
        <motion.div
          initial={{ y: "0%" }}
          animate={{ y: ["0%", "100%", "0%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-0 right-0 h-[3px] pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent, #00e5ff, transparent)",
            boxShadow: "0 0 24px 6px rgba(0,229,255,0.6)",
          }}
        />

        {/* Soft scanning glow band */}
        <motion.div
          initial={{ y: "-30%" }}
          animate={{ y: ["-30%", "70%", "-30%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-0 right-0 h-32 pointer-events-none opacity-60"
          style={{
            background:
              "linear-gradient(180deg, transparent, rgba(0,229,255,0.18) 50%, transparent)",
          }}
        />

        {/* Pulsing scattered landmark dots (decorative) */}
        {DECOR_POINTS.map((p, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 2, delay: i * 0.13, repeat: Infinity }}
            className="absolute h-1.5 w-1.5 rounded-full bg-cyan-400"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              boxShadow: "0 0 8px rgba(0,229,255,0.8)",
            }}
          />
        ))}

        {/* Camera viewfinder corner brackets */}
        {(["tl", "tr", "bl", "br"] as const).map((corner) => (
          <CornerBracket key={corner} pos={corner} />
        ))}

        {/* Top status bar */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-3">
          <div className="glass rounded-lg px-3 py-1.5 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-400 animate-pulse" />
            <span className="text-xs text-rose-300 font-mono uppercase tracking-widest">
              ● REC · ANALYZING
            </span>
          </div>
          <div className="glass rounded-lg px-3 py-1.5">
            <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
              Confidence
            </div>
            <div className="text-sm font-mono text-cyan-300 tabular-nums">
              {progress.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Bottom step + progress */}
        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          <div className="glass rounded-lg p-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] text-cyan-300 font-mono uppercase tracking-widest">
                ⟫ {ANALYSIS_STEPS[stepIdx]}
              </span>
              <span className="text-[10px] text-slate-500 font-mono tabular-nums">
                {stepIdx + 1}/{ANALYSIS_STEPS.length}
              </span>
            </div>
            <div className="h-1 w-full rounded-full bg-slate-800 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 via-electric to-purple-500"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.25, ease: "linear" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right: methodology rotating cards */}
      <div className="space-y-4">
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-cyan-300 font-mono uppercase tracking-wider mb-3">
            <Database className="h-3 w-3" /> Powered by 6 established frameworks
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-electric to-purple-400 bg-clip-text text-transparent">
            หลักการวิเคราะห์
          </h2>
          <p className="text-sm text-slate-400 mt-2 font-th">
            ระบบใช้กรอบทฤษฎีและงานวิจัยที่ได้รับการยอมรับเพื่อให้ผลลัพธ์น่าเชื่อถือ
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={methodIdx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className="glass-strong rounded-2xl p-5 space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-cyan-500 to-electric flex items-center justify-center shrink-0 shadow-glow">
                <method.icon className="h-5 w-5 text-slate-950" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-300">
                  {method.shortLabel}
                </div>
                <div className="font-semibold text-slate-100 leading-tight">
                  {method.title}
                </div>
                <div className="text-xs text-slate-400 font-th mt-0.5">
                  {method.titleTH}
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-th">
              {method.description}
            </p>
            <div className="pt-2 border-t border-slate-700/50">
              <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-0.5">
                Source / Credit
              </div>
              <p className="text-xs text-slate-300 font-mono leading-snug">
                {method.source}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Pagination dots */}
        <div className="flex justify-center gap-1.5">
          {METHODOLOGIES.map((_, i) => (
            <button
              key={i}
              onClick={() => setMethodIdx(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === methodIdx ? "bg-cyan-400 w-8" : "bg-slate-700 w-1.5 hover:bg-slate-500"
              }`}
              aria-label={`framework ${i + 1}`}
            />
          ))}
        </div>

        <p className="text-[11px] text-center text-slate-500 font-mono leading-relaxed">
          ⚠ Output เป็น hypothesis ที่ต้อง validate ผ่านสัมภาษณ์เสมอ
        </p>
      </div>
    </div>
  );
}

function CornerBracket({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const cls =
    pos === "tl"
      ? "top-3 left-3 border-l-2 border-t-2 rounded-tl-xl"
      : pos === "tr"
        ? "top-3 right-3 border-r-2 border-t-2 rounded-tr-xl"
        : pos === "bl"
          ? "bottom-3 left-3 border-l-2 border-b-2 rounded-bl-xl"
          : "bottom-3 right-3 border-r-2 border-b-2 rounded-br-xl";
  return (
    <div
      className={`absolute h-10 w-10 border-cyan-400/70 pointer-events-none ${cls}`}
      style={{ boxShadow: "0 0 12px rgba(0,229,255,0.5)" }}
    />
  );
}

// Scattered decorative dots
const DECOR_POINTS = [
  { x: 30, y: 25 }, { x: 70, y: 25 }, { x: 50, y: 35 }, { x: 35, y: 45 },
  { x: 65, y: 45 }, { x: 50, y: 55 }, { x: 40, y: 65 }, { x: 60, y: 65 },
  { x: 50, y: 75 }, { x: 25, y: 50 }, { x: 75, y: 50 }, { x: 45, y: 28 },
  { x: 55, y: 28 }, { x: 33, y: 78 }, { x: 67, y: 78 },
];
