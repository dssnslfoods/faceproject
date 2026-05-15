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
      <div className="absolute top-2 left-2 flex items-center gap-2 text-xs px-2 py-1 rounded-full bg-black/60 border border-amber-500/40">
        <span
          className={`inline-block w-2 h-2 rounded-full ${
            !ready ? "bg-amber-400 animate-pulse" : faceDetected ? "bg-emerald-400" : "bg-rose-400"
          }`}
        />
        <span className="text-amber-100/80">
          {!ready ? "กำลังโหลด AI..." : faceDetected ? "ตรวจพบใบหน้า" : "ไม่พบใบหน้า"}
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

  // Glow shadow for cyberpunk feel
  ctx.shadowColor = "#d4af37";
  ctx.shadowBlur = 6;

  // Face oval — outer boundary
  drawPolyline(ctx, FACE_REGIONS.faceOval.map(toPt), {
    color: "rgba(212, 175, 55, 0.85)",
    width: 2,
    closed: true,
  });

  // Eyebrows
  drawPolyline(ctx, FACE_REGIONS.leftEyebrow.map(toPt), {
    color: "rgba(255, 215, 0, 0.95)",
    width: 2,
  });
  drawPolyline(ctx, FACE_REGIONS.rightEyebrow.map(toPt), {
    color: "rgba(255, 215, 0, 0.95)",
    width: 2,
  });

  // Eyes
  drawPolyline(ctx, FACE_REGIONS.leftEye.map(toPt), {
    color: "rgba(255, 240, 150, 1)",
    width: 1.8,
    closed: true,
  });
  drawPolyline(ctx, FACE_REGIONS.rightEye.map(toPt), {
    color: "rgba(255, 240, 150, 1)",
    width: 1.8,
    closed: true,
  });

  // Nose bridge
  drawPolyline(ctx, FACE_REGIONS.noseBridge.map(toPt), {
    color: "rgba(255, 200, 100, 0.9)",
    width: 1.8,
  });

  // Lips
  drawPolyline(ctx, FACE_REGIONS.outerLips.map(toPt), {
    color: "rgba(255, 120, 120, 0.95)",
    width: 1.8,
    closed: true,
  });
  drawPolyline(ctx, FACE_REGIONS.innerLips.map(toPt), {
    color: "rgba(255, 80, 80, 0.7)",
    width: 1.2,
    closed: true,
  });

  // Sparse mesh dots — every 8th landmark
  ctx.shadowBlur = 3;
  ctx.fillStyle = "rgba(212, 175, 55, 0.45)";
  for (let i = 0; i < landmarks.length; i += 8) {
    const p = toPt(i);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Labels — top of each region (after mirroring is undone via canvas transform)
  ctx.shadowBlur = 0;
  drawLabel(ctx, toPt(10), "หน้าผาก (天庭)", w);
  drawLabel(ctx, toPt(1), "จมูก (財帛)", w);
  drawLabel(ctx, toPt(13), "ปาก (水星)", w);
  drawLabel(ctx, toPt(33), "ตา (奸門)", w, true);
  drawLabel(ctx, toPt(263), "ตา (妻妾)", w);
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
  ctx.font = "600 13px 'Sarabun', sans-serif";
  ctx.textBaseline = "middle";
  const metrics = ctx.measureText(text);
  const padX = 6;
  const padY = 3;
  const boxW = metrics.width + padX * 2;
  const boxH = 18;
  const bx = leftSide ? x - boxW - 8 : x + 8;
  const by = y - boxH / 2;
  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.strokeStyle = "rgba(212,175,55,0.7)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(bx, by, boxW, boxH, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 230, 150, 0.95)";
  ctx.fillText(text, bx + padX, y);
  ctx.restore();
}
