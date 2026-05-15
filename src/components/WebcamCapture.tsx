import { useRef, useCallback, useState } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Camera, RotateCcw, Upload, Sparkles, ScanFace } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { analyzeFace } from "@/lib/gemini";
import { FaceLandmarkOverlay } from "./FaceLandmarkOverlay";
import { computeDescriptorFromDataUrl } from "@/lib/face-embed";
import { recognizeFace, touchPerson, supabaseEnabled, type MatchedPerson } from "@/lib/supabase";
import { useLiveRecognition } from "@/lib/use-live-recognition";

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user",
};

export function WebcamCapture() {
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [camError, setCamError] = useState<string | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const { setStage, setImage, setReading, setError, setPerson, setPendingEmbedding } =
    useAppStore();

  // Live recognition while in preview (not after capture)
  const { recognized, scanning, embedding } = useLiveRecognition(
    webcamRef,
    faceDetected,
    !previewSrc
  );

  // Cache last live result so we don't double-query on confirm
  const cachedRef = useRef<{ match: MatchedPerson | null; embedding: number[] | null }>({
    match: null,
    embedding: null,
  });
  cachedRef.current = { match: recognized, embedding };

  const capture = useCallback(() => {
    const src = webcamRef.current?.getScreenshot({ width: 1280, height: 720 });
    if (!src) {
      setError("ไม่สามารถถ่ายภาพได้ ลองใช้ปุ่มอัพโหลดไฟล์แทน");
      return;
    }
    setPreviewSrc(src);
    setError(null);
  }, [setError]);

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreviewSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const confirm = async () => {
    if (!previewSrc) return;
    setImage(previewSrc);
    setError(null);

    if (!supabaseEnabled) {
      setStage("loading");
      try {
        const reading = await analyzeFace(previewSrc);
        setReading(reading);
        setStage("result");
      } catch (e: any) {
        setError(e.message || "วิเคราะห์ไม่สำเร็จ");
        setStage("capture");
      }
      return;
    }

    setStage("loading");
    try {
      // Reuse cached match from live recognition if available
      let matched = cachedRef.current.match;
      let desc = cachedRef.current.embedding;

      if (!desc) {
        desc = await computeDescriptorFromDataUrl(previewSrc);
      }
      if (!desc) {
        setError("ตรวจไม่พบใบหน้าในภาพ ลองถ่ายใหม่อีกครั้ง");
        setStage("capture");
        return;
      }
      if (!matched) {
        matched = await recognizeFace(desc);
      }

      if (matched) {
        await touchPerson(matched.id);
        setPerson({
          id: matched.id,
          name: matched.name,
          visitCount: matched.visit_count + 1,
          isReturning: true,
        });
        const reading = await analyzeFace(previewSrc);
        setReading(reading);
        setStage("result");
      } else {
        setPendingEmbedding(desc);
        setStage("consent");
      }
    } catch (e: any) {
      setError(e.message || "เกิดข้อผิดพลาด");
      setStage("capture");
    }
  };

  const retake = () => setPreviewSrc(null);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative rounded-2xl overflow-hidden border border-cyan-400/40 shadow-glow bg-slate-950 w-full max-w-3xl aspect-video ring-gradient">
        {previewSrc ? (
          <img src={previewSrc} alt="capture preview" className="w-full h-full object-cover" />
        ) : (
          <>
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              screenshotQuality={0.9}
              videoConstraints={videoConstraints}
              mirrored
              onUserMediaError={() =>
                setCamError("เปิดกล้องไม่ได้ — กรุณาอนุญาตหรือใช้อัพโหลดไฟล์")
              }
              className="w-full h-full object-cover"
            />
            <FaceLandmarkOverlay
              webcamRef={webcamRef}
              mirrored
              onFaceDetectedChange={setFaceDetected}
            />

            {/* Floating recognition badge */}
            {recognized && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 animate-fade-in">
                <div className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/90 to-electric/90 border border-cyan-300/60 shadow-glow-lg flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-slate-950" />
                  <div className="text-left">
                    <p className="text-slate-950 text-base leading-tight font-semibold font-th">
                      Welcome back, <strong>{recognized.name}</strong>
                    </p>
                    <p className="text-xs text-slate-900/70 leading-tight font-mono">
                      VISIT #{recognized.visit_count} · {Math.round(recognized.similarity * 100)}% MATCH
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Scanning indicator */}
            {scanning && !recognized && faceDetected && (
              <div className="absolute top-3 right-3 px-3 py-1.5 rounded-lg glass border border-cyan-400/40 flex items-center gap-2 text-xs text-cyan-200 font-mono uppercase tracking-wider">
                <ScanFace className="h-3.5 w-3.5 animate-pulse" />
                Matching biometric...
              </div>
            )}
          </>
        )}
      </div>

      {camError && <p className="text-rose-300 text-sm">{camError}</p>}

      <p className="text-slate-400 text-sm text-center max-w-md font-th">
        จัดใบหน้าให้อยู่กลางกรอบ · แสงสว่างเพียงพอ · ไม่ใส่แว่นกันแดด · มองตรงเข้ากล้อง
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        {previewSrc ? (
          <>
            <Button variant="outline" onClick={retake}>
              <RotateCcw className="mr-2 h-4 w-4" />
              ถ่ายใหม่
            </Button>
            <Button onClick={confirm} variant="primary" size="lg">
              <Sparkles className="mr-2 h-4 w-4" />
              วิเคราะห์ผู้สมัคร
            </Button>
          </>
        ) : (
          <>
            <Button onClick={capture} size="lg" variant="primary">
              <Camera className="mr-2 h-5 w-5" />
              Capture
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              อัพโหลดรูป
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={onFileSelected}
            />
          </>
        )}
      </div>
    </div>
  );
}
