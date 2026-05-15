import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseEnabled = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = supabaseEnabled
  ? createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)
  : null;

export interface MatchedPerson {
  id: string;
  name: string;
  similarity: number;
  visit_count: number;
  last_seen: string;
}

const MATCH_THRESHOLD = 0.42; // cosine distance — lower = more similar; 0.42 is strict for FaceNet

export async function recognizeFace(embedding: number[]): Promise<MatchedPerson | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("match_face", {
    query_embedding: embedding,
    match_threshold: MATCH_THRESHOLD,
  });
  if (error) {
    console.error("recognizeFace error:", error);
    return null;
  }
  return (data && data[0]) || null;
}

export async function savePerson(
  name: string,
  embedding: number[],
  thumbnail?: string
): Promise<{ id: string } | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("people")
    .insert({ name, embedding, thumbnail: thumbnail ?? null })
    .select("id")
    .single();
  if (error) {
    console.error("savePerson error:", error);
    throw new Error("บันทึกข้อมูลใบหน้าไม่สำเร็จ: " + error.message);
  }
  return data;
}

export async function touchPerson(id: string): Promise<void> {
  if (!supabase) return;
  await supabase.rpc("touch_person", { p_id: id });
}

export async function deletePerson(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("people").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export interface StoredPerson {
  id: string;
  name: string;
  thumbnail: string | null;
  visit_count: number;
  created_at: string;
  last_seen: string;
}

export async function listPeople(): Promise<StoredPerson[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("people")
    .select("id, name, thumbnail, visit_count, created_at, last_seen")
    .order("last_seen", { ascending: false });
  if (error) {
    console.error("listPeople error:", error);
    return [];
  }
  return data || [];
}

export async function clearAllPeople(): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("people").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) throw new Error(error.message);
}
