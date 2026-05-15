import { useAppStore } from "@/lib/store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScoreCard } from "./PalaceCard";
import { ChatPanel } from "./ChatPanel";
import { exportToPdf } from "@/lib/pdf-export";
import { Button } from "@/components/ui/button";
import {
  Download,
  RotateCcw,
  Trash2,
  TrendingUp,
  TrendingDown,
  Briefcase,
  GitBranch,
  GraduationCap,
  Users,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";
import { deletePerson } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const CATEGORY_BADGE = {
  communication: { label: "Communication", variant: "cyan" as const },
  leadership: { label: "Leadership", variant: "purple" as const },
  analytical: { label: "Analytical", variant: "emerald" as const },
  creative: { label: "Creative", variant: "amber" as const },
  interpersonal: { label: "Interpersonal", variant: "cyan" as const },
  execution: { label: "Execution", variant: "emerald" as const },
};

const PRIORITY_LABEL = {
  high: { label: "ลำดับความสำคัญสูง", variant: "rose" as const },
  medium: { label: "ปานกลาง", variant: "amber" as const },
  low: { label: "ต่ำ", variant: "cyan" as const },
};

const CONFIDENCE_LABEL = {
  high: { label: "High Confidence", variant: "emerald" as const },
  medium: { label: "Medium Confidence", variant: "amber" as const },
  low: { label: "Low Confidence", variant: "rose" as const },
};

export function FaceAnalysisResult() {
  const { reading, capturedImage, reset, person, setPerson } = useAppStore();
  if (!reading) return null;

  const onDeleteMe = async () => {
    if (!person) return;
    if (!confirm(`ลบ biometric profile ของ "${person.name}" ออกจากระบบถาวร?`)) return;
    try {
      await deletePerson(person.id);
      setPerson(null);
      alert("ลบข้อมูลของคุณเรียบร้อยแล้ว");
    } catch (e: any) {
      alert("ลบไม่สำเร็จ: " + e.message);
    }
  };

  const conf = CONFIDENCE_LABEL[reading.confidenceLevel] ?? CONFIDENCE_LABEL.medium;

  return (
    <div id="result-root" className="max-w-6xl mx-auto p-2 md:p-4 space-y-6 animate-fade-in">
      {/* Greeting */}
      {person && (
        <div
          className={cn(
            "glass rounded-2xl p-4 flex items-center justify-between gap-4",
            person.isReturning ? "border-emerald-400/40" : "border-cyan-400/40"
          )}
        >
          <div>
            <p className="font-semibold text-base md:text-lg text-slate-100">
              {person.isReturning ? "👋 Welcome back, " : "✨ "}
              <span className="bg-gradient-to-r from-cyan-400 to-electric bg-clip-text text-transparent">
                {person.name}
              </span>
            </p>
            {person.isReturning && (
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Visit #{person.visitCount} · Profile recognized
              </p>
            )}
          </div>
          <Badge variant={person.isReturning ? "emerald" : "cyan"}>
            {person.isReturning ? "RETURNING" : "NEW PROFILE"}
          </Badge>
        </div>
      )}

      {/* Executive summary */}
      <Card className="ring-gradient">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start">
            {capturedImage && (
              <div className="relative shrink-0">
                <img
                  src={capturedImage}
                  alt="Candidate"
                  className="w-28 h-28 md:w-36 md:h-36 object-cover rounded-xl border border-cyan-400/30"
                />
                <div className="absolute -top-2 -right-2">
                  <Badge variant={conf.variant} className="font-mono text-[10px]">
                    {conf.label}
                  </Badge>
                </div>
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="cyan" className="font-mono text-[10px]">EXECUTIVE SUMMARY</Badge>
              </div>
              <p className="text-slate-200 leading-relaxed text-base font-th">
                {reading.overallSummary}
              </p>

              <div className="mt-4 p-3 rounded-lg bg-cyan-500/5 border border-cyan-400/20">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-cyan-300 font-mono uppercase tracking-wider mb-1">
                      HR Recommendation
                    </div>
                    <p className="text-sm text-slate-200 font-th leading-relaxed">
                      {reading.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="traits" className="w-full space-y-4">
        <div className="overflow-x-auto -mx-2 px-2">
          <TabsList className="flex-nowrap whitespace-nowrap">
            <TabsTrigger value="traits">Personality</TabsTrigger>
            <TabsTrigger value="strengths">จุดแข็ง</TabsTrigger>
            <TabsTrigger value="improvements">จุดปรับปรุง</TabsTrigger>
            <TabsTrigger value="roles">ตำแหน่งที่เหมาะ</TabsTrigger>
            <TabsTrigger value="career">Career Path</TabsTrigger>
            <TabsTrigger value="dev">Development</TabsTrigger>
            <TabsTrigger value="workstyle">Work Style</TabsTrigger>
          </TabsList>
        </div>

        {/* Personality Traits */}
        <TabsContent value="traits" className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {reading.personalityTraits.map((t) => (
            <ScoreCard
              key={t.key}
              title={t.nameTH}
              subtitle={t.name.toUpperCase()}
              score={t.score}
              description={t.description}
              accent="cyan"
            />
          ))}
        </TabsContent>

        {/* Strengths */}
        <TabsContent value="strengths" className="grid md:grid-cols-2 gap-3">
          {reading.strengths.map((s, i) => {
            const cat = CATEGORY_BADGE[s.category] ?? { label: s.category, variant: "cyan" as const };
            return (
              <Card key={i} className="border-emerald-400/20 hover:border-emerald-400/40 transition-all">
                <CardContent className="pt-5">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center shrink-0">
                      <TrendingUp className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-semibold text-slate-100 font-th">{s.title}</h4>
                        <Badge variant={cat.variant} className="text-[10px]">{cat.label}</Badge>
                      </div>
                      <p className="text-sm text-slate-300 font-th leading-relaxed">{s.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Improvements */}
        <TabsContent value="improvements" className="grid md:grid-cols-2 gap-3">
          {reading.improvements.map((imp, i) => (
            <Card key={i} className="border-amber-400/20 hover:border-amber-400/40 transition-all">
              <CardContent className="pt-5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-amber-500/15 border border-amber-400/30 flex items-center justify-center shrink-0">
                    <TrendingDown className="h-5 w-5 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-100 font-th mb-1">{imp.title}</h4>
                    <p className="text-sm text-slate-300 font-th leading-relaxed">{imp.description}</p>
                  </div>
                </div>
                <div className="ml-12 p-3 rounded-lg bg-amber-500/5 border border-amber-400/20">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-300 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-100/90 font-th">
                      <span className="font-semibold text-amber-300">Action: </span>
                      {imp.actionTip}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Suitable Roles */}
        <TabsContent value="roles" className="grid md:grid-cols-2 gap-3">
          {reading.suitableRoles
            .slice()
            .sort((a, b) => b.matchScore - a.matchScore)
            .map((r, i) => (
              <Card key={i} className="border-cyan-400/20 hover:border-cyan-400/50 transition-all">
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-electric/20 border border-cyan-400/40 flex items-center justify-center shrink-0">
                        <Briefcase className="h-5 w-5 text-cyan-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-100 font-th leading-tight">{r.title}</h4>
                        <p className="text-xs text-slate-400 font-mono">{r.titleEN}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold font-mono tabular-nums bg-gradient-to-r from-cyan-400 to-electric bg-clip-text text-transparent">
                        {r.matchScore}%
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono uppercase">match</div>
                    </div>
                  </div>
                  <div className="h-1 w-full rounded-full bg-slate-800/60 overflow-hidden mb-3">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-electric"
                      style={{ width: `${r.matchScore}%` }}
                    />
                  </div>
                  <p className="text-sm text-slate-300 font-th leading-relaxed">{r.reasoning}</p>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-[10px]">{r.industry}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        {/* Career Path */}
        <TabsContent value="career" className="grid md:grid-cols-2 gap-3">
          {reading.careerPaths.map((p, i) => (
            <Card key={i} className="border-purple-400/20 hover:border-purple-400/40 transition-all">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-500/15 border border-purple-400/40 flex items-center justify-center shrink-0">
                    <GitBranch className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="font-th">{p.direction}</CardTitle>
                    <Badge variant="purple" className="mt-1 text-[10px]">{p.timeline}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300 font-th mb-4 leading-relaxed">{p.description}</p>
                <div className="space-y-2">
                  {p.milestones.map((m, j) => (
                    <div key={j} className="flex items-start gap-3">
                      <div className="relative shrink-0 mt-0.5">
                        <div className="h-6 w-6 rounded-full bg-purple-500/20 border border-purple-400/50 flex items-center justify-center text-[11px] font-mono text-purple-300 font-semibold">
                          {j + 1}
                        </div>
                        {j < p.milestones.length - 1 && (
                          <div className="absolute left-1/2 -translate-x-1/2 top-6 w-px h-5 bg-purple-400/30" />
                        )}
                      </div>
                      <p className="text-sm text-slate-200 font-th pb-3 leading-relaxed">{m}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Development Areas */}
        <TabsContent value="dev" className="grid md:grid-cols-2 gap-3">
          {reading.developmentAreas.map((d, i) => {
            const pri = PRIORITY_LABEL[d.priority] ?? PRIORITY_LABEL.medium;
            return (
              <Card key={i} className="hover:border-cyan-400/40 transition-all">
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-lg bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center shrink-0">
                        <GraduationCap className="h-5 w-5 text-cyan-400" />
                      </div>
                      <h4 className="font-semibold text-slate-100 font-th">{d.skill}</h4>
                    </div>
                    <Badge variant={pri.variant} className="text-[10px] shrink-0">{pri.label}</Badge>
                  </div>
                  <ul className="space-y-1 ml-12">
                    {d.resources.map((r, j) => (
                      <li key={j} className="text-sm text-slate-300 font-th flex items-start gap-2">
                        <span className="text-cyan-400 mt-1">›</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Work Style */}
        <TabsContent value="workstyle" className="space-y-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-electric/15 border border-electric/40 flex items-center justify-center">
                  <Users className="h-5 w-5 text-electric-400" />
                </div>
                <div>
                  <CardTitle className="font-th">Work Style Profile</CardTitle>
                  <Badge variant="cyan" className="mt-1 text-[10px]">
                    Team Role: {reading.workStyle.teamRole}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-xs text-slate-400 font-mono uppercase mb-1">
                  Ideal Environment
                </div>
                <p className="text-sm text-slate-200 font-th">{reading.workStyle.environment}</p>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-mono uppercase mb-1">
                  Communication Style
                </div>
                <p className="text-sm text-slate-200 font-th">{reading.workStyle.communicationStyle}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-400/20">
                  <div className="text-xs text-emerald-300 font-mono uppercase mb-2">
                    ✓ Motivators
                  </div>
                  <ul className="space-y-1">
                    {reading.workStyle.motivators.map((m, i) => (
                      <li key={i} className="text-sm text-slate-200 font-th">
                        · {m}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 rounded-lg bg-rose-500/5 border border-rose-400/20">
                  <div className="text-xs text-rose-300 font-mono uppercase mb-2">
                    ⚠ Stressors
                  </div>
                  <ul className="space-y-1">
                    {reading.workStyle.stressors.map((s, i) => (
                      <li key={i} className="text-sm text-slate-200 font-th">
                        · {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {reading.redFlags && reading.redFlags.length > 0 && (
            <Card className="border-rose-400/30 bg-rose-950/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-rose-400" />
                  <CardTitle className="text-rose-200 text-base">
                    Items to Validate in Interview
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {reading.redFlags.map((f, i) => (
                    <li key={i} className="text-sm text-rose-100/90 font-th flex items-start gap-2">
                      <span className="text-rose-400 mt-1">⚠</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <ChatPanel />

      <div className="flex flex-wrap gap-3 justify-center pt-4">
        <Button variant="primary" onClick={() => exportToPdf("result-root", "candidate-report.pdf")}>
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
        <Button variant="outline" onClick={reset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          วิเคราะห์คนใหม่
        </Button>
        {person && (
          <Button
            variant="ghost"
            onClick={onDeleteMe}
            className="text-rose-300 hover:bg-rose-500/10"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            ลบ Biometric Profile
          </Button>
        )}
      </div>
    </div>
  );
}
