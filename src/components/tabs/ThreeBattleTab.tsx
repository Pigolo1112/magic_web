'use client';

import React, { useState } from 'react';
import { ThreeBattleArena } from '@/components/ThreeBattleArena';
import { HandSpellCanvas } from '@/components/HandSpellCanvas';
import { SpellCastFX } from '@/components/SpellCastFX';
import { DetectedGesture } from '@/lib/handTracker';
import { Sparkles, Swords } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  onReward: (exp: number, gold: number, crystal: number) => void;
}

export const ThreeBattleTab: React.FC<Props> = ({ onReward }) => {
  const [castSpellTrigger, setCastSpellTrigger] = useState<{
    type: 'fire' | 'ice' | 'thunder' | 'wind' | 'light' | 'shadow';
    id: number;
  } | null>(null);

  const [activeSpellFX, setActiveSpellFX] = useState<{
    type: 'fire' | 'ice' | 'thunder' | 'wind' | 'light' | 'shadow' | 'levelup';
    name: string;
  } | null>(null);

  const handleCastSpell = (gesture: DetectedGesture) => {
    if (!gesture) return;

    // 1. Set 3D arena projectile trigger
    setCastSpellTrigger({
      type: gesture,
      id: Date.now(),
    });

    // 2. Trigger Visual Spell Burst Overlay
    const namesMap: Record<string, string> = {
      fire: 'Fire Ball',
      ice: 'Ice Spike',
      thunder: 'Thunder Bolt',
      wind: 'Wind Blade',
      light: 'Holy Shield',
    };

    setActiveSpellFX({
      type: gesture,
      name: namesMap[gesture] || 'Elemental Spell',
    });

    // 3. Trigger Particle Fireworks Explosion
    const colorsMap: Record<string, string[]> = {
      fire: ['#f97316', '#ef4444', '#facc15'],
      ice: ['#06b6d4', '#38bdf8', '#ffffff'],
      thunder: ['#facc15', '#eab308', '#a855f7'],
      wind: ['#10b981', '#34d399', '#6ee7b7'],
      light: ['#fbbf24', '#fef08a', '#ffffff'],
    };

    confetti({
      particleCount: 60,
      spread: 80,
      origin: { y: 0.6 },
      colors: colorsMap[gesture] || ['#fbbf24', '#a855f7'],
    });
  };

  return (
    <div className="space-y-6">
      {/* Visual FX Overlay */}
      <SpellCastFX
        spellType={activeSpellFX?.type || null}
        spellName={activeSpellFX?.name}
        onComplete={() => setActiveSpellFX(null)}
      />

      {/* 3D Battle Header */}
      <div className="glass-panel p-6 rounded-3xl border border-amber-400/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl font-extrabold glow-text-gold flex items-center justify-center md:justify-start gap-2">
            <Swords className="w-7 h-7 text-amber-400" />
            <span>ศึกประลองมนตรา 3D (3D MediaPipe Spell Battle)</span>
          </h2>
          <p className="text-sm text-purple-200">
            เปิดกล้อง Webcam วาดรูนเวทมนตร์ด้วยปลายนิ้วกลางอากาศเพื่อยิงพลังใส่ศัตรู 3D ในสนามประลอง!
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-amber-950/80 border border-amber-400/50 text-amber-300 text-sm font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>3D WebGL + MediaPipe AI Engine</span>
        </div>
      </div>

      {/* Main Grid: 3D Arena on Top/Left, Hand Drawing Pad below */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 3D Battle Arena View */}
        <div className="lg:col-span-7">
          <ThreeBattleArena onMonsterDefeated={onReward} castSpellTrigger={castSpellTrigger} />
        </div>

        {/* Hand Spell Drawing Canvas */}
        <div className="lg:col-span-5 space-y-4">
          <HandSpellCanvas onCastSpell={handleCastSpell} />
        </div>
      </div>
    </div>
  );
};
