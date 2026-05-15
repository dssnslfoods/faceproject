import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { askOracle } from "@/lib/gemini";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2, MessageSquare } from "lucide-react";

const SUGGESTED_QUESTIONS = [
  "เหมาะกับ role ไหนมากที่สุด ทำไม?",
  "ถ้าจะ promote เป็น team lead ต้อง develop อะไรเพิ่ม?",
  "เสนอคำถามสัมภาษณ์เชิงพฤติกรรม 5 ข้อ",
  "ถ้าผู้สมัครอยากเปลี่ยนสาย ควรไปทางไหน?",
  "Onboarding plan 30/60/90 วัน",
  "Course/Cert ที่ควร invest 6 เดือน",
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
    <div className="glass-strong rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-electric flex items-center justify-center">
          <MessageSquare className="h-4 w-4 text-slate-950" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-100">HR Consultation</h3>
          <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">
            Ask follow-up about this candidate
          </p>
        </div>
      </div>

      {chatHistory.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="text-xs px-3 py-1.5 rounded-full border border-slate-700 bg-slate-800/40 text-slate-300 hover:border-cyan-400/50 hover:bg-cyan-500/10 hover:text-cyan-200 transition-all font-th"
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
            className={`p-3 rounded-xl text-sm font-th leading-relaxed ${
              m.role === "user"
                ? "bg-cyan-500/10 border border-cyan-400/20 ml-12 text-slate-100"
                : "bg-slate-800/50 border border-slate-700/50 mr-12 text-slate-200 whitespace-pre-wrap"
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-cyan-300 text-sm font-mono">
            <Loader2 className="h-4 w-4 animate-spin" />
            ANALYZING...
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="ถามเกี่ยวกับ candidate นี้..."
          disabled={loading}
        />
        <Button variant="primary" onClick={() => send(input)} disabled={loading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
