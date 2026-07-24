'use client';

import React, { useState, useEffect } from 'react';
import { MagicBackground } from '@/components/MagicBackground';
import { HeroSection } from '@/components/HeroSection';
import { CharacterSelect } from '@/components/CharacterSelect';
import { AcademyHub } from '@/components/AcademyHub';
import { HowToPlayModal } from '@/components/HowToPlayModal';
import { LeaderboardTab } from '@/components/tabs/LeaderboardTab';
import { PlayerData } from '@/lib/types';
import { startAmbientBGM } from '@/lib/audio';

export default function Home() {
  const [viewState, setViewState] = useState<'hero' | 'select' | 'hub'>('hero');
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [isNight, setIsNight] = useState(true);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  // Auto load existing save from localStorage or DB if player saved previously
  useEffect(() => {
    const savedPlayerId = localStorage.getItem('arcane_player_id');
    if (savedPlayerId) {
      fetch(`/api/player?id=${savedPlayerId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.player) {
            setPlayer(data.player);
          }
        })
        .catch((err) => console.error(err));
    }
  }, []);

  const handleStartGame = () => {
    if (player) {
      setViewState('hub');
    } else {
      setViewState('select');
    }
    startAmbientBGM();
  };

  const handleCharacterCreated = (newPlayer: PlayerData) => {
    setPlayer(newPlayer);
    localStorage.setItem('arcane_player_id', newPlayer.id);

    // Save to SQLite
    fetch('/api/player', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPlayer),
    }).catch((e) => console.error(e));

    setViewState('hub');
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Dynamic Magic Canvas Background */}
      <MagicBackground isNight={isNight} />

      {/* Main View Router */}
      {viewState === 'hero' && (
        <HeroSection
          onStartGame={handleStartGame}
          onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        />
      )}

      {viewState === 'select' && (
        <CharacterSelect
          onCharacterCreated={handleCharacterCreated}
          onBack={() => setViewState('hero')}
        />
      )}

      {viewState === 'hub' && player && (
        <AcademyHub
          initialPlayer={player}
          isNight={isNight}
          onToggleDayNight={() => setIsNight((prev) => !prev)}
        />
      )}

      {/* How to Play Modal */}
      <HowToPlayModal isOpen={isHowToPlayOpen} onClose={() => setIsHowToPlayOpen(false)} />

      {/* Quick Leaderboard Modal */}
      {isLeaderboardOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setIsLeaderboardOpen(false)}
                className="px-4 py-2 rounded-xl bg-purple-900 text-purple-200 hover:text-white font-bold cursor-pointer"
              >
                ✕ ปิดหน้าต่าง
              </button>
            </div>
            <LeaderboardTab />
          </div>
        </div>
      )}
    </main>
  );
}
