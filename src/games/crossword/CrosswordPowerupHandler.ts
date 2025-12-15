import type { IPowerupHandler, PowerupContext, PowerupResult } from '../core/interfaces/IPowerupHandler';
import type { IPowerup } from '../core/interfaces/IPowerup';
import type { IGameState } from '../core/interfaces/IGameState';
import { CrosswordState } from './CrosswordState';

/**
 * Crossword-specific powerup handler
 */
export class CrosswordPowerupHandler implements IPowerupHandler {
  canActivate(powerup: IPowerup, state: IGameState, _context: PowerupContext): boolean {
    const crosswordState = state as CrosswordState;
    const grid = crosswordState.getGrid();
    const size = crosswordState.getSize();

    // For hint, check if there are empty non-black cells
    if (powerup.id === 'hint') {
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const cell = grid[r][c];
          if (cell !== '#' && cell === '') {
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

    const { selectedCell } = context;

    // Require selected cell for crossword hints
    if (!selectedCell) {
      return {
        success: false,
        message: 'Please select a cell first'
      };
    }

    const crosswordState = state as CrosswordState;
    const solutionState = solution as CrosswordState;
    const grid = crosswordState.getGrid();
    const solutionGrid = solutionState.getGrid();

    // Check if selected cell is valid (not black and empty)
    const cell = grid[selectedCell.row][selectedCell.col];
    if (cell === '#') {
      return {
        success: false,
        message: 'Cannot hint black cells'
      };
    }

    // Provide hint for selected cell (even if already filled)
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
}
