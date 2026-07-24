'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SPELLS_CATALOG } from '@/lib/constants';
import { Spell } from '@/lib/types';
import { playSoundFX } from '@/lib/audio';
import { Zap, Lock, Sparkles, Shield, Flame, BookOpen } from 'lucide-react';

interface Props {
  playerLevel: number;
  unlockedSpells: string[];
  onCastSpell: (spell: Spell) => void;
}

export const SpellbookTab: React.FC<Props> = ({ playerLevel, unlockedSpells, onCastSpell }) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl font-extrabold glow-text-gold flex items-center gap-2 justify-center md:justify-start">
            <BookOpen className="w-7 h-7 text-amber-400" />
            <span>หอคอยเวทมนตร์ (Spell Grimoire)</span>
          </h2>
          <p className="text-sm text-purple-200">
            รวบรวมคาถาทั้งหมดใน Arcane Academy ร่ายเวททดสอบพลังและชมเอฟเฟกต์การร่ายมนตรา
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-purple-900/60 border border-purple-400/40 text-amber-300 text-sm font-bold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>ปลดล็อกแล้ว: {unlockedSpells.length} / {SPELLS_CATALOG.length} คาถา</span>
        </div>
      </div>

      {/* Spells Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {SPELLS_CATALOG.map((spell) => {
          const isUnlocked = unlockedSpells.includes(spell.id) || playerLevel >= spell.reqLevel;

          return (
            <motion.div
              key={spell.id}
              whileHover={{ y: -4 }}
              className={`glass-panel p-6 rounded-3xl border flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${
                isUnlocked
                  ? 'border-amber-400/40 bg-purple-950/40 shadow-[0_0_20px_rgba(147,51,234,0.2)]'
                  : 'border-purple-900/40 bg-slate-950/70 opacity-70'
              }`}
            >
              {/* Top Row: Icon & Status */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-purple-900/80 border border-purple-400/40 flex items-center justify-center text-4xl shadow-inner">
                    {spell.icon}
                  </div>
                  {isUnlocked ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-900/80 text-emerald-300 border border-emerald-400/40 text-xs font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Ready
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-slate-900 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> Req Lv.{spell.reqLevel}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-extrabold text-amber-300 mb-1">{spell.name}</h3>
                <p className="text-xs text-purple-200 leading-relaxed mb-4">{spell.description}</p>
              </div>

              {/* Stats & Cast Button */}
              <div className="space-y-4 pt-4 border-t border-purple-500/20">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-500/20">
                    <span className="block text-purple-400 text-[10px]">Damage</span>
                    <span className="font-bold text-amber-300 text-sm">{spell.damage}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-500/20">
                    <span className="block text-purple-400 text-[10px]">Mana Cost</span>
                    <span className="font-bold text-cyan-300 text-sm">{spell.manaCost} MP</span>
                  </div>
                  <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-500/20">
                    <span className="block text-purple-400 text-[10px]">Cooldown</span>
                    <span className="font-bold text-purple-300 text-sm">{spell.cooldown}s</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (isUnlocked) {
                      playSoundFX('spell', spell.element);
                      onCastSpell(spell);
                    } else {
                      playSoundFX('wrong');
                    }
                  }}
                  disabled={!isUnlocked}
                  className={`w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    isUnlocked
                      ? 'glass-button text-white shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:scale-102 border border-amber-400/50'
                      : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                  }`}
                >
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>{isUnlocked ? 'ร่ายมนตรา (Test Cast Spell)' : `ต้องมีเลเวล ${spell.reqLevel}`}</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
