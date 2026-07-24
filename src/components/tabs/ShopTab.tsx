'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SHOP_ITEMS } from '@/lib/constants';
import { ShopItem, PlayerData } from '@/lib/types';
import { playSoundFX } from '@/lib/audio';
import { ShoppingBag, Coins, Sparkles, Check, Shield, Wand2 } from 'lucide-react';

interface Props {
  player: PlayerData;
  onBuyItem: (item: ShopItem) => void;
  onEquipItem: (item: ShopItem) => void;
}

export const ShopTab: React.FC<Props> = ({ player, onBuyItem, onEquipItem }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'wand' | 'robe' | 'hat' | 'pet' | 'aura'>('all');

  const filteredItems = selectedCategory === 'all'
    ? SHOP_ITEMS
    : SHOP_ITEMS.filter((i) => i.category === selectedCategory);

  const isEquipped = (item: ShopItem) => {
    if (item.category === 'wand') return player.equippedWand === item.id;
    if (item.category === 'robe') return player.equippedRobe === item.id;
    if (item.category === 'hat') return player.equippedHat === item.id;
    if (item.category === 'pet') return player.equippedPet === item.id;
    if (item.category === 'aura') return player.equippedAura === item.id;
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Shop Header */}
      <div className="glass-panel p-6 rounded-3xl border border-amber-400/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl font-extrabold glow-text-gold flex items-center gap-2 justify-center md:justify-start">
            <ShoppingBag className="w-7 h-7 text-amber-400" />
            <span>ร้านค้าเวทมนตร์ (Arcane Emporium)</span>
          </h2>
          <p className="text-sm text-purple-200">
            เลือกซื้อไม้กายสิทธิ์ เสื้อคลุม หมวก สัตว์เลี้ยง และเอฟเฟกต์เวทด้วย Gold หรือ Crystals!
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-2xl bg-amber-950/80 border border-amber-400/50 text-amber-300 font-bold text-sm flex items-center gap-1.5 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>{player.gold} Gold</span>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-cyan-950/80 border border-cyan-400/50 text-cyan-300 font-bold text-sm flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{player.crystal} Crystals</span>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {[
          { id: 'all', label: 'ทั้งหมด (All)', icon: '🛍️' },
          { id: 'wand', label: 'ไม้กายสิทธิ์ (Wands)', icon: '🪄' },
          { id: 'robe', label: 'เสื้อคลุม (Robes)', icon: '👘' },
          { id: 'hat', label: 'หมวก (Hats)', icon: '🧙‍♂️' },
          { id: 'pet', label: 'สัตว์เลี้ยง (Pets)', icon: '🦉' },
          { id: 'aura', label: 'เอฟเฟกต์เวท (Auras)', icon: '✨' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              playSoundFX('click');
              setSelectedCategory(cat.id as any);
            }}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer transition-all border ${
              selectedCategory === cat.id
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.4)]'
                : 'glass-panel text-purple-200 border-purple-500/30 hover:border-purple-400'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item) => {
          const isOwned = player.inventory.includes(item.id);
          const currentlyEquipped = isEquipped(item);
          const canAffordGold = player.gold >= item.priceGold;
          const canAffordCrystal = player.crystal >= item.priceCrystal;

          return (
            <motion.div
              key={item.id}
              whileHover={{ y: -4 }}
              className={`glass-panel p-6 rounded-3xl border flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${
                currentlyEquipped
                  ? 'border-amber-400 bg-purple-950/60 shadow-[0_0_25px_rgba(251,191,36,0.3)]'
                  : isOwned
                  ? 'border-purple-500/40 bg-purple-950/30'
                  : 'border-purple-900/40 bg-slate-950/70'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-purple-900/80 border border-purple-400/40 flex items-center justify-center text-4xl shadow-inner">
                    {item.icon}
                  </div>

                  {currentlyEquipped ? (
                    <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-1 shadow-md">
                      <Check className="w-3.5 h-3.5" /> Equipped
                    </span>
                  ) : isOwned ? (
                    <span className="px-3 py-1 rounded-full bg-purple-800 text-purple-200 text-xs font-bold border border-purple-400/40">
                      Owned
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-slate-900 text-amber-300 text-xs font-bold border border-amber-400/30">
                      Lv.{item.reqLevel}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-extrabold text-amber-300 mb-1">{item.name}</h3>
                <p className="text-xs text-purple-200 leading-relaxed mb-4">{item.description}</p>

                {/* Stat Bonuses */}
                <div className="flex flex-wrap gap-2 text-xs mb-4">
                  {item.statBonus.atk && (
                    <span className="px-2.5 py-1 rounded-lg bg-orange-950/60 border border-orange-500/30 text-orange-300 font-bold">
                      + {item.statBonus.atk} ATK
                    </span>
                  )}
                  {item.statBonus.def && (
                    <span className="px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-bold">
                      + {item.statBonus.def} DEF
                    </span>
                  )}
                  {item.statBonus.mp && (
                    <span className="px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-300 font-bold">
                      + {item.statBonus.mp} MP
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-purple-500/20">
                {isOwned ? (
                  <button
                    onClick={() => {
                      playSoundFX('click');
                      onEquipItem(item);
                    }}
                    className={`w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      currentlyEquipped
                        ? 'bg-purple-900 text-amber-300 border border-amber-400/50'
                        : 'glass-button text-white border border-amber-400/40'
                    }`}
                  >
                    <span>{currentlyEquipped ? 'สวมใส่อยู่ (Equipped)' : 'สวมใส่ไอเทม (Equip)'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (canAffordGold && canAffordCrystal) {
                        playSoundFX('fanfare');
                        onBuyItem(item);
                      } else {
                        playSoundFX('wrong');
                      }
                    }}
                    disabled={!canAffordGold || !canAffordCrystal || player.level < item.reqLevel}
                    className={`w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      canAffordGold && canAffordCrystal && player.level >= item.reqLevel
                        ? 'glass-button text-white border border-amber-400'
                        : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                    }`}
                  >
                    <span>ซื้อไอเทม: </span>
                    {item.priceGold > 0 && <span className="text-amber-300 font-extrabold">{item.priceGold} Gold</span>}
                    {item.priceCrystal > 0 && <span className="text-cyan-300 font-extrabold">{item.priceCrystal} Crystal</span>}
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
