import { motion } from "framer-motion";
import { Brain, Cpu, Database, Zap } from "lucide-react";

const STEPS = [
  { icon: Brain, label: "Analyzing facial cues", labelTH: "วิเคราะห์ลักษณะใบหน้า" },
  { icon: Cpu, label: "Computing personality model", labelTH: "ประมวลผลลักษณะนิสัย" },
  { icon: Database, label: "Matching role profiles", labelTH: "จับคู่ตำแหน่งงาน" },
  { icon: Zap, label: "Generating career insights", labelTH: "สร้าง Career insights" },
];

export function LoadingOracle() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      {/* Hex scanner */}
      <div className="relative w-40 h-40">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00e5ff" />
                <stop offset="100%" stopColor="#4d6cff" />
              </linearGradient>
            </defs>
            <polygon
              points="50,5 90,28 90,72 50,95 10,72 10,28"
              fill="none"
              stroke="url(#grad)"
              strokeWidth="1"
              strokeDasharray="4 3"
            />
            <polygon
              points="50,15 80,32 80,68 50,85 20,68 20,32"
              fill="none"
              stroke="url(#grad)"
              strokeWidth="1"
              opacity="0.5"
            />
          </svg>
        </motion.div>
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#a855f7"
              strokeWidth="0.8"
              strokeDasharray="2 4"
            />
          </svg>
        </motion.div>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-electric flex items-center justify-center shadow-glow-lg"
          >
            <Brain className="h-7 w-7 text-slate-950" />
          </motion.div>
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="font-bold text-xl bg-gradient-to-r from-cyan-400 to-electric bg-clip-text text-transparent">
          AI ANALYSIS IN PROGRESS
        </p>
        <p className="text-sm text-slate-400 font-mono">
          Estimated time · 8–15 seconds
        </p>
      </div>

      {/* Animated step list */}
      <div className="glass rounded-2xl p-4 w-full max-w-md space-y-2">
        {STEPS.map((s, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
            className="flex items-center gap-3 text-sm"
          >
            <s.icon className="h-4 w-4 text-cyan-400 shrink-0" />
            <span className="text-slate-200 font-mono text-xs">{s.label}</span>
            <span className="text-slate-500 text-xs font-th ml-auto">{s.labelTH}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
