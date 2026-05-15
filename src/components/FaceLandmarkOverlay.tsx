import { useEffect, useRef, useState } from "react";
import type Webcam from "react-webcam";
import { getFaceLandmarker, FACE_REGIONS } from "@/lib/face-landmarks";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

interface Props {
  webcamRef: React.RefObject<Webcam | null>;
  mirrored?: boolean;
  onFaceDetectedChange?: (detected: boolean) => void;
}

type Pt = { x: number; y: number };

export function FaceLandmarkOverlay({ webcamRef, mirrored = true, onFaceDetectedChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(-1);
  const [ready, setReady] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let landmarker: Awaited<ReturnType<typeof getFaceLandmarker>> | null = null;

    const loop = () => {
      const video = webcamRef.current?.video as HTMLVideoElement | undefined;
      const canvas = canvasRef.current;
      if (!video || !canvas || !landmarker || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const w = video.videoWidth;
      const h = video.videoHeight;
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;

      const now = performance.now();
      // throttle to ~30fps and ensure monotonic timestamps
      if (now - lastTimeRef.current >= 30) {
        try {
          const result = landmarker.detectForVideo(video, now);
          lastTimeRef.current = now;
          const ctx = canvas.getContext("2d")!;
          ctx.clearRect(0, 0, w, h);

          if (result.faceLandmarks && result.faceLandmarks.length > 0) {
            setFaceDetected((prev) => {
              if (!prev) onFaceDetectedChange?.(true);
              return true;
            });
            drawFace(ctx, result.faceLandmarks[0], w, h, mirrored);
          } else {
            setFaceDetected((prev) => {
              if (prev) onFaceDetectedChange?.(false);
              return false;
            });
          }
        } catch (err) {
          // ignore transient detect errors
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    (async () => {
      try {
        landmarker = await getFaceLandmarker();
        if (cancelled) return;
        setReady(true);
        loop();
      } catch (err) {
        console.error("Face landmarker init failed:", err);
      }
    })();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [webcamRef, mirrored]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ transform: mirrored ? "scaleX(-1)" : undefined }}
      />
      <div className="absolute top-3 left-3 flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg glass border border-cyan-400/30 font-mono">
        <span
          className={`inline-block w-2 h-2 rounded-full ${
            !ready ? "bg-amber-400 animate-pulse" : faceDetected ? "bg-emerald-400 pulse-glow" : "bg-rose-400"
          }`}
        />
        <span className="text-slate-200 uppercase tracking-wider">
          {!ready ? "INIT AI" : faceDetected ? "FACE LOCKED" : "SCANNING"}
        </span>
      </div>
    </>
  );
}

function drawFace(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  w: number,
  h: number,
  _mirrored: boolean
) {
  const toPt = (i: number): Pt => ({ x: landmarks[i].x * w, y: landmarks[i].y * h });

  ctx.shadowColor = "#00e5ff";
  ctx.shadowBlur = 8;

  drawPolyline(ctx, FACE_REGIONS.faceOval.map(toPt), {
    color: "rgba(0, 229, 255, 0.85)",
    width: 1.8,
    closed: true,
  });

  drawPolyline(ctx, FACE_REGIONS.leftEyebrow.map(toPt), {
    color: "rgba(0, 229, 255, 0.95)",
    width: 1.8,
  });
  drawPolyline(ctx, FACE_REGIONS.rightEyebrow.map(toPt), {
    color: "rgba(0, 229, 255, 0.95)",
    width: 1.8,
  });

  drawPolyline(ctx, FACE_REGIONS.leftEye.map(toPt), {
    color: "rgba(168, 247, 255, 1)",
    width: 1.6,
    closed: true,
  });
  drawPolyline(ctx, FACE_REGIONS.rightEye.map(toPt), {
    color: "rgba(168, 247, 255, 1)",
    width: 1.6,
    closed: true,
  });

  drawPolyline(ctx, FACE_REGIONS.noseBridge.map(toPt), {
    color: "rgba(125, 154, 255, 0.9)",
    width: 1.6,
  });

  drawPolyline(ctx, FACE_REGIONS.outerLips.map(toPt), {
    color: "rgba(168, 85, 247, 0.95)",
    width: 1.6,
    closed: true,
  });
  drawPolyline(ctx, FACE_REGIONS.innerLips.map(toPt), {
    color: "rgba(168, 85, 247, 0.7)",
    width: 1.2,
    closed: true,
  });

  ctx.shadowBlur = 3;
  ctx.fillStyle = "rgba(0, 229, 255, 0.45)";
  for (let i = 0; i < landmarks.length; i += 8) {
    const p = toPt(i);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.1, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.shadowBlur = 0;
  drawLabel(ctx, toPt(10), "FOREHEAD", w);
  drawLabel(ctx, toPt(1), "NOSE", w);
  drawLabel(ctx, toPt(13), "MOUTH", w);
  drawLabel(ctx, toPt(33), "L · EYE", w, true);
  drawLabel(ctx, toPt(263), "R · EYE", w);
}

function drawPolyline(
  ctx: CanvasRenderingContext2D,
  pts: Pt[],
  opts: { color: string; width: number; closed?: boolean }
) {
  if (pts.length === 0) return;
  ctx.strokeStyle = opts.color;
  ctx.lineWidth = opts.width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  if (opts.closed) ctx.closePath();
  ctx.stroke();
}

function drawLabel(
  ctx: CanvasRenderingContext2D,
  anchor: Pt,
  text: string,
  canvasW: number,
  leftSide = false
) {
  ctx.save();
  // Counter-flip so text reads correctly when overlay is mirrored
  ctx.translate(canvasW, 0);
  ctx.scale(-1, 1);
  const x = canvasW - anchor.x;
  const y = anchor.y;
  ctx.font = "600 11px 'JetBrains Mono', ui-monospace, monospace";
  ctx.textBaseline = "middle";
  const metrics = ctx.measureText(text);
  const padX = 6;
  const _padY = 3; void _padY;
  const boxW = metrics.width + padX * 2;
  const boxH = 18;
  const bx = leftSide ? x - boxW - 8 : x + 8;
  const by = y - boxH / 2;
  ctx.fillStyle = "rgba(5, 8, 22, 0.75)";
  ctx.strokeStyle = "rgba(0, 229, 255, 0.7)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(bx, by, boxW, boxH, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(168, 247, 255, 0.95)";
  ctx.fillText(text, bx + padX, y);
  ctx.restore();
}
