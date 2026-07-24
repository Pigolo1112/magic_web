'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LeaderboardEntry } from '@/lib/types';
import { MAGIC_AFFINITIES } from '@/lib/constants';
import { Trophy, RefreshCw, Crown, Award, Coins, Flame } from 'lucide-react';
import { playSoundFX } from '@/lib/audio';

export const LeaderboardTab: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-amber-400/30 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold glow-text-gold flex items-center gap-2">
            <Trophy className="w-7 h-7 text-amber-400" />
            <span>ทำเนียบมหาจอมเวท (Hall of Fame)</span>
          </h2>
          <p className="text-sm text-purple-200">
            รายนามจอมเวทผู้ยิ่งใหญ่ที่ทำคะแนน เลเวล และสะสมขุมทรัพย์สูงสุดในสถาบัน
          </p>
        </div>

        <button
          onClick={() => {
            playSoundFX('click');
            fetchLeaderboard();
          }}
          disabled={loading}
          className="p-3 rounded-2xl glass-panel text-amber-300 hover:text-white border border-amber-400/40 cursor-pointer transition-all"
          title="รีเฟรชอันดับ"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Leaderboard Table Container */}
      <div className="glass-panel rounded-3xl p-4 sm:p-6 border border-purple-500/30 overflow-x-auto">
        {loading ? (
          <div className="py-16 text-center text-purple-300 font-bold space-y-3">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
            <p>กำลังดึงข้อมูลอันดับจาก SQLite Database...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="py-12 text-center text-purple-300">
            ยังไม่มีข้อมูลจัดอันดับในระบบ
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-purple-500/30 text-purple-300 text-xs sm:text-sm font-bold">
                <th className="py-3 px-4 text-center">อันดับ (Rank)</th>
                <th className="py-3 px-4">ชื่อผู้เล่น (Mage Name)</th>
                <th className="py-3 px-4">สายพลังธาตุ</th>
                <th className="py-3 px-4 text-center">Level</th>
                <th className="py-3 px-4 text-right">Gold</th>
                <th className="py-3 px-4 text-right">ภารกิจที่สำเร็จ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/15">
              {leaderboard.map((entry, idx) => {
                const aff = MAGIC_AFFINITIES[entry.affinity] || MAGIC_AFFINITIES.fire;
                const isTop1 = idx === 0;
                const isTop2 = idx === 1;
                const isTop3 = idx === 2;

                return (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className={`transition-all hover:bg-purple-900/30 ${
                      isTop1 ? 'bg-amber-950/40 text-amber-200' : ''
                    }`}
                  >
                    {/* Rank Badge */}
                    <td className="py-4 px-4 text-center font-bold">
                      {isTop1 ? (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.8)] font-extrabold text-sm">
                          1
                        </span>
                      ) : isTop2 ? (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-300 text-slate-950 font-extrabold text-sm">
                          2
                        </span>
                      ) : isTop3 ? (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-700 text-white font-extrabold text-sm">
                          3
                        </span>
                      ) : (
                        <span className="text-purple-300 font-mono text-sm">#{idx + 1}</span>
                      )}
                    </td>

                    {/* Name & Title */}
                    <td className="py-4 px-4">
                      <div className="font-extrabold text-base text-purple-100 flex items-center gap-2">
                        <span>{entry.name}</span>
                        {isTop1 && <Crown className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />}
                      </div>
                      <div className="text-xs text-amber-300/80 italic">{entry.title}</div>
                    </td>

                    {/* Element */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                        <span className="text-lg">{aff.avatarIcon}</span>
                        <span className="text-purple-200">{aff.name}</span>
                      </div>
                    </td>

                    {/* Level */}
                    <td className="py-4 px-4 text-center">
                      <span className="px-3 py-1 rounded-full bg-purple-900/80 border border-purple-400/40 font-extrabold text-amber-300 text-xs">
                        Lv.{entry.level}
                      </span>
                    </td>

                    {/* Gold */}
                    <td className="py-4 px-4 text-right font-mono font-bold text-amber-400 text-sm">
                      {entry.gold.toLocaleString()} G
                    </td>

                    {/* Quests Completed */}
                    <td className="py-4 px-4 text-right font-semibold text-purple-200 text-sm">
                      {entry.questsCompleted} Quests
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
