'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playSoundFX } from '@/lib/audio';
import { Sparkles, Gift, Package, Coins, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  gold: number;
  onOpenChest: (chestType: 'free' | 'gold') => Promise<any>;
}

export const ChestTab: React.FC<Props> = ({ gold, onOpenChest }) => {
  const [opening, setOpening] = useState(false);
  const [rewardModal, setRewardModal] = useState<any | null>(null);

  const handleOpen = async (chestType: 'free' | 'gold') => {
    if (chestType === 'gold' && gold < 100) {
      playSoundFX('wrong');
      alert('คุณมี Gold ไม่เพียงพอในการเปิดหีบทองคำ! (ต้องการ 100 Gold)');
      return;
    }

    setOpening(true);
    playSoundFX('chest');

    try {
      const res = await onOpenChest(chestType);

      setTimeout(() => {
        setOpening(false);
        setRewardModal(res.reward);
        playSoundFX('fanfare');

        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }, 1500);
    } catch (e) {
      setOpening(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Vault Header */}
      <div className="glass-panel p-6 rounded-3xl border border-amber-400/30 text-center space-y-2 max-w-2xl mx-auto">
        <h2 className="text-3xl font-extrabold glow-text-gold flex items-center justify-center gap-2">
          <Gift className="w-8 h-8 text-amber-400" />
          <span>คลังหีบสมบัติเวทมนตร์ (Treasure Vault)</span>
        </h2>
        <p className="text-sm text-purple-200">
          สุ่มเปิดหีบสมบัติโบราณเพื่อลุ้นรับ Gold, EXP, Crystals และสมบัติเวทมนตร์สุดแรร์!
        </p>
      </div>

      {/* Chest Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Free Daily Chest */}
        <motion.div
          whileHover={{ y: -4 }}
          className="glass-panel p-8 rounded-3xl border border-purple-500/40 text-center flex flex-col items-center justify-between space-y-6 bg-purple-950/40"
        >
          <div className="space-y-3">
            <div className="w-24 h-24 rounded-3xl bg-purple-900/60 border border-purple-400/40 flex items-center justify-center text-6xl shadow-[0_0_30px_rgba(168,85,247,0.4)] animate-bounce">
              📦
            </div>
            <h3 className="text-2xl font-bold text-purple-200">หีบสมบัติประจำวัน (Daily Free Chest)</h3>
            <p className="text-xs text-purple-300">
              รับฟรีวันละ 1 ครั้ง! ลุ้นรับ EXP +20~50 และ Gold +40~120
            </p>
          </div>

          <button
            onClick={() => handleOpen('free')}
            disabled={opening}
            className="w-full py-4 rounded-2xl glass-button text-white font-bold text-base flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(168,85,247,0.4)] border border-purple-400"
          >
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>{opening ? 'กำลังเปิดหีบ...' : 'เปิดหีบฟรี (Open Free)'}</span>
          </button>
        </motion.div>

        {/* Mystical Gold Chest */}
        <motion.div
          whileHover={{ y: -4 }}
          className="glass-panel-gold p-8 rounded-3xl border border-amber-400 text-center flex flex-col items-center justify-between space-y-6 bg-amber-950/30"
        >
          <div className="space-y-3">
            <div className="w-24 h-24 rounded-3xl bg-amber-900/60 border border-amber-400 flex items-center justify-center text-6xl shadow-[0_0_40px_rgba(251,191,36,0.6)] animate-bounce">
              👑
            </div>
            <h3 className="text-2xl font-bold text-amber-300">หีบทองคำเวทมนตร์ (Mystic Gold Chest)</h3>
            <p className="text-xs text-amber-200/90">
              ราคา 100 Gold! ลุ้นรับ EXP มหาศาล +50~150, Gold +100~350, Crystals และออร่าแรร์!
            </p>
          </div>

          <button
            onClick={() => handleOpen('gold')}
            disabled={opening || gold < 100}
            className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 cursor-pointer transition-all ${
              gold >= 100
                ? 'glass-button text-white shadow-[0_0_30px_rgba(251,191,36,0.5)] border border-amber-300'
                : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
            }`}
          >
            <Coins className="w-5 h-5 text-amber-300" />
            <span>{opening ? 'กำลังเปิดหีบ...' : 'เปิดหีบทองคำ (100 Gold)'}</span>
          </button>
        </motion.div>
      </div>

      {/* Opening Animation Modal */}
      {opening && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col items-center justify-center text-center p-4">
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="text-8xl mb-6"
          >
            🎁
          </motion.div>
          <h3 className="text-3xl font-extrabold text-amber-300 glow-text-gold">
            กำลังปลดล็อคตราเวทมนตร์ในหีบ...
          </h3>
        </div>
      )}

      {/* Reward Reveal Modal */}
      {rewardModal && (
        <AnimatePresence>
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              className="glass-panel-gold p-8 rounded-3xl border-2 border-amber-400 max-w-md w-full text-center space-y-6 shadow-[0_0_60px_rgba(251,191,36,0.6)]"
            >
              <div className="text-6xl animate-bounce">✨ 💎 ✨</div>
              <h3 className="text-3xl font-extrabold text-amber-300 glow-text-gold">
                สมบัติที่คุณได้รับ!
              </h3>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-400/40 space-y-3">
                <div className="flex items-center justify-between text-base font-bold text-amber-200">
                  <span>✨ EXP เพิ่มขึ้น:</span>
                  <span className="text-amber-400">+{rewardModal.exp} EXP</span>
                </div>
                <div className="flex items-center justify-between text-base font-bold text-amber-200">
                  <span>💰 Gold ที่ได้รับ:</span>
                  <span className="text-yellow-400">+{rewardModal.gold} Gold</span>
                </div>
                {rewardModal.crystal > 0 && (
                  <div className="flex items-center justify-between text-base font-bold text-cyan-200">
                    <span>💎 Crystal ที่ได้รับ:</span>
                    <span className="text-cyan-300">+{rewardModal.crystal} Crystal</span>
                  </div>
                )}
                <div className="text-xs text-amber-300/80 pt-2 border-t border-purple-500/20">
                  ระดับความหายาก: <span className="font-bold uppercase text-amber-400">{rewardModal.rarity}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  playSoundFX('click');
                  setRewardModal(null);
                }}
                className="w-full py-3.5 rounded-2xl glass-button text-white font-bold text-base cursor-pointer shadow-[0_0_20px_rgba(251,191,36,0.4)] border border-amber-300"
              >
                รับรางวัลและปิดหน้าต่าง
              </button>
            </motion.div>
          </div>
        </AnimatePresence>
      )}
    </div>
  );
};
