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
  startedAt: number; // timestamp when activated
  durationMs: number; // how long it lasts
  hintCell?: { row: number; col: number; value: number }; // For hint powerup
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
  gameId: string; // e.g., 'sudoku', 'chess'
  difficulty: Difficulty;
  timeLimit: number; // game time limit in minutes (default: 15)
  powerupConfig?: PowerupConfig; // optional powerup configuration

  // Legacy Sudoku fields (for backwards compatibility during migration)
  puzzleString?: string; // DEPRECATED: use gameConfig.initialState
  solutionString?: string; // DEPRECATED: use gameConfig.solution

  // Game-specific configuration (serialized)
  gameConfig?: {
    initialStateString: string; // Serialized initial state
    solutionStateString: string; // Serialized solution state
    metadata?: Record<string, unknown>; // Game-specific metadata
  };
}

// Player data
export interface Player {
  name: string;
  status: PlayerStatus;
  finalScore: number | null;
  completionPercentage: number; // 0-100, calculated periodically
  powerups?: PlayerPowerups; // optional powerup state

  // Legacy Sudoku field (for backwards compatibility)
  currentBoardString?: string; // DEPRECATED: use currentGameState

  // Game-agnostic current state (serialized)
  currentGameState?: string; // Serialized current state
}

// Players map
export interface Players {
  [playerId: string]: Player;
}

// Room data structure
export interface Room {
  status: RoomStatus;
  config: RoomConfig;
  adminId: string; // Player ID of the room creator/admin
  winnerId: string | null;
  players: Players;
  startTime: number | null; // timestamp when game started
  terminatedAt?: number; // timestamp when game was terminated by admin
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
