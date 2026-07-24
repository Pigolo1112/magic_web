'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerData, Spell, ShopItem, Achievement } from '@/lib/types';
import { MAGIC_AFFINITIES, SPELLS_CATALOG } from '@/lib/constants';
import { playSoundFX, toggleAudioMute, startAmbientBGM } from '@/lib/audio';
import {
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Save,
  Coins,
  Sparkles,
  Award,
  BookOpen,
  ShoppingBag,
  Gift,
  Trophy,
  HelpCircle,
  Zap,
  Swords,
} from 'lucide-react';

import { ThreeBattleTab } from './tabs/ThreeBattleTab';
import { QuestTab } from './tabs/QuestTab';
import { SpellbookTab } from './tabs/SpellbookTab';
import { ShopTab } from './tabs/ShopTab';
import { ChestTab } from './tabs/ChestTab';
import { AchievementTab } from './tabs/AchievementTab';
import { LeaderboardTab } from './tabs/LeaderboardTab';
import { SpellCastFX } from './SpellCastFX';
import { HowToPlayModal } from './HowToPlayModal';

interface Props {
  initialPlayer: PlayerData;
  isNight: boolean;
  onToggleDayNight: () => void;
}

export const AcademyHub: React.FC<Props> = ({ initialPlayer, isNight, onToggleDayNight }) => {
  const [player, setPlayer] = useState<PlayerData>(initialPlayer);
  const [activeTab, setActiveTab] = useState<'battle3d' | 'quests' | 'spells' | 'shop' | 'chest' | 'achievements' | 'leaderboard'>('battle3d');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [activeSpellFX, setActiveSpellFX] = useState<any | null>(null);

  // Notification Toast State
  const [notification, setNotification] = useState<{ title: string; desc: string; icon: string } | null>(null);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);

  const aff = MAGIC_AFFINITIES[player.affinity] || MAGIC_AFFINITIES.fire;

  // Auto-Save Player to SQLite
  const savePlayer = async (updatedData: PlayerData) => {
    setSaveStatus('saving');
    try {
      await fetch('/api/player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
      console.error('Save error:', e);
      setSaveStatus('idle');
    }
  };

  // Trigger Notification Toast
  const showNotification = (title: string, desc: string, icon: string) => {
    setNotification({ title, desc, icon });
    playSoundFX('fanfare');
    setTimeout(() => setNotification(null), 4000);
  };

  // Add EXP & Level Up Check
  const addExpAndGold = (gainedExp: number, gainedGold: number, gainedCrystal = 0) => {
    setPlayer((prev) => {
      let newExp = prev.exp + gainedExp;
      let newLevel = prev.level;
      let newMaxExp = prev.maxExp;
      let newGold = prev.gold + gainedGold;
      let newCrystal = prev.crystal + gainedCrystal;
      let newUnlockedSpells = [...prev.unlockedSpells];
      let newTitle = prev.title;

      let leveledUp = false;
      while (newExp >= newMaxExp) {
        newExp -= newMaxExp;
        newLevel += 1;
        newMaxExp = Math.floor(newMaxExp * 1.4);
        leveledUp = true;
      }

      if (leveledUp) {
        playSoundFX('levelup');
        setActiveSpellFX({ type: 'levelup', name: '' });

        SPELLS_CATALOG.forEach((spell) => {
          if (newLevel >= spell.reqLevel && !newUnlockedSpells.includes(spell.id)) {
            newUnlockedSpells.push(spell.id);
            setTimeout(() => {
              showNotification(
                'ปลดล็อกคาถาใหม่! (New Spell Unlocked)',
                `คุณได้เรียนรู้คาถา "${spell.name}" (req Lv.${spell.reqLevel})`,
                spell.icon
              );
            }, 1000);
          }
        });

        if (newLevel >= 10) newTitle = 'มหาจอมเวทผู้ยิ่งใหญ่';
        else if (newLevel >= 5) newTitle = 'ผู้พิชิตถ้ำมังกร';
        else if (newLevel >= 3) newTitle = 'จอมเวทชั้นสูง';
      }

      const updated = {
        ...prev,
        level: newLevel,
        exp: newExp,
        maxExp: newMaxExp,
        gold: newGold,
        crystal: newCrystal,
        unlockedSpells: newUnlockedSpells,
        title: newTitle,
        questsCompleted: prev.questsCompleted + 1,
      };

      savePlayer(updated);
      return updated;
    });
  };

  // Handle Item Purchase
  const handleBuyItem = (item: ShopItem) => {
    setPlayer((prev) => {
      const updated = {
        ...prev,
        gold: prev.gold - item.priceGold,
        crystal: prev.crystal - item.priceCrystal,
        inventory: [...prev.inventory, item.id],
      };
      savePlayer(updated);
      showNotification('ซื้อไอเทมสำเร็จ!', `คุณได้รับ "${item.name}" เรียบร้อยแล้ว`, item.icon);
      return updated;
    });
  };

  // Handle Item Equip
  const handleEquipItem = (item: ShopItem) => {
    setPlayer((prev) => {
      const updated = { ...prev };
      if (item.category === 'wand') updated.equippedWand = item.id;
      if (item.category === 'robe') updated.equippedRobe = item.id;
      if (item.category === 'hat') updated.equippedHat = item.id;
      if (item.category === 'pet') updated.equippedPet = item.id;
      if (item.category === 'aura') updated.equippedAura = item.id;

      savePlayer(updated);
      showNotification('สวมใส่ไอเทมเรียบร้อย!', `ติดตั้ง "${item.name}" เรียบร้อยแล้ว`, item.icon);
      return updated;
    });
  };

  // Handle Claim Achievement
  const handleClaimAchievement = (ach: Achievement) => {
    setPlayer((prev) => {
      const updated = {
        ...prev,
        gold: prev.gold + ach.rewardGold,
        crystal: prev.crystal + ach.rewardCrystal,
        unlockedAchievements: [...prev.unlockedAchievements, ach.id],
        title: ach.rewardTitle || prev.title,
      };
      savePlayer(updated);
      showNotification('พิชิตความสำเร็จ!', `คุณได้รับ "${ach.title}" (+${ach.rewardGold} Gold)`, ach.icon);
      return updated;
    });
  };

  // Handle Open Chest
  const handleOpenChest = async (chestType: 'free' | 'gold') => {
    const res = await fetch('/api/chest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chestType }),
    });
    const data = await res.json();
    if (data.reward) {
      addExpAndGold(data.reward.exp, data.reward.gold, data.reward.crystal);
    }
    return data;
  };

  // Toggle Audio BGM
  const handleToggleBgm = () => {
    const muted = toggleAudioMute();
    setIsAudioMuted(muted);
    if (!muted) {
      startAmbientBGM();
    }
  };

  return (
    <div className="relative z-10 min-h-screen pb-16 pt-4 px-3 sm:px-6 max-w-7xl mx-auto space-y-6">
      {/* Spell FX Visual Overlay */}
      <SpellCastFX
        spellType={activeSpellFX?.type || null}
        spellName={activeSpellFX?.name}
        onComplete={() => setActiveSpellFX(null)}
      />

      {/* How to play Modal */}
      <HowToPlayModal isOpen={isHowToPlayOpen} onClose={() => setIsHowToPlayOpen(false)} />

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 glass-panel-gold px-6 py-3.5 rounded-2xl border-2 border-amber-400 flex items-center gap-3 shadow-[0_0_30px_rgba(251,191,36,0.6)]"
          >
            <span className="text-3xl">{notification.icon}</span>
            <div>
              <h4 className="font-extrabold text-amber-300 text-sm">{notification.title}</h4>
              <p className="text-xs text-purple-200">{notification.desc}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP HEADER & PROFILE BAR */}
      <header className="glass-panel p-4 sm:p-6 rounded-3xl border border-purple-500/30 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Player Avatar & Stats */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-purple-900 via-indigo-700 to-amber-400 p-0.5 shadow-[0_0_20px_rgba(168,85,247,0.5)] flex items-center justify-center">
                <div className="w-full h-full bg-slate-950/90 rounded-[14px] flex items-center justify-center text-3xl sm:text-4xl">
                  {aff.avatarIcon}
                </div>
              </div>
              <span className="absolute -bottom-2 -right-1 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-extrabold text-xs shadow">
                Lv.{player.level}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-purple-100">{player.name}</h2>
                <span className={`text-xs px-2.5 py-0.5 rounded-full text-white font-bold bg-gradient-to-r ${aff.badgeBg}`}>
                  {aff.name}
                </span>
              </div>
              <p className="text-xs text-amber-300/90 font-semibold italic flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" /> {player.title}
              </p>

              {/* EXP Progress Bar */}
              <div className="w-48 sm:w-64 space-y-1 pt-1">
                <div className="flex justify-between text-[10px] text-purple-300 font-semibold">
                  <span>EXP</span>
                  <span>{player.exp} / {player.maxExp}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-purple-500/30">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 via-amber-400 to-yellow-300 transition-all duration-300"
                    style={{ width: `${Math.min(100, (player.exp / player.maxExp) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Currency & System Controls */}
          <div className="flex flex-wrap items-center justify-end gap-3 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-purple-500/20">
            {/* Gold */}
            <div className="px-3.5 py-2 rounded-2xl bg-amber-950/70 border border-amber-400/40 text-amber-300 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{player.gold.toLocaleString()} Gold</span>
            </div>

            {/* Crystals */}
            <div className="px-3.5 py-2 rounded-2xl bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>{player.crystal} Crystal</span>
            </div>

            {/* BGM Toggle */}
            <button
              onClick={() => {
                playSoundFX('click');
                handleToggleBgm();
              }}
              className="p-2.5 rounded-2xl glass-panel text-purple-200 hover:text-amber-300 border border-purple-500/30 cursor-pointer transition-all"
              title={isAudioMuted ? 'เปิดเสียงเพลง BGM' : 'ปิดเสียงเพลง BGM'}
            >
              {isAudioMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
            </button>

            {/* Day / Night Toggle */}
            <button
              onClick={() => {
                playSoundFX('click');
                onToggleDayNight();
              }}
              className="p-2.5 rounded-2xl glass-panel text-purple-200 hover:text-amber-300 border border-purple-500/30 cursor-pointer transition-all"
              title={isNight ? 'สลับเป็นโหมดกลางวัน (Day)' : 'สลับเป็นโหมดกลางคืน (Night)'}
            >
              {isNight ? <Moon className="w-5 h-5 text-purple-300" /> : <Sun className="w-5 h-5 text-amber-400" />}
            </button>

            {/* How to Play Button */}
            <button
              onClick={() => {
                playSoundFX('click');
                setIsHowToPlayOpen(true);
              }}
              className="p-2.5 rounded-2xl glass-panel text-purple-200 hover:text-amber-300 border border-purple-500/30 cursor-pointer transition-all"
              title="คู่มือการเล่น"
            >
              <HelpCircle className="w-5 h-5 text-cyan-300" />
            </button>

            {/* Manual Save Button */}
            <button
              onClick={() => {
                playSoundFX('click');
                savePlayer(player);
              }}
              disabled={saveStatus === 'saving'}
              className="px-3.5 py-2 rounded-2xl bg-purple-900/80 hover:bg-purple-800 text-purple-100 border border-purple-400/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Save className={`w-4 h-4 ${saveStatus === 'saving' ? 'animate-spin' : ''}`} />
              <span>{saveStatus === 'saving' ? 'กำลังบันทึก...' : saveStatus === 'saved' ? 'บันทึกแล้ว!' : 'บันทึก'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* NAVIGATION TABS BAR */}
      <nav className="flex flex-wrap items-center justify-center gap-2">
        {[
          { id: 'battle3d', label: '⚔️ ต่อสู้ 3D MediaPipe', icon: Swords },
          { id: 'quests', label: 'ภารกิจ & มินิเกม', icon: Zap },
          { id: 'spells', label: 'คาถาเวทมนตร์', icon: BookOpen },
          { id: 'shop', label: 'ร้านค้าเวทมนตร์', icon: ShoppingBag },
          { id: 'chest', label: 'หีบสมบัติ', icon: Gift },
          { id: 'achievements', label: 'ความสำเร็จ', icon: Trophy },
          { id: 'leaderboard', label: 'จัดอันดับผู้เล่น', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                playSoundFX('click');
                setActiveTab(tab.id as any);
              }}
              className={`px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all border ${
                isActive
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.5)] scale-102'
                  : 'glass-panel text-purple-200 border-purple-500/30 hover:border-purple-400 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* TAB CONTENT AREA */}
      <main className="min-h-[500px]">
        {activeTab === 'battle3d' && (
          <ThreeBattleTab onReward={addExpAndGold} />
        )}

        {activeTab === 'quests' && (
          <QuestTab onReward={addExpAndGold} questsCompleted={player.questsCompleted} />
        )}

        {activeTab === 'spells' && (
          <SpellbookTab
            playerLevel={player.level}
            unlockedSpells={player.unlockedSpells}
            onCastSpell={(spell) => {
              setActiveSpellFX({ type: spell.effectType, name: spell.name });
            }}
          />
        )}

        {activeTab === 'shop' && (
          <ShopTab player={player} onBuyItem={handleBuyItem} onEquipItem={handleEquipItem} />
        )}

        {activeTab === 'chest' && (
          <ChestTab gold={player.gold} onOpenChest={handleOpenChest} />
        )}

        {activeTab === 'achievements' && (
          <AchievementTab player={player} onClaimAchievement={handleClaimAchievement} />
        )}

        {activeTab === 'leaderboard' && <LeaderboardTab />}
      </main>
    </div>
  );
};
