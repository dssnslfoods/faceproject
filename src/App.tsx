import { useAppStore } from "@/lib/store";
import { WebcamCapture } from "@/components/WebcamCapture";
import { LoadingOracle } from "@/components/LoadingOracle";
import { FaceAnalysisResult } from "@/components/FaceAnalysisResult";
import { ConsentDialog } from "@/components/ConsentDialog";
import { Disclaimer } from "@/components/Disclaimer";
import { Button } from "@/components/ui/button";
import { X, Brain, Sparkles, ScanFace, BarChart3 } from "lucide-react";

export default function App() {
  const { stage, setStage, error, setError } = useAppStore();

  return (
    <div className="min-h-screen text-slate-100 bg-grid">
      <header className="relative border-b border-slate-800/60 backdrop-blur-xl bg-slate-950/40">
        <div className="container mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-electric flex items-center justify-center shadow-glow">
                <Brain className="h-6 w-6 text-slate-950" />
              </div>
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-cyan-500 to-electric opacity-30 blur-md -z-10" />
            </div>
            <div>
              <h1 className="font-bold text-lg md:text-xl tracking-tight text-slate-50">
                SMART HR{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-electric bg-clip-text text-transparent">
                  5.0
                </span>
              </h1>
              <p className="text-[10px] md:text-xs text-slate-400 font-mono uppercase tracking-widest">
                Talent Insight Engine
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 pulse-glow" />
              <span className="font-mono">SYSTEM ONLINE</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        {error && (
          <div className="glass-strong border-rose-500/40 bg-rose-950/30 text-rose-100 p-3 rounded-xl mb-6 max-w-2xl mx-auto flex items-start justify-between gap-3 animate-fade-in">
            <span className="text-sm">{error}</span>
            <button onClick={() => setError(null)} className="text-rose-200 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {stage === "intro" && (
          <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-cyan-300 font-mono uppercase tracking-wider">
                <Sparkles className="h-3 w-3" /> Powered by Gemini Vision · MediaPipe · pgvector
              </div>
              <h2 className="font-bold text-3xl md:text-5xl tracking-tight">
                AI-Powered{" "}
                <span className="bg-gradient-to-r from-cyan-400 via-electric to-purple-400 bg-clip-text text-transparent">
                  Candidate Insights
                </span>
              </h2>
              <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                เครื่องมือสำหรับ HR และ Talent Development —
                วิเคราะห์ลักษณะ, จุดแข็ง-จุดปรับปรุง, ตำแหน่งงานที่เหมาะสม
                และ Career Path จากการนำเสนอตัวของผู้สมัคร
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-3 my-6">
              {[
                { icon: ScanFace, label: "Face Recognition", sub: "จดจำผู้สมัครเดิม" },
                { icon: BarChart3, label: "Big Five Traits", sub: "วิเคราะห์ลักษณะนิสัย" },
                { icon: Sparkles, label: "Career Mapping", sub: "Career Path 2-3 ทาง" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="glass rounded-xl p-4 text-left">
                  <Icon className="h-5 w-5 text-cyan-400 mb-2" />
                  <div className="font-semibold text-slate-100 text-sm">{label}</div>
                  <div className="text-xs text-slate-400 mt-0.5 font-th">{sub}</div>
                </div>
              ))}
            </div>

            <Disclaimer />

            <div className="text-center">
              <Button
                size="lg"
                variant="primary"
                onClick={() => setStage("capture")}
                className="px-8 text-base"
              >
                <ScanFace className="mr-2 h-5 w-5" />
                เริ่มวิเคราะห์ Candidate
              </Button>
            </div>
          </div>
        )}

        {stage === "capture" && <WebcamCapture />}
        {stage === "consent" && <ConsentDialog />}
        {stage === "loading" && <LoadingOracle />}
        {stage === "result" && <FaceAnalysisResult />}
      </main>

      <footer className="text-center text-xs py-6 border-t border-slate-800/60 backdrop-blur-xl bg-slate-950/40 space-y-1">
        <p className="text-slate-300">
          Designed &amp; developed by{" "}
          <span className="bg-gradient-to-r from-cyan-400 to-electric bg-clip-text text-transparent font-semibold">
            Arnon Arpaket
          </span>
        </p>
        <p className="text-slate-500">
          © {new Date().getFullYear()} SMART HR 5.0 · Licensed under the MIT License
        </p>
        <p className="text-slate-600">
          For talent development support only · Not a substitute for structured interviews or
          validated assessments
        </p>
      </footer>
    </div>
  );
}
