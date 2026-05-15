import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Palace } from "@/types/face-reading";

export function PalaceCard({ palace }: { palace: Palace }) {
  const score = Math.max(0, Math.min(10, palace.score));
  const scoreColor =
    score >= 8 ? "text-emerald-300" : score >= 5 ? "text-amber-300" : "text-rose-300";

  return (
    <Card className="bg-gradient-to-br from-red-950/40 to-black border-amber-500/30 hover:border-amber-400/60 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="font-serif text-amber-200 text-lg">
              {palace.id}. {palace.name}
            </CardTitle>
            <p className="text-amber-100/60 text-xs mt-0.5">
              {palace.nameChinese} · {palace.location}
            </p>
          </div>
          <div className={`font-serif text-2xl ${scoreColor}`}>{score}</div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-amber-50/85 text-sm leading-relaxed">{palace.reading}</p>
        <div className="mt-3 h-1.5 w-full rounded-full bg-black/50 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-600 to-amber-300"
            style={{ width: `${score * 10}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
