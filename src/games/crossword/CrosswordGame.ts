import type { IGame } from '../core/interfaces/IGame';
import type { IGameConfig } from '../core/interfaces/IGameConfig';
import type { IGameState } from '../core/interfaces/IGameState';
import type { IGameMove } from '../core/interfaces/IGameMove';
import type { IGameRenderer } from '../core/interfaces/IGameRenderer';
import { CrosswordState } from './CrosswordState';
import { CrosswordMove } from './CrosswordMove';
import { CrosswordRenderer } from './components/CrosswordRenderer';
import { CrosswordPowerupHandler } from './CrosswordPowerupHandler';
import { loadPuzzle } from './utils/puzzleLoader';
import { createEmptyGrid, getCrosswordCompletionPercentage, validateCrosswordBoard } from './utils/crosswordLogic';
import type { Difficulty } from './types';

/**
 * Crossword game implementation
 */
export class CrosswordGame implements IGame {
  readonly id = 'crossword';
  readonly name = 'Crossword';
  readonly description = 'Collaborative crossword puzzle solving';
  readonly minPlayers = 1;
  readonly maxPlayers = 4;
  readonly supportsPowerups = true;
  readonly difficultyLevels = ['easy', 'medium', 'hard', 'expert'];

  /**
   * Create a new crossword game instance
   */
  createGame(difficulty: string): IGameConfig {
    const puzzle = loadPuzzle(difficulty as Difficulty);
    const emptyGrid = createEmptyGrid(puzzle);

    const initialState = new CrosswordState(emptyGrid, puzzle.clues, puzzle.size);
    const solution = new CrosswordState(puzzle.grid, puzzle.clues, puzzle.size);

    return {
      gameId: this.id,
      difficulty,
      initialState,
      solution,
      metadata: {
        puzzleString: initialState.serialize(),
        solutionString: solution.serialize()
      }
    };
  }

  /**
   * Validate if a move is legal
   */
  validateMove(state: IGameState, move: IGameMove): boolean {
    const crosswordState = state as CrosswordState;
    const crosswordMove = move as CrosswordMove;

    // Check bounds
    const size = crosswordState.getSize();
    if (crosswordMove.row < 0 || crosswordMove.row >= size ||
      crosswordMove.col < 0 || crosswordMove.col >= size) {
      return false;
    }

    // Check if cell is black (not editable)
    if (crosswordState.isBlackCell(crosswordMove.row, crosswordMove.col)) {
      return false;
    }

    // Value must be a letter (A-Z) or empty/0 to clear
    if (typeof crosswordMove.value === 'string') {
      const val = crosswordMove.value.toUpperCase();
      if (val !== '' && !/^[A-Z]$/.test(val)) {
        return false;
      }
    } else if (crosswordMove.value !== 0) {
      return false;
    }

    return true;
  }

  /**
   * Apply a move to the state
   */
  applyMove(state: IGameState, move: IGameMove): IGameState {
    const crosswordState = state as CrosswordState;
    const crosswordMove = move as CrosswordMove;

    const value = typeof crosswordMove.value === 'string'
      ? crosswordMove.value
      : (crosswordMove.value === 0 ? '' : String(crosswordMove.value));

    return crosswordState.setCell(crosswordMove.row, crosswordMove.col, value);
  }

  /**
   * Calculate completion score
   */
  calculateScore(currentState: IGameState, _initialState: IGameState, solution?: IGameState): number {
    const currentBoard = currentState.serialize();
    const solutionString = solution ? solution.serialize() : '';

    if (!solutionString) {
      console.error('CrosswordGame: No solution available for score calculation');
      return 0;
    }

    return getCrosswordCompletionPercentage(currentBoard, solutionString);
  }

  /**
   * Check if the game is complete (all cells filled)
   */
  isGameComplete(state: IGameState): boolean {
    const crosswordState = state as CrosswordState;
    const grid = crosswordState.getGrid();
    const size = crosswordState.getSize();

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const cell = grid[row][col];
        // If cell is not black and is empty, game is not complete
        if (cell !== '#' && cell === '') {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Check if the current state is correct
   */
  isGameCorrect(state: IGameState, solution: IGameState): boolean {
    const currentBoard = state.serialize();
    const solutionString = solution.serialize();

    return validateCrosswordBoard(currentBoard, solutionString);
  }

  /**
   * Get the renderer for this game
   */
  getRenderer(): IGameRenderer {
    return new CrosswordRenderer();
  }

  /**
   * Get the powerup handler for this game
   */
  getPowerupHandler(): import('../core/interfaces/IPowerupHandler').IPowerupHandler {
    return new CrosswordPowerupHandler();
  }
}
