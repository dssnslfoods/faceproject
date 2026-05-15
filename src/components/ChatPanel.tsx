import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { askOracle } from "@/lib/gemini";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";

const SUGGESTED_QUESTIONS = [
  "ปีนี้การงานเป็นอย่างไร",
  "การเงินช่วงนี้ดีไหม",
  "เนื้อคู่จะมาเมื่อไหร่",
  "สุขภาพต้องระวังอะไร",
  "เหมาะกับการลงทุนแบบใด",
  "ควรเปลี่ยนงานหรือไม่",
];

export function ChatPanel() {
  const { reading, chatHistory, addMessage } = useAppStore();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async (text: string) => {
    if (!text.trim() || !reading || loading) return;
    addMessage({ role: "user", content: text, timestamp: Date.now() });
    setInput("");
    setLoading(true);
    try {
      const answer = await askOracle(text, reading, chatHistory);
      addMessage({ role: "model", content: answer, timestamp: Date.now() });
    } catch (e: any) {
      addMessage({
        role: "model",
        content: `ขออภัย เกิดข้อผิดพลาด: ${e.message}`,
        timestamp: Date.now(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-amber-500/30 rounded-xl bg-black/40 p-4 space-y-3">
      <h3 className="font-serif text-amber-200 text-xl">ถามซินแส</h3>

      {chatHistory.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="text-sm px-3 py-1 rounded-full border border-amber-500/40 text-amber-200 hover:bg-amber-500/10"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <div className="max-h-96 overflow-y-auto space-y-2">
        {chatHistory.map((m, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg ${
              m.role === "user"
                ? "bg-red-900/40 ml-12 text-amber-50"
                : "bg-amber-950/40 mr-12 text-amber-100 font-serif whitespace-pre-wrap"
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-amber-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            ซินแสกำลังพิจารณา...
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="พิมพ์คำถาม..."
          disabled={loading}
        />
        <Button onClick={() => send(input)} disabled={loading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
