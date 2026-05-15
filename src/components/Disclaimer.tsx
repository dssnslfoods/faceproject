import { ShieldCheck, Info } from "lucide-react";

export function Disclaimer() {
  return (
    <div className="text-xs text-slate-300/80 glass rounded-xl p-4 space-y-2 text-left">
      <div className="flex items-start gap-2">
        <ShieldCheck className="h-4 w-4 mt-0.5 text-cyan-400 shrink-0" />
        <p>
          <strong className="text-slate-100">Privacy:</strong> ภาพและข้อมูลใบหน้าถูกประมวลผลแบบ
          end-to-end เข้ารหัสกับ Google Gemini API · ไม่บันทึกภาพต้นฉบับ
        </p>
      </div>
      <div className="flex items-start gap-2">
        <Info className="h-4 w-4 mt-0.5 text-amber-400 shrink-0" />
        <p>
          <strong className="text-slate-100">AI-Assisted Screening:</strong> รายงานนี้เป็น
          observational hypothesis ที่ต้อง <em>validate ผ่านสัมภาษณ์เชิงพฤติกรรม</em>{" "}
          และ structured assessment เสมอ — ไม่ใช้แทนคำตัดสินใจจ้างงาน
        </p>
      </div>
    </div>
  );
}
