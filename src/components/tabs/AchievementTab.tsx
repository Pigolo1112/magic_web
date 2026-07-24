'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ACHIEVEMENTS_CATALOG } from '@/lib/constants';
import { Achievement, PlayerData } from '@/lib/types';
import { playSoundFX } from '@/lib/audio';
import { Trophy, CheckCircle2, Lock, Sparkles, Award } from 'lucide-react';

interface Props {
  player: PlayerData;
  onClaimAchievement: (achievement: Achievement) => void;
}

export const AchievementTab: React.FC<Props> = ({ player, onClaimAchievement }) => {
  const getProgress = (ach: Achievement) => {
    let current = 0;
    if (ach.reqType === 'level') current = player.level;
    if (ach.reqType === 'gold') current = player.gold;
    if (ach.reqType === 'quests') current = player.questsCompleted;
    if (ach.reqType === 'spells') current = player.unlockedSpells.length;

    const percentage = Math.min(100, Math.floor((current / ach.reqValue) * 100));
    return { current, percentage, isComplete: current >= ach.reqValue };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-amber-400/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl font-extrabold glow-text-gold flex items-center gap-2 justify-center md:justify-start">
            <Trophy className="w-7 h-7 text-amber-400" />
            <span>ความสำเร็จแห่งเกียรติยศ (Achievements)</span>
          </h2>
          <p className="text-sm text-purple-200">
            พิชิตภารกิจ พัฒนาฝีมือในสถาบัน และรับเหรียญตราเกียรติยศพร้อม Gold & Crystals!
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-amber-950/80 border border-amber-400/50 text-amber-300 text-sm font-bold flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span>ปลดล็อกแล้ว: {player.unlockedAchievements.length} / {ACHIEVEMENTS_CATALOG.length}</span>
        </div>
      </div>

      {/* Achievements List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {ACHIEVEMENTS_CATALOG.map((ach) => {
          const isUnlocked = player.unlockedAchievements.includes(ach.id);
          const { current, percentage, isComplete } = getProgress(ach);

          return (
            <motion.div
              key={ach.id}
              whileHover={{ y: -3 }}
              className={`glass-panel p-6 rounded-3xl border flex flex-col justify-between transition-all duration-300 ${
                isUnlocked
                  ? 'border-emerald-500/40 bg-purple-950/40'
                  : isComplete
                  ? 'border-amber-400 bg-amber-950/20 shadow-[0_0_20px_rgba(251,191,36,0.3)]'
                  : 'border-purple-900/40 bg-slate-950/70'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-purple-900/80 border border-purple-400/40 flex items-center justify-center text-4xl shadow-inner">
                    {ach.icon}
                  </div>

                  {isUnlocked ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-900/90 text-emerald-300 text-xs font-extrabold flex items-center gap-1 border border-emerald-400/40">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Unlocked
                    </span>
                  ) : isComplete ? (
                    <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1 animate-pulse">
                      <Sparkles className="w-3.5 h-3.5" /> Ready to Claim!
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-slate-900 text-purple-300 text-xs font-bold border border-purple-500/30 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> Locked
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-extrabold text-amber-300 mb-1">{ach.title}</h3>
                <p className="text-xs text-purple-200 leading-relaxed mb-4">{ach.description}</p>

                {/* Progress Bar */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs text-purple-300 font-semibold">
                    <span>ความคืบหน้า</span>
                    <span>{current} / {ach.reqValue} ({percentage}%)</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-purple-500/30">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 via-amber-400 to-yellow-300 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Reward & Claim Controls */}
              <div className="pt-4 border-t border-purple-500/20 flex items-center justify-between">
                <div className="text-xs text-amber-200 font-semibold">
                  <span>รางวัล: </span>
                  <span className="text-amber-400 font-bold">+{ach.rewardGold} Gold</span>
                  <span className="text-cyan-300 font-bold ml-2">+{ach.rewardCrystal} Crystal</span>
                  {ach.rewardTitle && (
                    <div className="text-[11px] text-purple-300 mt-0.5">
                      ฉายาใหม่: <span className="text-amber-300 italic font-bold">"{ach.rewardTitle}"</span>
                    </div>
                  )}
                </div>

                {!isUnlocked && isComplete && (
                  <button
                    onClick={() => {
                      playSoundFX('fanfare');
                      onClaimAchievement(ach);
                    }}
                    className="px-5 py-2.5 rounded-2xl glass-button text-white font-bold text-xs cursor-pointer shadow-[0_0_20px_rgba(251,191,36,0.4)] border border-amber-300 flex-shrink-0"
                  >
                    รับรางวัล (Claim)
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
