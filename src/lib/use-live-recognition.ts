import { useEffect, useRef, useState } from "react";
import type Webcam from "react-webcam";
import { computeDescriptor, loadFaceModels } from "@/lib/face-embed";
import { recognizeFace, supabaseEnabled, type MatchedPerson } from "@/lib/supabase";

interface Result {
  recognized: MatchedPerson | null;
  scanning: boolean;
  embedding: number[] | null;
}

/**
 * Periodically samples the webcam when a face is detected,
 * computes the FaceNet descriptor, and queries Supabase for a match.
 *
 * - Throttled to every ~2.5s while face is steady
 * - Resets when face is lost or webcam unmounts
 * - Caches latest embedding so the parent can reuse it on capture
 */
export function useLiveRecognition(
  webcamRef: React.RefObject<Webcam | null>,
  faceDetected: boolean,
  enabled: boolean
): Result {
  const [recognized, setRecognized] = useState<MatchedPerson | null>(null);
  const [scanning, setScanning] = useState(false);
  const embeddingRef = useRef<number[] | null>(null);
  const inFlightRef = useRef(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !supabaseEnabled) return;

    if (!faceDetected) {
      setRecognized(null);
      embeddingRef.current = null;
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    let cancelled = false;

    // Pre-warm models so first sample isn't slow
    loadFaceModels().catch(() => {});

    const sample = async () => {
      if (inFlightRef.current || cancelled) return;
      const video = webcamRef.current?.video as HTMLVideoElement | undefined;
      if (!video || video.readyState < 2) return;

      inFlightRef.current = true;
      setScanning(true);
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(video, 0, 0);

        const desc = await computeDescriptor(canvas);
        if (cancelled || !desc) return;
        embeddingRef.current = desc;

        const match = await recognizeFace(desc);
        if (cancelled) return;
        setRecognized(match);

        // If we got a confident match, slow down further sampling
        if (match) {
          if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = window.setInterval(sample, 8000);
          }
        }
      } catch (err) {
        // Ignore transient errors (network blip, no face found)
      } finally {
        inFlightRef.current = false;
        setScanning(false);
      }
    };

    // First sample after 1.2s of steady detection, then every 2.5s
    const initialTimer = window.setTimeout(() => {
      sample();
      intervalRef.current = window.setInterval(sample, 2500);
    }, 1200);

    return () => {
      cancelled = true;
      window.clearTimeout(initialTimer);
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [faceDetected, enabled, webcamRef]);

  return { recognized, scanning, embedding: embeddingRef.current };
}

export function useLiveRecognitionEmbeddingRef() {
  // helper kept simple for callers that need the latest embedding
  return useRef<number[] | null>(null);
}
