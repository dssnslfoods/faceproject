import { useAppStore } from "@/lib/store";
import { WebcamCapture } from "@/components/WebcamCapture";
import { LoadingOracle } from "@/components/LoadingOracle";
import { FaceAnalysisResult } from "@/components/FaceAnalysisResult";
import { Disclaimer } from "@/components/Disclaimer";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function App() {
  const { stage, setStage, error, setError } = useAppStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-950 to-black text-amber-50 bg-chinese">
      <header className="text-center py-6 border-b border-amber-500/20">
        <h1 className="font-serif text-4xl text-amber-300 tracking-wider">
          FaceFortune AI · 面相
        </h1>
        <p className="text-amber-200/70 mt-2 text-sm">
          ศาสตร์โหงวเฮ้งจีนโบราณด้วยปัญญาประดิษฐ์
        </p>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-800/30 border border-red-500 text-red-100 p-3 rounded-lg mb-4 max-w-2xl mx-auto flex items-start justify-between gap-3">
            <span className="text-sm">{error}</span>
            <button onClick={() => setError(null)} className="text-red-200 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {stage === "intro" && (
          <div className="text-center max-w-xl mx-auto space-y-6">
            <p className="text-amber-100/90 leading-relaxed">
              พิจารณาโหงวเฮ้งตามตำราหม่าอีและหลิวจวง
              <br />
              วิเคราะห์ <strong className="text-amber-300">5 ธาตุ · 3 ภาค · 12 พระราชวัง</strong>
            </p>
            <Disclaimer />
            <Button
              size="lg"
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => setStage("capture")}
            >
              เริ่มดูโหงวเฮ้ง
            </Button>
          </div>
        )}

        {stage === "capture" && <WebcamCapture />}
        {stage === "loading" && <LoadingOracle />}
        {stage === "result" && <FaceAnalysisResult />}
      </main>

      <footer className="text-center text-amber-200/40 text-xs py-4 border-t border-amber-500/10 space-y-1">
        <p>
          Designed &amp; developed by{" "}
          <span className="text-amber-300/80 font-medium">Arnon Arpaket</span>
        </p>
        <p>
          © {new Date().getFullYear()} FaceFortune AI · Licensed under the MIT License
        </p>
        <p className="text-amber-200/30">
          For entertainment and philosophical reflection only · Not medical or financial advice
        </p>
      </footer>
    </div>
  );
}
