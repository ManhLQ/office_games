// Room status types
export type RoomStatus = 'waiting' | 'playing' | 'finished';

// Player status types
export type PlayerStatus = 'playing' | 'finished';

// Difficulty levels
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

// Room configuration
export interface RoomConfig {
  difficulty: Difficulty;
  puzzleString: string; // 81 characters, '0' for empty cells
  solutionString: string; // 81 characters, the answer key
}

// Player data
export interface Player {
  name: string;
  currentBoardString: string; // 81 characters, player's live inputs
  finalScore: number | null;
  status: PlayerStatus;
  completionPercentage: number; // 0-100, calculated periodically
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
}

// Rooms collection
export interface Rooms {
  [roomCode: string]: Room;
}

// Database root structure
export interface DatabaseSchema {
  rooms: Rooms;
}
