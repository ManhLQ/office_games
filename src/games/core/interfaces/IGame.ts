import type { IGameConfig } from './IGameConfig';
import type { IGameState } from './IGameState';
import type { IGameMove } from './IGameMove';
import type { IGameRenderer } from './IGameRenderer';

/**
 * Core game interface
 * All games must implement this interface to be compatible with the platform
 */
export interface IGame {
  // ===== Metadata =====

  /** Unique identifier for the game (e.g., 'sudoku', 'chess', 'tic-tac-toe') */
  readonly id: string;

  /** Display name of the game */
  readonly name: string;

  /** Minimum number of players required */
  readonly minPlayers: number;

  /** Maximum number of players allowed */
  readonly maxPlayers: number;

  /** Whether this game supports powerups */
  readonly supportsPowerups: boolean;

  /** Available difficulty levels for this game */
  readonly difficultyLevels: string[];

  // ===== Game Lifecycle =====

  /**
   * Create a new game instance with the specified difficulty
   * @param difficulty Selected difficulty level
   * @returns Game configuration with initial and solution states
   */
  createGame(difficulty: string): IGameConfig;

  /**
   * Validate if a move is legal in the current state
   * @param state Current game state
   * @param move Move to validate
   * @returns true if move is valid, false otherwise
   */
  validateMove(state: IGameState, move: IGameMove): boolean;

  /**
   * Apply a move to the current state
   * @param state Current game state
   * @param move Move to apply
   * @returns New game state with move applied
   */
  applyMove(state: IGameState, move: IGameMove): IGameState;

  /**
   * Calculate completion score for the current state
   * @param state Current game state
   * @param initialState Initial game state
   * @returns Score as percentage (0-100)
   */
  calculateScore(state: IGameState, initialState: IGameState): number;

  /**
   * Check if the game is complete (all cells filled, checkmate, etc.)
   * @param state Current game state
   * @returns true if game is complete
   */
  isGameComplete(state: IGameState): boolean;

  /**
   * Check if the current state is correct/winning
   * @param state Current game state
   * @param solution Solution state
   * @returns true if state matches solution or winning condition met
   */
  isGameCorrect(state: IGameState, solution: IGameState): boolean;

  // ===== Rendering =====

  /**
   * Get the renderer for this game
   * @returns Game-specific renderer instance
   */
  getRenderer(): IGameRenderer;
}
