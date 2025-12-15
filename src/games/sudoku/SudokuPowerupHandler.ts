import type { IPowerupHandler, PowerupContext, PowerupResult } from '../core/interfaces/IPowerupHandler';
import type { IPowerup } from '../core/interfaces/IPowerup';
import type { IGameState } from '../core/interfaces/IGameState';
import { SudokuState } from './SudokuState';

/**
 * Sudoku-specific powerup handler
 */
export class SudokuPowerupHandler implements IPowerupHandler {
  canActivate(powerup: IPowerup, state: IGameState, _context: PowerupContext): boolean {
    const sudokuState = state as SudokuState;
    const grid = sudokuState.getGrid();

    // For hint, check if there are empty cells
    if (powerup.id === 'hint') {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (grid[r][c] === 0) {
            return true;
          }
        }
      }
      return false; // No empty cells
    }

    // Fog and peep are always available
    return true;
  }

  activate(powerup: IPowerup, state: IGameState, context: PowerupContext, solution?: IGameState): PowerupResult {
    if (powerup.id === 'hint') {
      return this.handleHint(state, context, solution);
    }

    // Fog and peep are handled at the framework level
    return {
      success: true,
      message: `${powerup.name} activated!`
    };
  }

  private handleHint(state: IGameState, context: PowerupContext, solution?: IGameState): PowerupResult {
    if (!solution) {
      return { success: false, message: 'Solution not available' };
    }

    const sudokuState = state as SudokuState;
    const solutionState = solution as SudokuState;
    const grid = sudokuState.getGrid();
    const solutionGrid = solutionState.getGrid();
    const { selectedCell } = context;

    // Try to use selected cell first
    if (selectedCell && grid[selectedCell.row][selectedCell.col] === 0) {
      // Selected cell is empty, use it
      return {
        success: true,
        message: 'Hint for selected cell',
        hintCell: {
          row: selectedCell.row,
          col: selectedCell.col,
          value: solutionGrid[selectedCell.row][selectedCell.col]
        }
      };
    }

    // Find a random empty cell
    const emptyCells: Array<{ row: number; col: number }> = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] === 0) {
          emptyCells.push({ row: r, col: c });
        }
      }
    }

    if (emptyCells.length === 0) {
      return {
        success: false,
        message: 'No empty cells available'
      };
    }

    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    return {
      success: true,
      message: 'Hint for random cell',
      hintCell: {
        row: randomCell.row,
        col: randomCell.col,
        value: solutionGrid[randomCell.row][randomCell.col]
      }
    };
  }
}
