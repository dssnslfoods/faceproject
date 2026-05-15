import { create } from "zustand";
import type { FaceReading, ChatMessage } from "@/types/face-reading";

type Stage = "intro" | "capture" | "loading" | "result";

interface AppState {
  stage: Stage;
  capturedImage: string | null;
  reading: FaceReading | null;
  chatHistory: ChatMessage[];
  error: string | null;

  setStage: (s: Stage) => void;
  setImage: (img: string | null) => void;
  setReading: (r: FaceReading | null) => void;
  addMessage: (m: ChatMessage) => void;
  setError: (e: string | null) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  stage: "intro",
  capturedImage: null,
  reading: null,
  chatHistory: [],
  error: null,

  setStage: (stage) => set({ stage }),
  setImage: (capturedImage) => set({ capturedImage }),
  setReading: (reading) => set({ reading }),
  addMessage: (m) => set((s) => ({ chatHistory: [...s.chatHistory, m] })),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      stage: "intro",
      capturedImage: null,
      reading: null,
      chatHistory: [],
      error: null,
    }),
}));
