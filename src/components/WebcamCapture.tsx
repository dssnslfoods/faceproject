import { useRef, useCallback, useState } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Camera, RotateCcw, Upload } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { analyzeFace } from "@/lib/gemini";
import { FaceLandmarkOverlay } from "./FaceLandmarkOverlay";

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
  const { setStage, setImage, setReading, setError } = useAppStore();

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
    setStage("loading");
    setError(null);
    try {
      const reading = await analyzeFace(previewSrc);
      setReading(reading);
      setStage("result");
    } catch (e: any) {
      setError(e.message || "วิเคราะห์ไม่สำเร็จ");
      setStage("capture");
    }
  };

  const retake = () => setPreviewSrc(null);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-[0_0_40px_rgba(212,175,55,0.2)] bg-black w-full max-w-2xl aspect-video">
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
            <FaceLandmarkOverlay webcamRef={webcamRef} mirrored />
          </>
        )}
      </div>

      {camError && <p className="text-red-300 text-sm">{camError}</p>}

      <p className="text-amber-100/80 text-sm text-center max-w-md">
        จัดใบหน้าให้อยู่กลางกรอบ • แสงสว่างเพียงพอ • ไม่ใส่แว่นกันแดด • ผมเปิดหน้าผาก
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        {previewSrc ? (
          <>
            <Button variant="outline" onClick={retake}>
              <RotateCcw className="mr-2 h-4 w-4" />
              ถ่ายใหม่
            </Button>
            <Button onClick={confirm} className="bg-amber-600 hover:bg-amber-700">
              พิจารณาโหงวเฮ้ง
            </Button>
          </>
        ) : (
          <>
            <Button onClick={capture} size="lg" className="bg-red-700 hover:bg-red-800">
              <Camera className="mr-2 h-5 w-5" />
              ถ่ายภาพ
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
