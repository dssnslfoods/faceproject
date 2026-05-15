import { useAppStore } from "@/lib/store";
import { WebcamCapture } from "@/components/WebcamCapture";
import { LoadingOracle } from "@/components/LoadingOracle";
import { FaceAnalysisResult } from "@/components/FaceAnalysisResult";
import { ConsentDialog } from "@/components/ConsentDialog";
import { Disclaimer } from "@/components/Disclaimer";
import { Button } from "@/components/ui/button";
import { X, Brain, Sparkles, ScanFace, BarChart3, RefreshCw, Home } from "lucide-react";
import { analyzeFace } from "@/lib/gemini";

export default function App() {
  const { stage, setStage, error, setError, capturedImage, setReading, reset } = useAppStore();

  const goHome = () => {
    if (stage === "result" || stage === "consent") {
      if (!confirm("กลับหน้าหลัก? ข้อมูลที่ยังไม่ได้บันทึกจะหายไป")) return;
    }
    reset();
  };

  const retry = async () => {
    if (!capturedImage) return;
    setError(null);
    setStage("loading");
    try {
      const report = await analyzeFace(capturedImage);
      setReading(report);
      setStage("result");
    } catch (e: any) {
      setError(e.message || "วิเคราะห์ไม่สำเร็จ");
      setStage("capture");
    }
  };

  return (
    <div className="min-h-screen text-slate-100 bg-grid">
      <header className="relative border-b border-slate-800/60 backdrop-blur-xl bg-slate-950/40 sticky top-0 z-30 safe-pt">
        <div className="container mx-auto safe-px py-3 md:py-5 flex items-center justify-between gap-3">
          <button
            onClick={goHome}
            className="flex items-center gap-2.5 md:gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-xl min-w-0"
            aria-label="Home"
          >
            <div className="relative shrink-0">
              <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-electric flex items-center justify-center shadow-glow transition-transform group-hover:scale-105">
                <Brain className="h-5 w-5 md:h-6 md:w-6 text-slate-950" />
              </div>
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-cyan-500 to-electric opacity-30 blur-md -z-10 group-hover:opacity-50 transition-opacity" />
            </div>
            <div className="text-left min-w-0">
              <h1 className="font-bold text-base md:text-xl tracking-tight text-slate-50 leading-none">
                SMART HR{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-electric bg-clip-text text-transparent">
                  5.0
                </span>
              </h1>
              <p className="hidden sm:block text-[10px] md:text-xs text-slate-400 font-mono uppercase tracking-widest mt-0.5">
                Talent Insight Engine
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 pulse-glow" />
              <span className="font-mono">SYSTEM ONLINE</span>
            </div>
            {stage !== "intro" && (
              <Button
                variant="outline"
                size="sm"
                onClick={goHome}
                className="gap-1.5 px-2.5 md:px-3"
                aria-label="กลับหน้าหลัก"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto safe-px py-5 md:py-12 safe-pb">
        {error && (
          <div className="glass-strong border border-rose-500/40 bg-rose-950/30 text-rose-100 p-4 rounded-xl mb-6 max-w-2xl mx-auto animate-fade-in">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm leading-relaxed font-th">{error}</p>
              <button onClick={() => setError(null)} className="text-rose-200 hover:text-white shrink-0">
                <X className="h-4 w-4" />
              </button>
            </div>
            {capturedImage && stage === "capture" && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-rose-500/20">
                <Button size="sm" variant="primary" onClick={retry}>
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  ลองวิเคราะห์อีกครั้ง
                </Button>
                <span className="text-xs text-rose-200/60 self-center font-th">
                  ระบบจะเปลี่ยน model อัตโนมัติถ้า server หลักล่ม
                </span>
              </div>
            )}
          </div>
        )}

        {stage === "intro" && (
          <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 animate-fade-in">
            <div className="text-center space-y-3 md:space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full glass text-[10px] md:text-xs text-cyan-300 font-mono uppercase tracking-wider">
                <Sparkles className="h-3 w-3" />
                <span className="hidden sm:inline">Powered by</span> Gemini · MediaPipe · pgvector
              </div>
              <h2 className="font-bold text-2xl sm:text-3xl md:text-5xl tracking-tight leading-tight">
                AI-Powered{" "}
                <span className="bg-gradient-to-r from-cyan-400 via-electric to-purple-400 bg-clip-text text-transparent">
                  Candidate Insights
                </span>
              </h2>
              <p className="text-slate-300 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed font-th px-2">
                เครื่องมือสำหรับ HR และ Talent Development —
                วิเคราะห์ลักษณะ, จุดแข็ง-จุดปรับปรุง, ตำแหน่งงานที่เหมาะสม
                และ Career Path จากการนำเสนอตัวของผู้สมัคร
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 md:gap-3">
              {[
                { icon: ScanFace, label: "Face Recognition", sub: "จดจำผู้สมัครเดิม" },
                { icon: BarChart3, label: "Big Five Traits", sub: "วิเคราะห์ลักษณะนิสัย" },
                { icon: Sparkles, label: "Career Mapping", sub: "Career Path 2-3 ทาง" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="glass rounded-xl p-3 md:p-4 text-left flex sm:block items-center gap-3">
                  <Icon className="h-5 w-5 text-cyan-400 sm:mb-2 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-100 text-sm">{label}</div>
                    <div className="text-xs text-slate-400 mt-0.5 font-th">{sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <Disclaimer />

            <div className="text-center">
              <Button
                size="lg"
                variant="primary"
                onClick={() => setStage("capture")}
                className="px-6 md:px-8 text-sm md:text-base w-full sm:w-auto"
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

      <footer className="text-center text-xs py-4 md:py-6 safe-px safe-pb border-t border-slate-800/60 backdrop-blur-xl bg-slate-950/40 space-y-1">
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
