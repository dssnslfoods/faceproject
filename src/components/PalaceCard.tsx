// Generic ScoreCard — used for personality traits and role matches
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  subtitle?: string;
  score: number; // 0-100
  description: string;
  accent?: "cyan" | "purple" | "emerald" | "amber";
}

export function ScoreCard({ title, subtitle, score, description, accent = "cyan" }: Props) {
  const clamped = Math.max(0, Math.min(100, score));
  const tone =
    accent === "cyan"
      ? { text: "text-cyan-300", bar: "from-cyan-500 to-electric", border: "border-cyan-400/30" }
      : accent === "purple"
        ? { text: "text-purple-300", bar: "from-purple-500 to-pink-500", border: "border-purple-400/30" }
        : accent === "emerald"
          ? { text: "text-emerald-300", bar: "from-emerald-500 to-cyan-500", border: "border-emerald-400/30" }
          : { text: "text-amber-300", bar: "from-amber-500 to-rose-500", border: "border-amber-400/30" };

  return (
    <div className={cn("glass rounded-xl p-4 border hover:border-opacity-60 transition-all", tone.border)}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="font-semibold text-slate-100 font-th">{title}</div>
          {subtitle && <div className="text-xs text-slate-400 mt-0.5 font-mono">{subtitle}</div>}
        </div>
        <div className={cn("text-2xl font-bold font-mono tabular-nums", tone.text)}>
          {clamped}
        </div>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-800/60 overflow-hidden mb-3">
        <div
          className={cn("h-full bg-gradient-to-r transition-all duration-700", tone.bar)}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <p className="text-sm text-slate-300 leading-relaxed font-th">{description}</p>
    </div>
  );
}

// Backward-compat export — kept for any old imports
export const PalaceCard = ScoreCard;
