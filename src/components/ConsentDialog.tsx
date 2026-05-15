import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { savePerson } from "@/lib/supabase";
import { analyzeFace } from "@/lib/gemini";
import { ShieldCheck, AlertTriangle, UserPlus } from "lucide-react";

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
      const saved = await savePerson(name.trim(), pendingEmbedding, capturedImage);
      if (saved) {
        setPerson({
          id: saved.id,
          name: name.trim(),
          visitCount: 1,
          isReturning: false,
        });
      }
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
    <div className="max-w-xl mx-auto animate-fade-in">
      <Card className="ring-gradient">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-electric flex items-center justify-center shadow-glow">
              <UserPlus className="h-5 w-5 text-slate-950" />
            </div>
            <div>
              <CardTitle className="text-xl">New Candidate Profile</CardTitle>
              <p className="text-xs text-slate-400 font-mono uppercase tracking-wider mt-0.5">
                PDPA · Biometric Consent Required
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {capturedImage && (
            <img
              src={capturedImage}
              alt="Capture"
              className="w-32 h-32 object-cover rounded-xl border border-cyan-400/40 mx-auto shadow-glow"
            />
          )}

          <div>
            <label className="text-xs text-cyan-300 uppercase tracking-wider font-mono mb-1.5 block">
              Candidate Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Arnon Arpaket"
              maxLength={80}
              autoFocus
            />
          </div>

          <div className="text-xs text-slate-300 glass rounded-xl p-3 space-y-2">
            <div className="flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0 text-cyan-400" />
              <div>
                <p className="font-semibold text-slate-100 mb-1">
                  Biometric Data Storage Notice
                </p>
                <ul className="space-y-1 text-slate-400 font-th">
                  <li>· เก็บ FaceNet vector 128 มิติ + ชื่อ + thumbnail</li>
                  <li>· ใช้สำหรับจดจำผู้สมัคร / พนักงานที่กลับมา</li>
                  <li>· ลบข้อมูลตัวเองได้ทุกเมื่อจากปุ่ม "ลบ Biometric Profile"</li>
                  <li>· ภายใต้ PDPA: คุณมีสิทธิ์ถอนความยินยอมและขอลบ</li>
                </ul>
              </div>
            </div>
          </div>

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 h-4 w-4 accent-cyan-500"
            />
            <span className="text-sm text-slate-200 font-th">
              ฉันยินยอมให้ระบบจัดเก็บข้อมูลใบหน้า (biometric) และชื่อของฉันไว้เพื่อการจดจำในอนาคต
            </span>
          </label>

          <div className="flex flex-wrap gap-2 justify-end pt-2">
            <Button variant="ghost" onClick={skip} disabled={submitting}>
              ข้าม (ไม่บันทึก)
            </Button>
            <Button
              variant="primary"
              onClick={submit}
              disabled={!name.trim() || !consent || submitting}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              {submitting ? "Saving..." : "ยินยอม + เริ่มวิเคราะห์"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
