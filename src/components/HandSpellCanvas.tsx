'use client';

import React, { useEffect, useRef, useState } from 'react';
import { initHandLandmarker, classifyGesture, Point2D, DetectedGesture } from '@/lib/handTracker';
import { playSoundFX } from '@/lib/audio';
import { Camera, CameraOff, Sparkles, RefreshCw, MoveUpRight, AlertCircle, Eye, Zap, Check } from 'lucide-react';

interface Props {
  onCastSpell: (gesture: DetectedGesture) => void;
}

export const HandSpellCanvas: React.FC<Props> = ({ onCastSpell }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isHandDetected, setIsHandDetected] = useState(false);
  const [detectedLabel, setDetectedLabel] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>('วาดเส้นคาถาค้างไว้บนกระดาน แล้วปล่อยนิ้วเพื่อร่ายมนตรา!');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Persistent Drawing Path
  const [persistentPoints, setPersistentPoints] = useState<Point2D[]>([]);
  const isDrawingRef = useRef(false);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const handleRejection = (e: PromiseRejectionEvent) => {
      if (e.reason && (e.reason instanceof Event || typeof e.reason === 'object')) {
        e.preventDefault();
      }
    };
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('unhandledrejection', handleRejection);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, []);

  // Redraw persistent canvas stroke
  const redrawCanvas = (points: Point2D[], currentHandJoints?: any[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw skeleton joints if camera active
    if (currentHandJoints && currentHandJoints.length > 0) {
      ctx.fillStyle = '#06b6d4';
      for (let i = 0; i < currentHandJoints.length; i++) {
        const pt = currentHandJoints[i];
        const px = (1 - pt.x) * canvas.width;
        const py = pt.y * canvas.height;
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Index tip pointer
      const tip = currentHandJoints[8];
      const tipX = (1 - tip.x) * canvas.width;
      const tipY = tip.y * canvas.height;

      ctx.save();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(tipX, tipY, 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 2. Draw Persistent Magic Stroke Line (ค้างเส้นวาดไว้บนจอ)
    if (points.length > 1) {
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 20;

      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }
  };

  // Start Camera
  const startCamera = async () => {
    setCameraError(null);
    setStatusMsg('กำลังโหลด MediaPipe Hand Tracking Engine...');

    try {
      const landmarker = await initHandLandmarker();
      if (!landmarker) {
        setCameraError('ไม่สามารถโหลด MediaPipe Engine ได้ กรุณารีเฟรชหน้าจอ');
        return;
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
      } catch (err1) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        video.muted = true;
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');

        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsCameraActive(true);
              setStatusMsg('🖐️ วาดเส้นในอากาศตามใจชอบ แล้วหยุดนิ้วเพื่อยิงคาถา!');
              detectLoop(landmarker);
            })
            .catch((err) => {
              console.warn('Video play promise caught:', err);
              setIsCameraActive(true);
              detectLoop(landmarker);
            });
        }
      }
    } catch (err: any) {
      console.warn('Camera access error caught:', err);
      setCameraError('Safari/Chrome ปฏิเสธการเข้าถึงกล้อง! กรุณาอนุญาต Camera Permission ในตั้งค่า');
    }
  };

  const stopCamera = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsHandDetected(false);
    setStatusMsg('ปิดกล้องแล้ว สามารถใช้นิ้ว/เมาส์วาดเส้นค้างบนกระดานได้');
  };

  // Hand Detection Loop with Persistent Trail
  const detectLoop = (landmarker: any) => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.videoWidth > 0 && video.videoHeight > 0 && !video.paused) {
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      const results = landmarker.detectForVideo(video, performance.now());

      if (results && results.landmarks && results.landmarks.length > 0) {
        setIsHandDetected(true);
        const hand = results.landmarks[0];
        const indexTip = hand[8];

        const tipX = (1 - indexTip.x) * canvas.width;
        const tipY = indexTip.y * canvas.height;

        setPersistentPoints((prev) => {
          const updated = [...prev, { x: tipX, y: tipY }];
          redrawCanvas(updated, hand);
          return updated;
        });
      } else {
        setIsHandDetected(false);
        // Hand left view -> evaluate persistent stroke if drawn
        setPersistentPoints((pts) => {
          if (pts.length >= 8) {
            evaluateSpellGesture(pts);
            return [];
          }
          return pts;
        });
      }
    }

    animFrameIdRef.current = requestAnimationFrame(() => detectLoop(landmarker));
  };

  // Evaluate Drawn Rune Gesture
  const evaluateSpellGesture = (points: Point2D[]) => {
    if (points.length < 5) return;

    const { gesture, label } = classifyGesture(points);
    if (gesture) {
      setDetectedLabel(label);
      playSoundFX('spell', gesture);
      onCastSpell(gesture);
      setTimeout(() => setDetectedLabel(null), 1800);
      setPersistentPoints([]);
    } else {
      playSoundFX('wrong');
      setStatusMsg('❌ รูนยังไม่ถูกต้อง! ลองวาดวงกลม ⭕ หรือสายฟ้า ⚡ ใหม่อีกครั้ง');
    }
  };

  // Mouse / Touch drawing handlers (Keep persistent line)
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    setPersistentPoints([{ x, y }]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    setPersistentPoints((prev) => {
      const updated = [...prev, { x, y }];
      redrawCanvas(updated);
      return updated;
    });
  };

  const handleMouseUp = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    evaluateSpellGesture(persistentPoints);
  };

  const clearCanvas = () => {
    setPersistentPoints([]);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  return (
    <div className="space-y-4">
      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 glass-panel p-4 rounded-2xl border border-purple-500/30">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="font-extrabold text-sm sm:text-base text-amber-300">
            กระดานวาดคาถาสะสมเส้น (Persistent Spell Pad)
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isCameraActive ? (
            <button
              onClick={stopCamera}
              className="px-4 py-2 rounded-xl bg-rose-900/80 text-rose-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-rose-800"
            >
              <CameraOff className="w-4 h-4" /> ปิดกล้อง
            </button>
          ) : (
            <button
              onClick={startCamera}
              className="px-4 py-2 rounded-xl glass-button text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.3)]"
            >
              <Camera className="w-4 h-4 text-amber-300" /> เปิดกล้อง Webcam (MediaPipe)
            </button>
          )}

          <button
            onClick={() => evaluateSpellGesture(persistentPoints)}
            disabled={persistentPoints.length === 0}
            className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-amber-300 disabled:opacity-50"
          >
            <Zap className="w-4 h-4" /> ร่ายมนตรา (Cast)
          </button>

          <button
            onClick={clearCanvas}
            className="p-2 rounded-xl glass-panel text-purple-200 hover:text-white border border-purple-500/30 cursor-pointer"
            title="ล้างเส้นวาด"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="px-4 py-2 rounded-xl bg-purple-950/80 border border-purple-500/30 text-xs font-semibold text-purple-200 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Eye className={`w-4 h-4 ${isHandDetected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
          <span>{statusMsg}</span>
        </span>
        <span className="text-amber-300 font-bold text-xs">
          เส้นที่วาดไว้: {persistentPoints.length} จุด
        </span>
      </div>

      {/* Camera Alert */}
      {cameraError && (
        <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-400/50 text-rose-200 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Canvas Video Pad Container */}
      <div className="relative w-full h-[280px] sm:h-[320px] rounded-3xl overflow-hidden glass-panel border border-amber-400/30 shadow-inner flex items-center justify-center bg-black/60">
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 ${
            isCameraActive ? 'block' : 'hidden'
          }`}
          playsInline
          muted
          autoPlay
        />

        <canvas
          ref={canvasRef}
          width={640}
          height={360}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="absolute inset-0 w-full h-full cursor-crosshair z-10"
        />

        {!isCameraActive && persistentPoints.length === 0 && (
          <div className="text-center p-6 space-y-2 pointer-events-none z-20">
            <MoveUpRight className="w-8 h-8 text-amber-400 mx-auto animate-bounce" />
            <p className="text-sm font-bold text-amber-200">
              วาดเส้นคาถาสะสมบนกระดานนี้! เส้นจะค้างไว้จนกว่าจะปล่อยมือ
            </p>
            <p className="text-xs text-purple-300">
              ⭕ วาดวงกลม = บอลเพลิง | ⚡ วาดสายฟ้า = อัศนีบาต | 🛡️ วาดดาว = โล่ป้องกัน
            </p>
          </div>
        )}

        {detectedLabel && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-6 py-2.5 rounded-full bg-amber-400 text-slate-950 font-extrabold text-base shadow-[0_0_30px_rgba(251,191,36,0.9)] animate-bounce">
            ✨ {detectedLabel} UNLEASHED!
          </div>
        )}
      </div>

      {/* Quick Spell Buttons Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        {[
          { id: 'fire', label: '⭕ Fireball', icon: '🔥', btnBg: 'from-orange-600 to-red-600' },
          { id: 'ice', label: '❄️ Ice Spike', icon: '❄️', btnBg: 'from-cyan-600 to-blue-600' },
          { id: 'thunder', label: '⚡ Thunder Bolt', icon: '⚡', btnBg: 'from-amber-500 to-yellow-600' },
          { id: 'wind', label: '🌪️ Wind Blade', icon: '🌪️', btnBg: 'from-emerald-600 to-teal-600' },
          { id: 'light', label: '🛡️ Holy Shield', icon: '✨', btnBg: 'from-amber-400 to-yellow-500' },
        ].map((sp) => (
          <button
            key={sp.id}
            onClick={() => {
              playSoundFX('spell', sp.id);
              onCastSpell(sp.id as any);
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-bold text-white bg-gradient-to-r ${sp.btnBg} cursor-pointer hover:scale-105 transition-all shadow-md`}
          >
            <span>{sp.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
