export type ElementType = 'fire' | 'water' | 'wind' | 'earth' | 'light' | 'dark';

export interface AffinityInfo {
  id: ElementType;
  name: string;
  title: string;
  color: string;
  badgeBg: string;
  iconName: string;
  description: string;
  baseStats: {
    atk: number;
    def: number;
    mp: number;
    manaRegen: number;
  };
  specialSkill: string;
  startingSpellId: string;
  avatarIcon: string;
}

export interface Spell {
  id: string;
  name: string;
  element: ElementType;
  manaCost: number;
  damage: number;
  cooldown: number;
  reqLevel: number;
  icon: string;
  description: string;
  effectType: 'fire' | 'ice' | 'thunder' | 'wind' | 'light' | 'shadow';
}

export interface ShopItem {
  id: string;
  name: string;
  category: 'wand' | 'robe' | 'hat' | 'pet' | 'aura';
  priceGold: number;
  priceCrystal: number;
  reqLevel: number;
  statBonus: {
    atk?: number;
    def?: number;
    mp?: number;
  };
  icon: string;
  description: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  reqType: 'level' | 'gold' | 'quests' | 'spells' | 'chests';
  reqValue: number;
  rewardGold: number;
  rewardCrystal: number;
  rewardTitle?: string;
}

export interface PlayerData {
  id: string;
  name: string;
  affinity: ElementType;
  level: number;
  exp: number;
  maxExp: number;
  gold: number;
  crystal: number;
  title: string;
  equippedWand: string;
  equippedRobe: string;
  equippedHat: string;
  equippedPet: string;
  equippedAura: string;
  unlockedSpells: string[];
  unlockedAchievements: string[];
  inventory: string[];
  questsCompleted: number;
  dailyQuestClaimed: boolean;
  lastDailyReset: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  affinity: ElementType;
  level: number;
  gold: number;
  title: string;
  questsCompleted: number;
}
