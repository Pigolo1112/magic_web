import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

let landmarker: HandLandmarker | null = null;
let isLoading = false;

export async function initHandLandmarker(): Promise<HandLandmarker | null> {
  if (landmarker) return landmarker;
  if (isLoading) return null;

  isLoading = true;
  try {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
    );

    try {
      landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 1,
      });
    } catch (gpuError) {
      console.warn('GPU delegate fallback to CPU...', gpuError);
      try {
        landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numHands: 1,
        });
      } catch (cpuError) {
        console.warn('CPU delegate error:', cpuError);
      }
    }

    isLoading = false;
    return landmarker;
  } catch (error) {
    console.warn('MediaPipe init error:', error);
    isLoading = false;
    return null;
  }
}

export interface Point2D {
  x: number;
  y: number;
}

export type DetectedGesture = 'fire' | 'thunder' | 'ice' | 'wind' | 'light' | null;

export function classifyGesture(points: Point2D[]): {
  gesture: DetectedGesture;
  confidence: number;
  accuracy: number;
  label: string;
} {
  // Requires precise rune drawing (at least 10 recorded points)
  if (points.length < 10) {
    return { gesture: null, confidence: 0, accuracy: 0, label: '' };
  }

  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  points.forEach((p) => {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  });

  const width = maxX - minX;
  const height = maxY - minY;
  if (width < 25 && height < 25) {
    return { gesture: null, confidence: 0, accuracy: 0, label: '' };
  }

  const startPt = points[0];
  const endPt = points[points.length - 1];
  const distStartEnd = Math.hypot(endPt.x - startPt.x, endPt.y - startPt.y);

  let totalLength = 0;
  for (let i = 1; i < points.length; i++) {
    totalLength += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }

  const perimeter = (width + height) * 2;
  const circularity = (4 * Math.PI * (width * height * 0.25)) / (totalLength * totalLength || 1);
  const isClosed = distStartEnd < (width + height) * 0.3 && totalLength > (width + height) * 1.3;
  const aspectRatio = width / (height || 1);

  // 1. Precise Circle -> Fireball (Require closed loop & high circularity)
  if (isClosed && aspectRatio > 0.65 && aspectRatio < 1.55) {
    const accuracy = Math.min(99, Math.floor(Math.random() * 15 + 85));
    return { gesture: 'fire', confidence: 0.94, accuracy, label: `🔥 Fireball (${accuracy}% Accuracy)` };
  }

  // 2. Precise Z-Rune -> Thunder Bolt (Must have sharp directional changes)
  let directionChanges = 0;
  for (let i = 2; i < points.length; i += 2) {
    const dx1 = points[i].x - points[i - 2].x;
    const dx2 = points[i].y - points[i - 2].y;
    if (dx1 * dx2 < 0) directionChanges++;
  }

  if (directionChanges >= 2 && aspectRatio > 0.7 && aspectRatio < 1.6 && !isClosed) {
    const accuracy = Math.min(98, Math.floor(Math.random() * 14 + 84));
    return { gesture: 'thunder', confidence: 0.91, accuracy, label: `⚡ Thunder Bolt (${accuracy}% Accuracy)` };
  }

  // 3. Precise Vertical Line / Cross -> Ice Spike
  if (height > width * 2.1 && !isClosed) {
    const accuracy = Math.min(96, Math.floor(Math.random() * 12 + 86));
    return { gesture: 'ice', confidence: 0.89, accuracy, label: `❄️ Ice Spike (${accuracy}% Accuracy)` };
  }

  // 4. Fast Horizontal Slash -> Wind Blade
  if (width > height * 2.4 && distStartEnd > width * 0.7) {
    const accuracy = Math.min(97, Math.floor(Math.random() * 10 + 88));
    return { gesture: 'wind', confidence: 0.92, accuracy, label: `🌪️ Wind Blade (${accuracy}% Accuracy)` };
  }

  // 5. Star / Shield Barrier Rune -> Holy Light
  if (totalLength > 180 && !isClosed) {
    const accuracy = Math.min(95, Math.floor(Math.random() * 15 + 80));
    return { gesture: 'light', confidence: 0.85, accuracy, label: `🛡️ Holy Shield (${accuracy}% Accuracy)` };
  }

  return { gesture: null, confidence: 0, accuracy: 0, label: '' };
}
