'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MAGIC_AFFINITIES } from '@/lib/constants';
import { ElementType, PlayerData } from '@/lib/types';
import { playSoundFX } from '@/lib/audio';
import { Shield, Zap, Sparkles, CheckCircle2, User } from 'lucide-react';

interface Props {
  onCharacterCreated: (player: PlayerData) => void;
  onBack: () => void;
}

export const CharacterSelect: React.FC<Props> = ({ onCharacterCreated, onBack }) => {
  const [name, setName] = useState('');
  const [selectedAffinity, setSelectedAffinity] = useState<ElementType>('fire');
  const [error, setError] = useState('');

  const currentAffinity = MAGIC_AFFINITIES[selectedAffinity];

  const handleCreate = () => {
    if (!name.trim()) {
      setError('กรุณากรอกชื่อตัวละครของคุณ!');
      playSoundFX('wrong');
      return;
    }

    playSoundFX('fanfare');

    const newPlayer: PlayerData = {
      id: `player_${Date.now()}`,
      name: name.trim(),
      affinity: selectedAffinity,
      level: 1,
      exp: 0,
      maxExp: 100,
      gold: 150,
      crystal: 10,
      title: currentAffinity.title,
      equippedWand: 'wand_novice',
      equippedRobe: 'robe_apprentice',
      equippedHat: 'hat_classic',
      equippedPet: '',
      equippedAura: '',
      unlockedSpells: [currentAffinity.startingSpellId],
      unlockedAchievements: ['novice_mage'],
      inventory: ['wand_novice', 'robe_apprentice', 'hat_classic'],
      questsCompleted: 0,
      dailyQuestClaimed: false,
      lastDailyReset: new Date().toISOString().split('T')[0],
    };

    onCharacterCreated(newPlayer);
  };

  return (
    <div className="relative min-h-screen z-10 flex flex-col items-center justify-center p-4 sm:p-6 my-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/40 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
      >
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold glow-text-gold">
            เลือกสายเวทมนตร์ของคุณ
          </h2>
          <p className="text-purple-300 text-sm sm:text-base">
            ยินดีต้อนรับนักเรียนใหม่! เลือกธาตุประจำตัวและสร้างชื่อจอมเวทของคุณ
          </p>
        </div>

        {/* Character Name Input */}
        <div className="mb-8 max-w-md mx-auto">
          <label className="block text-amber-300 text-sm font-semibold mb-2 text-center flex items-center justify-center gap-2">
            <User className="w-4 h-4" /> ชื่อตัวละครของคุณ
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            placeholder="ตั้งชื่อนักเวท (เช่น Archmage Merlin)..."
            className="w-full px-5 py-3 rounded-2xl bg-purple-950/80 border border-purple-400/50 text-white placeholder-purple-400/50 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 text-center font-bold text-lg transition-all"
            maxLength={18}
          />
          {error && <p className="text-rose-400 text-xs text-center mt-2 font-semibold">{error}</p>}
        </div>

        {/* Element Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-8">
          {(Object.keys(MAGIC_AFFINITIES) as ElementType[]).map((key) => {
            const aff = MAGIC_AFFINITIES[key];
            const isSelected = selectedAffinity === key;

            return (
              <button
                key={key}
                onClick={() => {
                  playSoundFX('click');
                  setSelectedAffinity(key);
                }}
                className={`relative p-4 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 border ${
                  isSelected
                    ? 'bg-purple-900/90 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.5)] scale-105'
                    : 'bg-slate-950/50 border-purple-500/20 hover:border-purple-400/50 hover:scale-102'
                }`}
              >
                <div className="text-4xl sm:text-5xl my-1">{aff.avatarIcon}</div>
                <div className="text-xs sm:text-sm font-bold text-purple-100 text-center">
                  {aff.name}
                </div>
                {isSelected && (
                  <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-amber-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Affinity Details Card */}
        <motion.div
          key={selectedAffinity}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="glass-panel p-6 rounded-2xl border border-amber-400/30 bg-purple-950/40 grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          {/* Left: Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{currentAffinity.avatarIcon}</span>
              <div>
                <h3 className="text-2xl font-bold text-amber-300">{currentAffinity.name}</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-800 text-purple-200 border border-purple-500/40">
                  {currentAffinity.title}
                </span>
              </div>
            </div>
            <p className="text-sm text-purple-200/90 leading-relaxed">
              {currentAffinity.description}
            </p>
            <div className="p-3 rounded-xl bg-purple-900/40 border border-purple-500/30 text-xs text-amber-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                <strong>สกิลพิเศษ:</strong> {currentAffinity.specialSkill}
              </span>
            </div>
          </div>

          {/* Right: Stats & Starting Spell */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" /> ค่าพลังพื้นฐาน (Base Stats)
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-purple-500/20 flex flex-col">
                <span className="text-purple-400 font-semibold">ATK (พลังโจมตี)</span>
                <span className="text-lg font-bold text-amber-300">
                  {currentAffinity.baseStats.atk}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-purple-500/20 flex flex-col">
                <span className="text-purple-400 font-semibold">DEF (พลังป้องกัน)</span>
                <span className="text-lg font-bold text-cyan-300">
                  {currentAffinity.baseStats.def}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-purple-500/20 flex flex-col">
                <span className="text-purple-400 font-semibold">Max MP (มานาสูงสุด)</span>
                <span className="text-lg font-bold text-purple-300">
                  {currentAffinity.baseStats.mp}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-purple-500/20 flex flex-col">
                <span className="text-purple-400 font-semibold">Mana Regen / Sec</span>
                <span className="text-lg font-bold text-emerald-300">
                  +{currentAffinity.baseStats.manaRegen}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => {
              playSoundFX('click');
              onBack();
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm cursor-pointer transition-all"
          >
            ย้อนกลับ
          </button>

          <button
            onClick={handleCreate}
            className="w-full sm:w-auto px-10 py-4 rounded-2xl glass-button text-white font-bold text-lg flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(251,191,36,0.4)] hover:scale-105 transition-all cursor-pointer border border-amber-400"
          >
            <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
            <span>เข้าสู่สถาบัน (Start Game)</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
