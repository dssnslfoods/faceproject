import { create } from "zustand";
import type { HRReport, ChatMessage } from "@/types/hr-report";

type Stage = "intro" | "capture" | "consent" | "loading" | "result";

export interface RecognizedPerson {
  id: string;
  name: string;
  visitCount: number;
  isReturning: boolean;
}

interface AppState {
  stage: Stage;
  capturedImage: string | null;
  reading: HRReport | null;
  chatHistory: ChatMessage[];
  error: string | null;
  person: RecognizedPerson | null;
  pendingEmbedding: number[] | null;

  setStage: (s: Stage) => void;
  setImage: (img: string | null) => void;
  setReading: (r: HRReport | null) => void;
  addMessage: (m: ChatMessage) => void;
  setError: (e: string | null) => void;
  setPerson: (p: RecognizedPerson | null) => void;
  setPendingEmbedding: (e: number[] | null) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  stage: "intro",
  capturedImage: null,
  reading: null,
  chatHistory: [],
  error: null,
  person: null,
  pendingEmbedding: null,

  setStage: (stage) => set({ stage }),
  setImage: (capturedImage) => set({ capturedImage }),
  setReading: (reading) => set({ reading }),
  addMessage: (m) => set((s) => ({ chatHistory: [...s.chatHistory, m] })),
  setError: (error) => set({ error }),
  setPerson: (person) => set({ person }),
  setPendingEmbedding: (pendingEmbedding) => set({ pendingEmbedding }),
  reset: () =>
    set({
      stage: "intro",
      capturedImage: null,
      reading: null,
      chatHistory: [],
      error: null,
      person: null,
      pendingEmbedding: null,
    }),
}));
