import type { IGameMove } from '../core/interfaces/IGameMove';

/**
 * Represents a move in a Crossword game
 */
export class CrosswordMove implements IGameMove {
  row: number;
  col: number;
  value: string | number; // Single letter (A-Z) or 0 to clear
  direction?: 'across' | 'down'; // Optional hint for UI navigation

  constructor(row: number, col: number, value: string | number, direction?: 'across' | 'down') {
    this.row = row;
    this.col = col;
    this.value = value;
    this.direction = direction;
  }
}
