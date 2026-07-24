'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Trophy, BookOpen, Play } from 'lucide-react';
import { playSoundFX } from '@/lib/audio';

interface Props {
  onStartGame: () => void;
  onOpenHowToPlay: () => void;
  onOpenLeaderboard: () => void;
}

export const HeroSection: React.FC<Props> = ({
  onStartGame,
  onOpenHowToPlay,
  onOpenLeaderboard,
}) => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 z-10">
      {/* Academy Crest / Floating Icon */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="mb-6 relative"
      >
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-purple-900 via-indigo-700 to-amber-400 p-1 shadow-[0_0_50px_rgba(168,85,247,0.6)] animate-float-slow flex items-center justify-center">
          <div className="w-full h-full bg-slate-950/80 rounded-[22px] flex items-center justify-center text-5xl sm:text-6xl border border-amber-400/40">
            🧙‍♂️
          </div>
        </div>
        <div className="absolute -bottom-2 -right-2 bg-amber-400 text-slate-950 p-2 rounded-full shadow-lg text-sm font-bold flex items-center gap-1 animate-pulse">
          <Sparkles className="w-4 h-4" /> Magical RPG
        </div>
      </motion.div>

      {/* Main Titles */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="max-w-3xl space-y-4"
      >
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-purple-300 to-yellow-400 drop-shadow-[0_4px_20px_rgba(147,51,234,0.7)]">
          ยินดีต้อนรับสู่ <br />
          <span className="glow-text-gold">Arcane Academy</span>
        </h1>
        <p className="text-lg sm:text-xl text-purple-200/90 max-w-2xl mx-auto leading-relaxed font-light">
          สถาบันเวทมนตร์แห่งปราสาทลอยฟ้า! สวมบทบาทนักเรียนเวทมนตร์ ปลดล็อกคาถาทรงพลัง ทำภารกิจปริศนา และก้าวขึ้นสู่มหาจอมเวทอันดับหนึ่ง!
        </p>
      </motion.div>

      {/* Hero Buttons */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md"
      >
        <button
          onClick={() => {
            playSoundFX('click');
            onStartGame();
          }}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-button text-white font-bold text-lg flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:scale-105 transition-all cursor-pointer border border-amber-400/50"
        >
          <Play className="w-6 h-6 text-amber-300 fill-amber-300" />
          <span>เริ่มเกม</span>
        </button>

        <button
          onClick={() => {
            playSoundFX('click');
            onOpenHowToPlay();
          }}
          className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 font-semibold text-base flex items-center justify-center gap-2 border border-purple-500/30 hover:border-purple-400/60 transition-all cursor-pointer"
        >
          <BookOpen className="w-5 h-5 text-purple-300" />
          <span>วิธีเล่น</span>
        </button>

        <button
          onClick={() => {
            playSoundFX('click');
            onOpenLeaderboard();
          }}
          className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-amber-950/40 hover:bg-amber-900/60 text-amber-200 font-semibold text-base flex items-center justify-center gap-2 border border-amber-500/30 hover:border-amber-400/60 transition-all cursor-pointer"
        >
          <Trophy className="w-5 h-5 text-amber-400" />
          <span>จัดอันดับผู้เล่น</span>
        </button>
      </motion.div>

      {/* Bottom Feature Badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm text-purple-300/80 max-w-4xl"
      >
        <div className="glass-panel p-3 rounded-xl flex items-center justify-center gap-2">
          <span>🏰 ปราสาทลอยฟ้า</span>
        </div>
        <div className="glass-panel p-3 rounded-xl flex items-center justify-center gap-2">
          <span>🔥 6 สายพลังธาตุ</span>
        </div>
        <div className="glass-panel p-3 rounded-xl flex items-center justify-center gap-2">
          <span>📜 มินิเกมตอบคำถาม</span>
        </div>
        <div className="glass-panel p-3 rounded-xl flex items-center justify-center gap-2">
          <span>💾 ระบบบันทึกอัตโนมัติ</span>
        </div>
      </motion.div>
    </div>
  );
};
