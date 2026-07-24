'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  spellType: 'fire' | 'ice' | 'thunder' | 'wind' | 'light' | 'shadow' | 'levelup' | null;
  spellName?: string;
  onComplete: () => void;
}

export const SpellCastFX: React.FC<Props> = ({ spellType, spellName, onComplete }) => {
  useEffect(() => {
    if (!spellType) return;
    const timer = setTimeout(() => {
      onComplete();
    }, 1800);
    return () => clearTimeout(timer);
  }, [spellType, onComplete]);

  if (!spellType) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
        {/* Background Flash */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.4, 0] }}
          transition={{ duration: 0.6 }}
          className={`absolute inset-0 ${
            spellType === 'fire'
              ? 'bg-orange-600/30'
              : spellType === 'ice'
              ? 'bg-cyan-500/30'
              : spellType === 'thunder'
              ? 'bg-yellow-400/40'
              : spellType === 'wind'
              ? 'bg-emerald-500/30'
              : spellType === 'light'
              ? 'bg-amber-300/40'
              : spellType === 'shadow'
              ? 'bg-purple-900/50'
              : 'bg-yellow-400/50'
          }`}
        />

        {/* Visual FX Container */}
        <div className="relative flex flex-col items-center justify-center">
          {spellType === 'fire' && (
            <motion.div
              initial={{ scale: 0.2, rotate: -45, opacity: 0 }}
              animate={{ scale: [0.2, 1.8, 2.4, 0], rotate: 45, opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="w-48 h-48 rounded-full bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 shadow-[0_0_80px_rgba(249,115,22,0.9)] flex items-center justify-center text-7xl"
            >
              🔥
            </motion.div>
          )}

          {spellType === 'ice' && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: [0, 1.5, 2, 0], rotate: 0 }}
              transition={{ duration: 1.2, ease: 'backOut' }}
              className="w-48 h-48 rounded-3xl bg-gradient-to-tr from-cyan-600 via-blue-400 to-white shadow-[0_0_80px_rgba(6,182,212,0.9)] flex items-center justify-center text-7xl"
            >
              ❄️
            </motion.div>
          )}

          {spellType === 'thunder' && (
            <motion.div
              initial={{ y: -300, opacity: 0 }}
              animate={{ y: [ -300, 0, 10, 0 ], opacity: [0, 1, 1, 0], scale: [0.5, 2, 1.5, 0] }}
              transition={{ duration: 1.1 }}
              className="w-48 h-48 rounded-full bg-gradient-to-b from-yellow-300 via-amber-500 to-indigo-900 shadow-[0_0_90px_rgba(250,204,21,1)] flex items-center justify-center text-7xl"
            >
              ⚡
            </motion.div>
          )}

          {spellType === 'wind' && (
            <motion.div
              initial={{ scaleX: 0, rotate: 0 }}
              animate={{ scaleX: [0, 2.2, 0], rotate: [0, 360], opacity: [0, 1, 0] }}
              transition={{ duration: 1.2 }}
              className="w-56 h-16 rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 shadow-[0_0_70px_rgba(16,185,129,0.9)] flex items-center justify-center text-6xl"
            >
              🌪️
            </motion.div>
          )}

          {spellType === 'light' && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 2.5, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 1.3 }}
              className="w-52 h-52 rounded-full bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 shadow-[0_0_100px_rgba(251,191,36,1)] flex items-center justify-center text-7xl"
            >
              ☀️
            </motion.div>
          )}

          {spellType === 'shadow' && (
            <motion.div
              initial={{ scale: 0.1, opacity: 0 }}
              animate={{ scale: [0.1, 2.2, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 1.4 }}
              className="w-52 h-52 rounded-full bg-gradient-to-br from-purple-950 via-indigo-900 to-black shadow-[0_0_90px_rgba(168,85,247,0.9)] border border-purple-500/50 flex items-center justify-center text-7xl"
            >
              ☠️
            </motion.div>
          )}

          {spellType === 'levelup' && (
            <motion.div
              initial={{ scale: 0.2, y: 50, opacity: 0 }}
              animate={{ scale: [0.2, 1.3, 1], y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="glass-panel-gold px-8 py-6 rounded-2xl text-center border-2 border-yellow-400 flex flex-col items-center gap-2 shadow-[0_0_50px_rgba(251,191,36,0.6)]"
            >
              <div className="text-5xl animate-bounce">🌟 LEVEL UP! 🌟</div>
              <div className="text-xl font-bold text-yellow-300">ยินดีด้วย! คุณเลเวลสูงขึ้นแล้ว</div>
            </motion.div>
          )}

          {spellName && spellType !== 'levelup' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 px-6 py-2 rounded-full bg-black/70 border border-yellow-400/60 text-yellow-300 font-bold text-xl glow-text-gold tracking-widest uppercase"
            >
              Casting {spellName}!
            </motion.div>
          )}
        </div>
      </div>
    </AnimatePresence>
  );
};
