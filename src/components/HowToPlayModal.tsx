'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Sparkles, Shield, Trophy, Gift, Zap } from 'lucide-react';
import { playSoundFX } from '@/lib/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-400/40 max-w-3xl w-full max-h-[85vh] overflow-y-auto space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.9)] relative"
        >
          {/* Close Button */}
          <button
            onClick={() => {
              playSoundFX('click');
              onClose();
            }}
            className="absolute top-5 right-5 p-2 rounded-full bg-purple-900/60 text-purple-200 hover:text-white hover:bg-purple-800 cursor-pointer transition-all"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Modal Header */}
          <div className="text-center space-y-2 border-b border-purple-500/30 pb-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold glow-text-gold flex items-center justify-center gap-2">
              <BookOpen className="w-7 h-7 text-amber-400" />
              <span>คู่มือการเล่น (How to Play Guide)</span>
            </h2>
            <p className="text-xs sm:text-sm text-purple-200">
              เรียนรู้วิธีการทำภารกิจ ปลดล็อกคาถา ซื้ออุปกรณ์ และก้าวสู่จอมเวทอันดับ 1
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-6 text-sm text-purple-100">
            {/* 1. Character */}
            <div className="p-4 rounded-2xl bg-purple-950/60 border border-purple-500/30 space-y-2">
              <h3 className="font-extrabold text-amber-300 text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" /> 1. ระบบสายเวทมนตร์ (Elemental Affinities)
              </h3>
              <p className="text-xs sm:text-sm text-purple-200 leading-relaxed">
                เลือกสายเวทประจำตัวจาก 6 ธาตุ (ไฟ, น้ำ, ลม, ดิน, แสง, ความมืด) แต่ละสายมีค่าพลังพื้นฐาน สกิลพาสซีฟพิเศษ และคาถาเริ่มต้นแตกต่างกัน
              </p>
            </div>

            {/* 2. Quests */}
            <div className="p-4 rounded-2xl bg-purple-950/60 border border-purple-500/30 space-y-2">
              <h3 className="font-extrabold text-amber-300 text-base flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" /> 2. การทำภารกิจ & มินิเกม (Quests & Minigames)
              </h3>
              <ul className="text-xs sm:text-sm text-purple-200 space-y-1.5 list-disc list-inside">
                <li><strong>Magic Quiz:</strong> ตอบคำถามความรู้เรื่องเวทมนตร์เพื่อรับ EXP +45 และ Gold +60</li>
                <li><strong>Rune Memory Match:</strong> จับคู่สัญลักษณ์เวทมนตร์ 4 คู่ รับ EXP +80, Gold +120, Crystals +3</li>
                <li><strong>Spell Cipher:</strong> ถอดรหัสตัวอักษรเพื่อทายชื่อคาถาโบราณ</li>
              </ul>
            </div>

            {/* 3. Leveling & Shop */}
            <div className="p-4 rounded-2xl bg-purple-950/60 border border-purple-500/30 space-y-2">
              <h3 className="font-extrabold text-amber-300 text-base flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" /> 3. ระบบเลเวล & ร้านค้า (Leveling & Emporium)
              </h3>
              <p className="text-xs sm:text-sm text-purple-200 leading-relaxed">
                เมื่อ EXP ครบรอบ เลเวลจะเพิ่มขึ้น ปลดล็อกคาถาใหม่ เช่น Fire Ball, Ice Spike, Thunder Bolt, Holy Light, Shadow Curse! สามารถนำ Gold และ Crystals ไปซื้อและสวมใส่ไม้กายสิทธิ์, เสื้อคลุม, หมวก, สัตว์เลี้ยง และออร่าเพื่อเพิ่มค่าพลัง!
              </p>
            </div>

            {/* 4. Persistence */}
            <div className="p-4 rounded-2xl bg-purple-950/60 border border-purple-500/30 space-y-2">
              <h3 className="font-extrabold text-amber-300 text-base flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" /> 4. ระบบบันทึกอัตโนมัติ (Auto-Save System)
              </h3>
              <p className="text-xs sm:text-sm text-purple-200 leading-relaxed">
                ข้อมูลตัวละคร เลเวล Gold ไอเทม และ Achievements ทั้งหมดจะถูกบันทึกลงใน SQLite Database ทันที ให้คุณเล่นได้อย่างมั่นใจ
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playSoundFX('click');
              onClose();
            }}
            className="w-full py-3.5 rounded-2xl glass-button text-white font-bold text-base cursor-pointer shadow-[0_0_20px_rgba(251,191,36,0.3)] border border-amber-300"
          >
            เข้าใจแล้ว! เริ่มการผจญภัย
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
