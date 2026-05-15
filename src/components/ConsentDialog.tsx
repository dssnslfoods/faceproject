import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { savePerson } from "@/lib/supabase";
import { analyzeFace } from "@/lib/gemini";
import { Shield, AlertTriangle } from "lucide-react";

export function ConsentDialog() {
  const {
    capturedImage,
    pendingEmbedding,
    setStage,
    setReading,
    setError,
    setPerson,
    setPendingEmbedding,
  } = useAppStore();

  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!name.trim() || !consent || !capturedImage || !pendingEmbedding) return;
    setSubmitting(true);
    setError(null);
    try {
      // 1) Save person to Supabase
      const saved = await savePerson(name.trim(), pendingEmbedding, capturedImage);

      // 2) Set person + go to loading
      if (saved) {
        setPerson({
          id: saved.id,
          name: name.trim(),
          visitCount: 1,
          isReturning: false,
        });
      }

      // 3) Analyze face
      setStage("loading");
      const reading = await analyzeFace(capturedImage);
      setReading(reading);
      setPendingEmbedding(null);
      setStage("result");
    } catch (e: any) {
      setError(e.message || "เกิดข้อผิดพลาด");
      setStage("capture");
    } finally {
      setSubmitting(false);
    }
  };

  const skip = async () => {
    if (!capturedImage) return;
    // Skip name save — analyze only
    setPendingEmbedding(null);
    setPerson(null);
    setStage("loading");
    setError(null);
    try {
      const reading = await analyzeFace(capturedImage);
      setReading(reading);
      setStage("result");
    } catch (e: any) {
      setError(e.message || "วิเคราะห์ไม่สำเร็จ");
      setStage("capture");
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <Card className="border-amber-500/40 bg-gradient-to-br from-red-950/60 to-black">
        <CardHeader>
          <div className="flex items-center gap-2 text-amber-300">
            <Shield className="h-5 w-5" />
            <CardTitle className="font-serif text-2xl">ตั้งชื่อ + ขอความยินยอม</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {capturedImage && (
            <img
              src={capturedImage}
              alt="ภาพที่ถ่าย"
              className="w-32 h-32 object-cover rounded-lg border-2 border-amber-500/40 mx-auto"
            />
          )}

          <div>
            <label className="text-sm text-amber-200 block mb-1">ชื่อที่ใช้เรียก</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น Golf"
              maxLength={50}
              autoFocus
            />
          </div>

          <div className="text-xs text-amber-100/80 bg-amber-950/30 border border-amber-500/30 rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-amber-300" />
              <div>
                <p className="font-semibold text-amber-200 mb-1">
                  ระบบจะจดจำใบหน้าของคุณ (biometric data)
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>เก็บ vector ตัวเลข 128 มิติของใบหน้า + ชื่อ + ภาพ thumbnail</li>
                  <li>ใช้สำหรับทักทายเมื่อกลับมาใช้งานครั้งหน้า</li>
                  <li>
                    ลบข้อมูลตัวเองได้ทุกเมื่อจากปุ่ม{" "}
                    <strong className="text-amber-200">"ลบข้อมูลผม"</strong>
                  </li>
                  <li>เป็นไปตาม PDPA: คุณมีสิทธิ์ถอนความยินยอมและขอลบข้อมูล</li>
                </ul>
              </div>
            </div>
          </div>

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 h-4 w-4 accent-amber-500"
            />
            <span className="text-sm text-amber-100/90">
              ฉันยินยอมให้ระบบจัดเก็บข้อมูลใบหน้า (biometric) และชื่อของฉันไว้เพื่อการจดจำในอนาคต
            </span>
          </label>

          <div className="flex flex-wrap gap-2 justify-end pt-2">
            <Button variant="ghost" onClick={skip} disabled={submitting}>
              ข้าม (ไม่บันทึกชื่อ)
            </Button>
            <Button
              onClick={submit}
              disabled={!name.trim() || !consent || submitting}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {submitting ? "กำลังบันทึก..." : "ยินยอม + เริ่มวิเคราะห์"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
