import Database from 'better-sqlite3';
import path from 'path';
import { PlayerData, LeaderboardEntry } from './types';

const dbPath = path.join(process.cwd(), 'arcane_academy.db');

let dbInstance: InstanceType<typeof Database> | null = null;

export function getDb() {
  if (!dbInstance) {
    dbInstance = new Database(dbPath);
    dbInstance.pragma('journal_mode = WAL');
    initTables(dbInstance);
  }
  return dbInstance;
}

function initTables(db: InstanceType<typeof Database>) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      affinity TEXT NOT NULL,
      level INTEGER DEFAULT 1,
      exp INTEGER DEFAULT 0,
      max_exp INTEGER DEFAULT 100,
      gold INTEGER DEFAULT 100,
      crystal INTEGER DEFAULT 10,
      title TEXT DEFAULT 'จอมเวทฝึกหัด',
      equipped_wand TEXT DEFAULT 'wand_novice',
      equipped_robe TEXT DEFAULT 'robe_apprentice',
      equipped_hat TEXT DEFAULT 'hat_classic',
      equipped_pet TEXT DEFAULT '',
      equipped_aura TEXT DEFAULT '',
      unlocked_spells TEXT DEFAULT '[]',
      unlocked_achievements TEXT DEFAULT '[]',
      inventory TEXT DEFAULT '[]',
      quests_completed INTEGER DEFAULT 0,
      daily_quest_claimed INTEGER DEFAULT 0,
      last_daily_reset TEXT DEFAULT '',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Check if initial sample leaderboard data exists
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM players');
  const result = countStmt.get() as { count: number };
  if (result.count === 0) {
    seedInitialPlayers(db);
  }
}

function seedInitialPlayers(db: InstanceType<typeof Database>) {
  const insert = db.prepare(`
    INSERT INTO players (id, name, affinity, level, exp, max_exp, gold, crystal, title, unlocked_spells, quests_completed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const seeds = [
    {
      id: 'archmage_merlin',
      name: 'Merlin the Great',
      affinity: 'light',
      level: 15,
      exp: 420,
      maxExp: 1500,
      gold: 4500,
      crystal: 120,
      title: 'มหาจอมเวทแห่งแสง',
      spells: JSON.stringify(['fireball', 'icespike', 'windblade', 'thunder', 'holylight']),
      quests: 48,
    },
    {
      id: 'sorceress_elena',
      name: 'Elena Frost',
      affinity: 'water',
      level: 12,
      exp: 180,
      maxExp: 1200,
      gold: 2800,
      crystal: 65,
      title: 'ผู้พิชิตสายธาร',
      spells: JSON.stringify(['icespike', 'windblade', 'holylight']),
      quests: 35,
    },
    {
      id: 'pyro_ignis',
      name: 'Ignis Flameheart',
      affinity: 'fire',
      level: 9,
      exp: 90,
      maxExp: 900,
      gold: 1750,
      crystal: 40,
      title: 'ผู้เผาผลาญศัตรู',
      spells: JSON.stringify(['fireball', 'thunder']),
      quests: 22,
    },
    {
      id: 'shadow_malakor',
      name: 'Malakor Void',
      affinity: 'dark',
      level: 8,
      exp: 300,
      maxExp: 800,
      gold: 1400,
      crystal: 30,
      title: 'จอมเวทเงาราตรี',
      spells: JSON.stringify(['shadowcurse', 'fireball']),
      quests: 19,
    },
  ];

  for (const s of seeds) {
    insert.run(s.id, s.name, s.affinity, s.level, s.exp, s.maxExp, s.gold, s.crystal, s.title, s.spells, s.quests);
  }
}

export function savePlayerToDb(player: PlayerData): PlayerData {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO players (
      id, name, affinity, level, exp, max_exp, gold, crystal, title,
      equipped_wand, equipped_robe, equipped_hat, equipped_pet, equipped_aura,
      unlocked_spells, unlocked_achievements, inventory, quests_completed,
      daily_quest_claimed, last_daily_reset, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      affinity = excluded.affinity,
      level = excluded.level,
      exp = excluded.exp,
      max_exp = excluded.max_exp,
      gold = excluded.gold,
      crystal = excluded.crystal,
      title = excluded.title,
      equipped_wand = excluded.equipped_wand,
      equipped_robe = excluded.equipped_robe,
      equipped_hat = excluded.equipped_hat,
      equipped_pet = excluded.equipped_pet,
      equipped_aura = excluded.equipped_aura,
      unlocked_spells = excluded.unlocked_spells,
      unlocked_achievements = excluded.unlocked_achievements,
      inventory = excluded.inventory,
      quests_completed = excluded.quests_completed,
      daily_quest_claimed = excluded.daily_quest_claimed,
      last_daily_reset = excluded.last_daily_reset,
      updated_at = CURRENT_TIMESTAMP
  `);

  stmt.run(
    player.id,
    player.name,
    player.affinity,
    player.level,
    player.exp,
    player.maxExp,
    player.gold,
    player.crystal,
    player.title,
    player.equippedWand,
    player.equippedRobe,
    player.equippedHat,
    player.equippedPet,
    player.equippedAura,
    JSON.stringify(player.unlockedSpells),
    JSON.stringify(player.unlockedAchievements),
    JSON.stringify(player.inventory),
    player.questsCompleted,
    player.dailyQuestClaimed ? 1 : 0,
    player.lastDailyReset
  );

  return player;
}

export function getPlayerFromDb(id: string): PlayerData | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM players WHERE id = ?');
  const row = stmt.get(id) as any;

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    affinity: row.affinity,
    level: row.level,
    exp: row.exp,
    maxExp: row.max_exp,
    gold: row.gold,
    crystal: row.crystal,
    title: row.title,
    equippedWand: row.equipped_wand || '',
    equippedRobe: row.equipped_robe || '',
    equippedHat: row.equipped_hat || '',
    equippedPet: row.equipped_pet || '',
    equippedAura: row.equipped_aura || '',
    unlockedSpells: JSON.parse(row.unlocked_spells || '[]'),
    unlockedAchievements: JSON.parse(row.unlocked_achievements || '[]'),
    inventory: JSON.parse(row.inventory || '[]'),
    questsCompleted: row.quests_completed || 0,
    dailyQuestClaimed: Boolean(row.daily_quest_claimed),
    lastDailyReset: row.last_daily_reset || '',
  };
}

export function getLeaderboardFromDb(): LeaderboardEntry[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT id, name, affinity, level, gold, title, quests_completed
    FROM players
    ORDER BY level DESC, gold DESC
    LIMIT 20
  `);
  const rows = stmt.all() as any[];

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    affinity: r.affinity,
    level: r.level,
    gold: r.gold,
    title: r.title,
    questsCompleted: r.quests_completed,
  }));
}
