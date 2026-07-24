'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QUIZ_QUESTIONS, CIPHER_PUZZLES } from '@/lib/constants';
import { playSoundFX } from '@/lib/audio';
import { Award, BookOpen, Brain, CheckCircle2, RefreshCw, Sparkles, HelpCircle, Gift } from 'lucide-react';

interface Props {
  onReward: (exp: number, gold: number, crystal?: number) => void;
  questsCompleted: number;
}

export const QuestTab: React.FC<Props> = ({ onReward, questsCompleted }) => {
  const [activeMinigame, setActiveMinigame] = useState<'quiz' | 'memory' | 'cipher'>('quiz');

  // Quiz State
  const [quizIdx, setQuizIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Memory Game State
  const initialCards = [
    { id: 1, symbol: '🔥', matched: false, flipped: false },
    { id: 2, symbol: '🔥', matched: false, flipped: false },
    { id: 3, symbol: '❄️', matched: false, flipped: false },
    { id: 4, symbol: '❄️', matched: false, flipped: false },
    { id: 5, symbol: '⚡', matched: false, flipped: false },
    { id: 6, symbol: '⚡', matched: false, flipped: false },
    { id: 7, symbol: '✨', matched: false, flipped: false },
    { id: 8, symbol: '✨', matched: false, flipped: false },
  ];

  const shuffleArray = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

  const [cards, setCards] = useState(() => shuffleArray(initialCards));
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [memoryMatches, setMemoryMatches] = useState(0);

  // Cipher State
  const [cipherIdx, setCipherIdx] = useState(0);
  const [userCipherInput, setUserCipherInput] = useState('');
  const [cipherMessage, setCipherMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Handle Quiz Answer
  const handleAnswerQuiz = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const currentQ = QUIZ_QUESTIONS[quizIdx];
    if (idx === currentQ.answerIndex) {
      playSoundFX('correct');
      setQuizScore((prev) => prev + 1);
      onReward(45, 60, 1);
    } else {
      playSoundFX('wrong');
    }
  };

  const nextQuizQuestion = () => {
    playSoundFX('click');
    setSelectedOption(null);
    setIsAnswered(false);
    setQuizIdx((prev) => (prev + 1) % QUIZ_QUESTIONS.length);
  };

  // Handle Memory Card Click
  const handleCardClick = (index: number) => {
    if (flippedIndices.length === 2 || cards[index].flipped || cards[index].matched) return;

    playSoundFX('click');
    const newCards = [...cards];
    newCards[index].flipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      const [firstIdx, secondIdx] = newFlipped;
      if (newCards[firstIdx].symbol === newCards[secondIdx].symbol) {
        playSoundFX('correct');
        setTimeout(() => {
          setCards((prev) => {
            const updated = [...prev];
            updated[firstIdx].matched = true;
            updated[secondIdx].matched = true;
            return updated;
          });
          setFlippedIndices([]);
          setMemoryMatches((m) => {
            const next = m + 1;
            if (next === 4) {
              playSoundFX('fanfare');
              onReward(80, 120, 3);
            }
            return next;
          });
        }, 500);
      } else {
        playSoundFX('wrong');
        setTimeout(() => {
          setCards((prev) => {
            const updated = [...prev];
            updated[firstIdx].flipped = false;
            updated[secondIdx].flipped = false;
            return updated;
          });
          setFlippedIndices([]);
        }, 900);
      }
    }
  };

  const resetMemoryGame = () => {
    playSoundFX('click');
    setCards(shuffleArray(initialCards));
    setFlippedIndices([]);
    setMemoryMatches(0);
  };

  // Handle Cipher Submission
  const handleCipherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentCipher = CIPHER_PUZZLES[cipherIdx];
    if (userCipherInput.trim().toUpperCase() === currentCipher.answer) {
      playSoundFX('correct');
      setCipherMessage({ text: 'ถูกต้อง! คุณแก้รหัสคาถาสำเร็จแล้ว (+50 EXP, +70 Gold)', type: 'success' });
      onReward(50, 70, 2);
    } else {
      playSoundFX('wrong');
      setCipherMessage({ text: 'คำตอบยังไม่ถูกต้อง ลองถอดรหัสอีกครั้ง!', type: 'error' });
    }
  };

  const nextCipher = () => {
    playSoundFX('click');
    setUserCipherInput('');
    setCipherMessage(null);
    setCipherIdx((prev) => (prev + 1) % CIPHER_PUZZLES.length);
  };

  return (
    <div className="space-y-6">
      {/* Top Minigame Selector Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => {
            playSoundFX('click');
            setActiveMinigame('quiz');
          }}
          className={`px-5 py-3 rounded-2xl font-bold text-sm sm:text-base flex items-center gap-2 cursor-pointer transition-all border ${
            activeMinigame === 'quiz'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.5)]'
              : 'glass-panel text-purple-200 border-purple-500/30 hover:border-purple-400'
          }`}
        >
          <HelpCircle className="w-5 h-5" />
          <span> Magic Quiz (ตอบคำถาม)</span>
        </button>

        <button
          onClick={() => {
            playSoundFX('click');
            setActiveMinigame('memory');
          }}
          className={`px-5 py-3 rounded-2xl font-bold text-sm sm:text-base flex items-center gap-2 cursor-pointer transition-all border ${
            activeMinigame === 'memory'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.5)]'
              : 'glass-panel text-purple-200 border-purple-500/30 hover:border-purple-400'
          }`}
        >
          <Brain className="w-5 h-5" />
          <span> Rune Memory (จับคู่สัญลักษณ์)</span>
        </button>

        <button
          onClick={() => {
            playSoundFX('click');
            setActiveMinigame('cipher');
          }}
          className={`px-5 py-3 rounded-2xl font-bold text-sm sm:text-base flex items-center gap-2 cursor-pointer transition-all border ${
            activeMinigame === 'cipher'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.5)]'
              : 'glass-panel text-purple-200 border-purple-500/30 hover:border-purple-400'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span> Spell Cipher (ถอดรหัสคาถา)</span>
        </button>
      </div>

      {/* MINIGAME 1: QUIZ */}
      {activeMinigame === 'quiz' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-400/30 max-w-2xl mx-auto space-y-6"
        >
          <div className="flex items-center justify-between text-xs sm:text-sm text-purple-300 pb-4 border-b border-purple-500/20">
            <span className="font-semibold flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" /> คำถามข้อที่ {quizIdx + 1} / {QUIZ_QUESTIONS.length}
            </span>
            <span className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full font-bold">
              ตอบถูกได้: +45 EXP, +60 Gold
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-amber-200 leading-snug">
            {QUIZ_QUESTIONS[quizIdx].question}
          </h3>

          <div className="space-y-3">
            {QUIZ_QUESTIONS[quizIdx].options.map((opt, idx) => {
              let btnStyle = 'glass-panel border-purple-500/30 text-purple-100 hover:border-amber-400/60';
              if (isAnswered) {
                if (idx === QUIZ_QUESTIONS[quizIdx].answerIndex) {
                  btnStyle = 'bg-emerald-600/90 border-emerald-400 text-white font-bold shadow-[0_0_20px_rgba(16,185,129,0.5)]';
                } else if (idx === selectedOption) {
                  btnStyle = 'bg-rose-600/90 border-rose-400 text-white';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswerQuiz(idx)}
                  disabled={isAnswered}
                  className={`w-full p-4 rounded-2xl text-left font-semibold text-base transition-all duration-200 flex items-center justify-between cursor-pointer border ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {isAnswered && idx === QUIZ_QUESTIONS[quizIdx].answerIndex && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                  )}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-purple-950/70 border border-amber-400/40 space-y-3"
            >
              <p className="text-xs sm:text-sm text-purple-200">
                <strong>คำอธิบาย:</strong> {QUIZ_QUESTIONS[quizIdx].explanation}
              </p>
              <button
                onClick={nextQuizQuestion}
                className="w-full py-3 rounded-xl glass-button text-white font-bold text-sm flex items-center justify-center gap-2"
              >
                <span>ข้อต่อไป (Next Question)</span>
              </button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* MINIGAME 2: RUNE MEMORY */}
      {activeMinigame === 'memory' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-400/30 max-w-xl mx-auto text-center space-y-6"
        >
          <div className="flex items-center justify-between text-xs sm:text-sm text-purple-300 pb-4 border-b border-purple-500/20">
            <span>จับคู่สัญลักษณ์เวทมนตร์ให้ครบ 4 คู่</span>
            <span className="text-amber-400 font-bold">สำเร็จแล้ว: {memoryMatches} / 4</span>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {cards.map((card, idx) => (
              <button
                key={idx}
                onClick={() => handleCardClick(idx)}
                className={`h-24 sm:h-28 rounded-2xl text-4xl flex items-center justify-center transition-all duration-300 cursor-pointer border ${
                  card.flipped || card.matched
                    ? 'bg-purple-900/90 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.4)] rotate-y-180'
                    : 'glass-panel border-purple-500/30 hover:border-amber-400/50'
                }`}
              >
                {card.flipped || card.matched ? card.symbol : '🔮'}
              </button>
            ))}
          </div>

          {memoryMatches === 4 ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-5 rounded-2xl bg-amber-500/20 border border-amber-400 text-amber-200 space-y-3"
            >
              <h4 className="text-xl font-bold glow-text-gold">🎉 ปล่อยพลังจับคู่สำเร็จ!</h4>
              <p className="text-xs sm:text-sm">คุณได้รับ: +80 EXP, +120 Gold, +3 Crystals!</p>
              <button
                onClick={resetMemoryGame}
                className="px-6 py-2.5 rounded-xl glass-button text-white font-bold text-sm inline-flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> เล่นใหม่อีกครั้ง
              </button>
            </motion.div>
          ) : (
            <button
              onClick={resetMemoryGame}
              className="text-xs text-purple-300 hover:text-amber-300 flex items-center justify-center gap-1 mx-auto cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> สับไพ่เริ่มใหม่
            </button>
          )}
        </motion.div>
      )}

      {/* MINIGAME 3: SPELL CIPHER */}
      {activeMinigame === 'cipher' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-400/30 max-w-xl mx-auto space-y-6"
        >
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-amber-300">ถอดรหัสเวทมนตร์ (Spell Cipher)</h3>
            <p className="text-xs sm:text-sm text-purple-200">
              เรียงตัวอักษรปริศนาให้กลายเป็นชื่อคาถาหรือมนตราโบราณที่ถูกต้อง
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-purple-950/80 border border-purple-500/40 text-center space-y-4 shadow-inner">
            <div className="text-3xl sm:text-4xl font-mono font-extrabold tracking-widest text-amber-400 glow-text-gold">
              {CIPHER_PUZZLES[cipherIdx].scrambled}
            </div>
            <div className="text-xs text-purple-300 bg-purple-900/50 py-1.5 px-4 rounded-full inline-block">
              💡 คำใบ้: {CIPHER_PUZZLES[cipherIdx].hint}
            </div>
          </div>

          <form onSubmit={handleCipherSubmit} className="space-y-4">
            <input
              type="text"
              value={userCipherInput}
              onChange={(e) => setUserCipherInput(e.target.value)}
              placeholder="พิมพ์ชื่อคาถาภาษาอังกฤษ..."
              className="w-full px-5 py-3 rounded-2xl bg-slate-950/80 border border-purple-400/50 text-white placeholder-purple-400/50 text-center font-mono font-bold text-xl uppercase focus:outline-none focus:border-amber-400"
            />

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl glass-button text-white font-bold text-base flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(251,191,36,0.3)]"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>ตรวจสอบคำตอบ (Submit Answer)</span>
            </button>
          </form>

          {cipherMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl border text-center text-sm font-semibold space-y-2 ${
                cipherMessage.type === 'success'
                  ? 'bg-emerald-900/60 border-emerald-400 text-emerald-200'
                  : 'bg-rose-900/60 border-rose-400 text-rose-200'
              }`}
            >
              <p>{cipherMessage.text}</p>
              {cipherMessage.type === 'success' && (
                <button
                  onClick={nextCipher}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold inline-block cursor-pointer"
                >
                  ปริศนาถัดไป →
                </button>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
};
