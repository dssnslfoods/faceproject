import { useAppStore } from "@/lib/store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PalaceCard } from "./PalaceCard";
import { ChatPanel } from "./ChatPanel";
import { exportToPdf } from "@/lib/pdf-export";
import { Button } from "@/components/ui/button";
import { Download, RotateCcw, Trash2 } from "lucide-react";
import { deletePerson } from "@/lib/supabase";

export function FaceAnalysisResult() {
  const { reading, capturedImage, reset, person, setPerson } = useAppStore();
  if (!reading) return null;

  const onDeleteMe = async () => {
    if (!person) return;
    if (!confirm(`ลบข้อมูลใบหน้าและชื่อ "${person.name}" ออกจากระบบถาวร?`)) return;
    try {
      await deletePerson(person.id);
      setPerson(null);
      alert("ลบข้อมูลของคุณเรียบร้อยแล้ว");
    } catch (e: any) {
      alert("ลบไม่สำเร็จ: " + e.message);
    }
  };

  return (
    <div id="result-root" className="max-w-5xl mx-auto p-2 md:p-4 space-y-6">
      {person && (
        <div
          className={`text-center p-4 rounded-xl border ${
            person.isReturning
              ? "border-emerald-500/40 bg-emerald-950/20"
              : "border-amber-500/40 bg-amber-950/20"
          }`}
        >
          <p className="font-serif text-xl md:text-2xl text-amber-200">
            {person.isReturning
              ? `ยินดีต้อนรับกลับ คุณ ${person.name} 🙏`
              : `ยินดีที่ได้รู้จัก คุณ ${person.name} ✨`}
          </p>
          {person.isReturning && (
            <p className="text-sm text-emerald-200/70 mt-1">
              นี่คือครั้งที่ {person.visitCount} ที่พิจารณาโหงวเฮ้ง
            </p>
          )}
        </div>
      )}

      <Card className="bg-gradient-to-br from-red-950/60 to-black border-amber-500/40">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start">
            {capturedImage && (
              <img
                src={capturedImage}
                alt="ภาพที่วิเคราะห์"
                className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-lg border-2 border-amber-500/40 shrink-0"
              />
            )}
            <div className="flex-1">
              <CardTitle className="font-serif text-amber-200 text-2xl">
                ภาพรวมโหงวเฮ้ง
              </CardTitle>
              <Badge
                variant="outline"
                className="mt-2 w-fit border-amber-500 text-amber-300 bg-amber-500/10"
              >
                ธาตุเด่น: {reading.fiveElements.dominant}
              </Badge>
              <p className="text-amber-50/90 leading-relaxed mt-3">
                {reading.overallImpression}
              </p>
              <p className="mt-3 text-sm text-amber-100/70">
                <strong>วิเคราะห์ธาตุ:</strong> {reading.fiveElements.reasoning}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="palaces" className="w-full">
        <TabsList className="bg-red-950/50 border border-amber-500/30">
          <TabsTrigger value="palaces">12 พระราชวัง</TabsTrigger>
          <TabsTrigger value="sections">3 ภาค</TabsTrigger>
          <TabsTrigger value="phases">ดวงชะตา</TabsTrigger>
          <TabsTrigger value="summary">สรุป</TabsTrigger>
        </TabsList>

        <TabsContent value="palaces" className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {reading.twelvePalaces.map((p) => (
            <PalaceCard key={p.id} palace={p} />
          ))}
        </TabsContent>

        <TabsContent value="sections" className="space-y-3 mt-4">
          {(
            [
              { key: "upper", label: "ภาคบน · หน้าผาก", age: "อายุ 1–30" },
              { key: "middle", label: "ภาคกลาง · คิ้ว–จมูก", age: "อายุ 31–50" },
              { key: "lower", label: "ภาคล่าง · ปาก–คาง", age: "อายุ 51 ขึ้นไป" },
            ] as const
          ).map(({ key, label, age }) => {
            const sec = reading.threeSections[key];
            return (
              <Card key={key} className="border-amber-500/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-serif text-amber-200 text-lg">{label}</CardTitle>
                    <span className="text-xs text-amber-100/60">{age}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-amber-100/90 text-sm">
                    <strong className="text-amber-300">ลักษณะ:</strong> {sec.quality}
                  </p>
                  <p className="text-amber-50/85 text-sm mt-2">
                    <strong className="text-amber-300">ความหมาย:</strong> {sec.meaning}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="phases" className="space-y-3 mt-4">
          {(
            [
              { key: "early", label: "ดวงต้น" },
              { key: "middle", label: "ดวงกลาง" },
              { key: "late", label: "ดวงปลาย" },
            ] as const
          ).map(({ key, label }) => (
            <Card key={key} className="border-amber-500/30">
              <CardHeader>
                <CardTitle className="font-serif text-amber-200 text-lg">{label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-amber-50/85 text-sm leading-relaxed">
                  {reading.lifePhases[key]}
                </p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="summary" className="mt-4 space-y-4">
          <Card className="border-emerald-500/30">
            <CardHeader>
              <CardTitle className="font-serif text-emerald-300 text-lg">จุดแข็ง</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-amber-50/90 text-sm space-y-1">
                {reading.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-rose-500/30">
            <CardHeader>
              <CardTitle className="font-serif text-rose-300 text-lg">พึงระวัง</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-amber-50/90 text-sm space-y-1">
                {reading.cautions.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-amber-500/40 bg-amber-950/20">
            <CardHeader>
              <CardTitle className="font-serif text-amber-300 text-lg">คำแนะนำซินแส</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-amber-50/90 text-sm leading-relaxed font-serif">
                {reading.advice}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ChatPanel />

      <div className="flex gap-3 justify-center pt-4">
        <Button onClick={() => exportToPdf("result-root", "โหงวเฮ้ง.pdf")}>
          <Download className="mr-2 h-4 w-4" />
          บันทึก PDF
        </Button>
        <Button variant="outline" onClick={reset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          ดูใหม่
        </Button>
        {person && (
          <Button
            variant="ghost"
            onClick={onDeleteMe}
            className="text-rose-300 hover:bg-rose-500/10"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            ลบข้อมูลผม
          </Button>
        )}
      </div>
    </div>
  );
}
