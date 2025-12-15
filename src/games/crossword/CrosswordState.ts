import type { IGameState } from '../core/interfaces/IGameState';
import type { CrosswordClues } from './types';

/**
 * Represents the state of a Crossword game
 */
export class CrosswordState implements IGameState {
  private grid: string[][];
  private clues: CrosswordClues;
  private size: number;

  constructor(grid: string[][], clues: CrosswordClues, size: number) {
    this.grid = grid;
    this.clues = clues;
    this.size = size;
  }

  /**
   * Serialize state to string for storage
   */
  serialize(): string {
    return JSON.stringify({
      grid: this.grid,
      clues: this.clues,
      size: this.size
    });
  }

  /**
   * Deserialize state from string
   */
  static deserialize(data: string): CrosswordState {
    const parsed = JSON.parse(data);
    return new CrosswordState(parsed.grid, parsed.clues, parsed.size);
  }

  /**
   * Instance method for IGameState interface compatibility
   */
  deserialize(data: string): IGameState {
    return CrosswordState.deserialize(data);
  }

  /**
   * Get cell value at position
   */
  getCell(row: number, col: number): string {
    if (row < 0 || row >= this.size || col < 0 || col >= this.size) {
      return '';
    }
    return this.grid[row][col];
  }

  /**
   * Set cell value at position (returns new state)
   */
  setCell(row: number, col: number, value: string): CrosswordState {
    const newGrid = this.grid.map(row => [...row]);
    newGrid[row][col] = value.toUpperCase();
    return new CrosswordState(newGrid, this.clues, this.size);
  }

  /**
   * Get the entire grid
   */
  getGrid(): string[][] {
    return this.grid.map(row => [...row]);
  }

  /**
   * Get all clues
   */
  getClues(): CrosswordClues {
    return {
      across: [...this.clues.across],
      down: [...this.clues.down]
    };
  }

  /**
   * Get grid size
   */
  getSize(): number {
    return this.size;
  }

  /**
   * Check if cell is a black cell
   */
  isBlackCell(row: number, col: number): boolean {
    return this.getCell(row, col) === '#';
  }

  /**
   * Clone the state
   */
  clone(): CrosswordState {
    return new CrosswordState(
      this.grid.map(row => [...row]),
      {
        across: [...this.clues.across],
        down: [...this.clues.down]
      },
      this.size
    );
  }
}
