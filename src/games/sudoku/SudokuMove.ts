import type { IGameMove } from '../core/interfaces/IGameMove';

/**
 * Sudoku-specific move implementation
 */
export class SudokuMove implements IGameMove {
  row: number;
  col: number;
  value: number;

  constructor(row: number, col: number, value: number) {
    this.row = row;
    this.col = col;
    this.value = value;
  }

  /**
   * Create a move from object
   */
  static fromObject(obj: { row: number; col: number; value: number }): SudokuMove {
    return new SudokuMove(obj.row, obj.col, obj.value);
  }

  /**
   * Check if this is a clear move (value = 0)
   */
  isClear(): boolean {
    return this.value === 0;
  }
}
