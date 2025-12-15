import type { IGameState } from './IGameState';

/**
 * Game configuration interface
 * Contains all data needed to initialize a game instance
 */
export interface IGameConfig {
  /** Unique identifier for the game type (e.g., 'sudoku', 'chess') */
  gameId: string;

  /** Difficulty level selected by admin */
  difficulty: string;

  /** Initial game state (e.g., Sudoku puzzle, Chess starting position) */
  initialState: IGameState;

  /** Solution state (for games with definitive solutions) */
  solution: IGameState;

  /** Game-specific metadata */
  metadata: Record<string, unknown>;
}
