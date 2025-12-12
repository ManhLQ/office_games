// Room status types
export type RoomStatus = 'waiting' | 'playing' | 'finished';

// Player status types
export type PlayerStatus = 'playing' | 'finished';

// Difficulty levels
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

// Powerup types
export type PowerupType = 'hint' | 'fog' | 'peep';

// Powerup setup modes
export type PowerupSetupMode = 'random' | 'fixed' | 'random_per_player' | 'fixed_per_player';

// Powerup inventory: maps powerup type to count
export type PowerupInventory = Record<PowerupType, number>;

// Active powerup state
export interface ActivePowerup {
  type: PowerupType;
  startedAt: number; // timestamp
  durationMs: number; // duration in milliseconds
}

// Powerup configuration (admin-set)
export interface PowerupConfig {
  enabled: boolean; // whether powerups are enabled for this game
  mode: PowerupSetupMode;
  maxPowerupsPerEntity: number; // max total powerups (N, usually 3)
  perTypeMax: number; // max per type (usually 2)
  fixedList?: PowerupType[]; // for fixed modes, the selected powerups
  pool?: PowerupType[]; // for random modes, the pool to draw from
}

// Player powerup state
export interface PlayerPowerups {
  inventory: PowerupInventory; // available powerups
  activePowerup: ActivePowerup | null; // currently active powerup
}

// Shared powerup pool (for global modes)
export interface SharedPowerupPool {
  inventory: PowerupInventory; // remaining powerups in shared pool
}

// Room configuration
export interface RoomConfig {
  difficulty: Difficulty;
  puzzleString: string; // 81 characters, '0' for empty cells
  solutionString: string; // 81 characters, the answer key
  powerupConfig?: PowerupConfig; // optional powerup configuration
}

// Player data
export interface Player {
  name: string;
  currentBoardString: string; // 81 characters, player's live inputs
  finalScore: number | null;
  status: PlayerStatus;
  completionPercentage: number; // 0-100, calculated periodically
  powerups?: PlayerPowerups; // optional powerup state
}

// Players map
export interface Players {
  [playerId: string]: Player;
}

// Room data structure
export interface Room {
  status: RoomStatus;
  config: RoomConfig;
  winnerId: string | null;
  players: Players;
  startTime: number | null; // timestamp when game started
  sharedPowerupPool?: SharedPowerupPool; // for global powerup modes
}

// Rooms collection
export interface Rooms {
  [roomCode: string]: Room;
}

// Database root structure
export interface DatabaseSchema {
  rooms: Rooms;
}
