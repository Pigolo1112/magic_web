'use client';

import React, { useEffect, useRef } from 'react';

interface Props {
  isNight?: boolean;
}

export const MagicBackground: React.FC<Props> = ({ isNight = true }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle Stars
    const starsCount = 120;
    const stars = Array.from({ length: starsCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.7,
      radius: Math.random() * 2 + 0.5,
      alpha: Math.random(),
      speed: Math.random() * 0.02 + 0.005,
      color: Math.random() > 0.3 ? '#e0e7ff' : '#fbbf24',
    }));

    // Magic Orbs / Sparkling particles
    const orbsCount = 25;
    const orbs = Array.from({ length: orbsCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -Math.random() * 0.6 - 0.2,
      radius: Math.random() * 4 + 2,
      alpha: Math.random() * 0.6 + 0.2,
      color: ['#c084fc', '#38bdf8', '#fbbf24', '#f43f5e'][Math.floor(Math.random() * 4)],
    }));

    // Castle spire positions (proportional)
    const renderCastle = (cCtx: CanvasRenderingContext2D, w: number, h: number) => {
      cCtx.save();
      const castleX = w * 0.5;
      const castleY = h * 0.72;
      const scale = Math.min(w, h) / 900;

      // Castle glow
      const glowGrad = cCtx.createRadialGradient(castleX, castleY - 100 * scale, 10, castleX, castleY - 100 * scale, 250 * scale);
      glowGrad.addColorStop(0, isNight ? 'rgba(147, 51, 234, 0.35)' : 'rgba(251, 191, 36, 0.4)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      cCtx.fillStyle = glowGrad;
      cCtx.beginPath();
      cCtx.arc(castleX, castleY - 100 * scale, 250 * scale, 0, Math.PI * 2);
      cCtx.fill();

      // Floating Island Base
      cCtx.fillStyle = isNight ? '#090514' : '#1e1438';
      cCtx.beginPath();
      cCtx.ellipse(castleX, castleY + 120 * scale, 180 * scale, 45 * scale, 0, 0, Math.PI * 2);
      cCtx.fill();

      // Floating Island Underside Crags
      cCtx.beginPath();
      cCtx.moveTo(castleX - 170 * scale, castleY + 120 * scale);
      cCtx.lineTo(castleX - 80 * scale, castleY + 220 * scale);
      cCtx.lineTo(castleX, castleY + 160 * scale);
      cCtx.lineTo(castleX + 90 * scale, castleY + 240 * scale);
      cCtx.lineTo(castleX + 170 * scale, castleY + 120 * scale);
      cCtx.closePath();
      cCtx.fill();

      // Main Keep Silhouette
      cCtx.fillRect(castleX - 70 * scale, castleY - 60 * scale, 140 * scale, 180 * scale);

      // Towers & Spires
      // Center Main Spire
      cCtx.beginPath();
      cCtx.moveTo(castleX - 35 * scale, castleY - 60 * scale);
      cCtx.lineTo(castleX, castleY - 190 * scale);
      cCtx.lineTo(castleX + 35 * scale, castleY - 60 * scale);
      cCtx.closePath();
      cCtx.fill();

      // Left Spire
      cCtx.fillRect(castleX - 110 * scale, castleY - 20 * scale, 40 * scale, 140 * scale);
      cCtx.beginPath();
      cCtx.moveTo(castleX - 115 * scale, castleY - 20 * scale);
      cCtx.lineTo(castleX - 90 * scale, castleY - 130 * scale);
      cCtx.lineTo(castleX - 65 * scale, castleY - 20 * scale);
      cCtx.closePath();
      cCtx.fill();

      // Right Spire
      cCtx.fillRect(castleX + 70 * scale, castleY - 20 * scale, 40 * scale, 140 * scale);
      cCtx.beginPath();
      cCtx.moveTo(castleX + 65 * scale, castleY - 20 * scale);
      cCtx.lineTo(castleX + 90 * scale, castleY - 130 * scale);
      cCtx.lineTo(castleX + 115 * scale, castleY - 20 * scale);
      cCtx.closePath();
      cCtx.fill();

      // Glowing Castle Windows
      cCtx.fillStyle = isNight ? '#fbbf24' : '#fff7ed';
      const windowWidth = 8 * scale;
      const windowHeight = 16 * scale;

      [
        { x: castleX - 20 * scale, y: castleY - 20 * scale },
        { x: castleX + 12 * scale, y: castleY - 20 * scale },
        { x: castleX - 94 * scale, y: castleY + 20 * scale },
        { x: castleX + 86 * scale, y: castleY + 20 * scale },
        { x: castleX - 4 * scale, y: castleY - 100 * scale },
      ].forEach((win) => {
        cCtx.fillRect(win.x, win.y, windowWidth, windowHeight);
      });

      cCtx.restore();
    };

    let time = 0;

    const draw = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (isNight) {
        skyGrad.addColorStop(0, '#06030f');
        skyGrad.addColorStop(0.5, '#130a2a');
        skyGrad.addColorStop(1, '#090514');
      } else {
        skyGrad.addColorStop(0, '#1e1438');
        skyGrad.addColorStop(0.5, '#3b1c68');
        skyGrad.addColorStop(1, '#180e2e');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw Twinkling Stars
      stars.forEach((s) => {
        s.alpha += Math.sin(time * 2 + s.x) * s.speed;
        const currentAlpha = Math.max(0.1, Math.min(1, s.alpha));
        ctx.fillStyle = s.color;
        ctx.globalAlpha = currentAlpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // Draw Floating Castle
      renderCastle(ctx, width, height);

      // Draw Rising Magic Orbs
      orbs.forEach((o) => {
        o.x += o.vx + Math.sin(time + o.y) * 0.2;
        o.y += o.vy;

        if (o.y < -10) {
          o.y = height + 10;
          o.x = Math.random() * width;
        }

        ctx.save();
        ctx.fillStyle = o.color;
        ctx.shadowColor = o.color;
        ctx.shadowBlur = 12;
        ctx.globalAlpha = o.alpha;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Drifting Ambient Fog
      const fogGrad = ctx.createLinearGradient(0, height * 0.65, 0, height);
      fogGrad.addColorStop(0, 'rgba(147, 51, 234, 0)');
      fogGrad.addColorStop(0.5, isNight ? 'rgba(79, 70, 229, 0.12)' : 'rgba(251, 191, 36, 0.15)');
      fogGrad.addColorStop(1, 'rgba(10, 6, 20, 0.8)');
      ctx.fillStyle = fogGrad;
      ctx.fillRect(0, height * 0.6, width, height * 0.4);

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isNight]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 w-full h-full" />;
};
