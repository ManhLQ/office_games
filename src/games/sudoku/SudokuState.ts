import type { IGameState } from '../core/interfaces/IGameState';

/**
 * Sudoku-specific state implementation
 * Represents a 9x9 Sudoku grid
 */
export class SudokuState implements IGameState {
  private grid: number[][];

  constructor(boardString: string) {
    this.grid = this.stringToGrid(boardString);
  }

  /**
   * Serialize state to 81-character string
   */
  serialize(): string {
    return this.gridToString();
  }

  /**
   * Deserialize state from string
   */
  deserialize(data: string): IGameState {
    return new SudokuState(data);
  }

  /**
   * Create a deep copy of the state
   */
  clone(): IGameState {
    return new SudokuState(this.serialize());
  }

  // ===== Sudoku-specific methods =====

  /**
   * Get value at specific cell
   */
  getCell(row: number, col: number): number {
    return this.grid[row][col];
  }

  /**
   * Set value at specific cell (returns new state for immutability)
   */
  setCell(row: number, col: number, value: number): SudokuState {
    const newState = this.clone() as SudokuState;
    newState.grid[row][col] = value;
    return newState;
  }

  /**
   * Get the entire grid
   */
  getGrid(): number[][] {
    return this.grid.map(row => [...row]); // Return copy
  }

  /**
   * Check if a cell is empty
   */
  isCellEmpty(row: number, col: number): boolean {
    return this.grid[row][col] === 0;
  }

  /**
   * Count how many times a number appears in the grid
   */
  countNumber(num: number): number {
    let count = 0;
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (this.grid[row][col] === num) {
          count++;
        }
      }
    }
    return count;
  }

  /**
   * Get all number counts (1-9)
   */
  getNumberCounts(): Record<number, number> {
    const counts: Record<number, number> = {};
    for (let i = 1; i <= 9; i++) {
      counts[i] = this.countNumber(i);
    }
    return counts;
  }

  // ===== Private helper methods =====

  /**
   * Convert 81-character string to 9x9 grid
   */
  private stringToGrid(boardString: string): number[][] {
    const grid: number[][] = [];
    for (let row = 0; row < 9; row++) {
      grid[row] = [];
      for (let col = 0; col < 9; col++) {
        const index = row * 9 + col;
        grid[row][col] = parseInt(boardString[index] || '0', 10);
      }
    }
    return grid;
  }

  /**
   * Convert 9x9 grid to 81-character string
   */
  private gridToString(): string {
    let boardString = '';
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        boardString += this.grid[row][col].toString();
      }
    }
    return boardString;
  }
}
