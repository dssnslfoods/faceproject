import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  listPeople,
  deletePerson,
  clearAllPeople,
  type StoredPerson,
} from "@/lib/supabase";
import { X, Trash2, Users, Loader2, AlertTriangle } from "lucide-react";

interface Props {
  onClose: () => void;
}

export function ManageProfiles({ onClose }: Props) {
  const [people, setPeople] = useState<StoredPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await listPeople();
    setPeople(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const removeOne = async (p: StoredPerson) => {
    if (!confirm(`ลบ profile ของ "${p.name}" ออกถาวร?`)) return;
    setBusy(true);
    try {
      await deletePerson(p.id);
      setPeople((arr) => arr.filter((x) => x.id !== p.id));
    } catch (e: any) {
      alert("ลบไม่สำเร็จ: " + e.message);
    } finally {
      setBusy(false);
    }
  };

  const clearAll = async () => {
    if (people.length === 0) return;
    if (
      !confirm(
        `ลบ profiles ทั้งหมด ${people.length} รายการออกถาวร? ไม่สามารถกู้คืนได้`
      )
    )
      return;
    setBusy(true);
    try {
      await clearAllPeople();
      setPeople([]);
    } catch (e: any) {
      alert("ลบไม่สำเร็จ: " + e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <Card className="w-full max-w-2xl max-h-[85vh] flex flex-col ring-gradient">
        <CardHeader className="flex-row items-start justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-electric flex items-center justify-center shadow-glow shrink-0">
              <Users className="h-5 w-5 text-slate-950" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg md:text-xl">Stored Biometric Profiles</CardTitle>
              <p className="text-xs text-slate-400 font-mono uppercase tracking-wider mt-0.5">
                {loading ? "Loading..." : `${people.length} profile${people.length === 1 ? "" : "s"}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white shrink-0 p-1"
            aria-label="close"
          >
            <X className="h-5 w-5" />
          </button>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto space-y-2 pb-4">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-cyan-300">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-sm font-mono">FETCHING...</span>
            </div>
          ) : people.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm font-th">
              ยังไม่มี profile ที่บันทึกไว้
            </div>
          ) : (
            people.map((p) => (
              <div
                key={p.id}
                className="glass rounded-xl p-3 flex items-center gap-3"
              >
                {p.thumbnail ? (
                  <img
                    src={p.thumbnail}
                    alt={p.name}
                    className="w-12 h-12 rounded-lg object-cover border border-cyan-400/30 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-slate-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-100 font-th truncate">
                    {p.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {p.visit_count} visit{p.visit_count === 1 ? "" : "s"} ·{" "}
                    last {new Date(p.last_seen).toLocaleDateString("th-TH")}
                  </div>
                </div>
                <Badge variant="cyan" className="hidden sm:inline-flex shrink-0">
                  #{p.id.slice(0, 4)}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeOne(p)}
                  disabled={busy}
                  className="text-rose-300 hover:bg-rose-500/10 shrink-0"
                  aria-label="delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>

        {!loading && people.length > 0 && (
          <div className="border-t border-slate-800/60 p-3 sm:p-4 shrink-0">
            <div className="flex items-center gap-2 text-xs text-amber-300 mb-3 font-th">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span>หากระบบจำหน้าผิด แนะนำให้ลบ profile เดิมแล้วบันทึกใหม่ในที่แสงดี</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              disabled={busy}
              className="w-full text-rose-300 hover:bg-rose-500/10"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              ลบ profiles ทั้งหมด ({people.length})
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
