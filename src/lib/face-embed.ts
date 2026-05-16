import * as faceapi from "@vladmandic/face-api";

const MODEL_URL = "https://vladmandic.github.io/face-api/model";

let loadPromise: Promise<void> | null = null;

export function loadFaceModels(): Promise<void> {
  if (!loadPromise) {
    loadPromise = (async () => {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
    })();
  }
  return loadPromise;
}

/** Compute 128-dim FaceNet descriptor from an image element or video element */
export async function computeDescriptor(
  source: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<number[] | null> {
  await loadFaceModels();
  // Use larger inputSize (416) and stricter score threshold for higher-quality
  // embeddings. Slightly slower but much better recognition accuracy.
  const result = await faceapi
    .detectSingleFace(
      source,
      new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.55 })
    )
    .withFaceLandmarks()
    .withFaceDescriptor();
  if (!result) return null;
  return Array.from(result.descriptor);
}

/** Compute descriptor from a base64 dataURL */
export async function computeDescriptorFromDataUrl(dataUrl: string): Promise<number[] | null> {
  const img = await loadImage(dataUrl);
  return computeDescriptor(img);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
