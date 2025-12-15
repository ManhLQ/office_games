/**
 * Core game move interface
 * Represents a single move/action in any game
 */
export interface IGameMove {
  // Row and column for grid-based games (Sudoku, Chess, Tic-Tac-Toe)
  row?: number;
  col?: number;

  // Value for games that input numbers/letters (Sudoku, Word games)
  value?: number | string;

  // For Chess-like games
  from?: string;
  to?: string;

  // Additional game-specific data
  metadata?: Record<string, unknown>;
}
