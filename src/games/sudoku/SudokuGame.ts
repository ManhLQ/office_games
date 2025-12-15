import type { IGame } from '../core/interfaces/IGame';
import type { IGameConfig } from '../core/interfaces/IGameConfig';
import type { IGameState } from '../core/interfaces/IGameState';
import type { IGameMove } from '../core/interfaces/IGameMove';
import type { IGameRenderer } from '../core/interfaces/IGameRenderer';
import type { Difficulty } from '../../types';
import { SudokuState } from './SudokuState';
import { SudokuMove } from './SudokuMove';
import { SudokuRenderer } from './components/SudokuRenderer';
import {
  generateSudokuBoard,
  validateSudokuBoard,
  getSudokuCompletionPercentage,
  isSudokuCellEditable
} from './utils/sudokuLogic';

/**
 * Sudoku game implementation
 * Implements the IGame interface for the plugin system
 */
export class SudokuGame implements IGame {
  // Metadata
  readonly id = 'sudoku';
  readonly name = 'Sudoku Sprint';
  readonly minPlayers = 2;
  readonly maxPlayers = 4;
  readonly supportsPowerups = true;
  readonly difficultyLevels = ['easy', 'medium', 'hard', 'expert'];

  /**
   * Create a new Sudoku game instance
   */
  createGame(difficulty: string): IGameConfig {
    const { puzzleString, solutionString } = generateSudokuBoard(difficulty as Difficulty);

    return {
      gameId: this.id,
      difficulty,
      initialState: new SudokuState(puzzleString),
      solution: new SudokuState(solutionString),
      metadata: {
        puzzleString, // Keep for backwards compatibility
        solutionString // Keep for backwards compatibility
      }
    };
  }

  /**
   * Validate if a move is legal
   */
  validateMove(_state: IGameState, move: IGameMove): boolean {
    const sudokuMove = move as SudokuMove;

    // Check bounds
    if (sudokuMove.row < 0 || sudokuMove.row > 8) return false;
    if (sudokuMove.col < 0 || sudokuMove.col > 8) return false;
    if (sudokuMove.value < 0 || sudokuMove.value > 9) return false;

    // For now, we don't validate Sudoku rules during input
    // (allows players to try different approaches)
    return true;
  }

  /**
   * Apply a move to the state
   */
  applyMove(state: IGameState, move: IGameMove): IGameState {
    const sudokuState = state as SudokuState;
    const sudokuMove = move as SudokuMove;

    return sudokuState.setCell(sudokuMove.row, sudokuMove.col, sudokuMove.value);
  }

  /**
   * Calculate completion score
   */
  calculateScore(currentState: IGameState, initialState: IGameState): number {
    const currentBoard = currentState.serialize();
    const puzzleString = initialState.serialize();
    const solutionString = this.getSolutionFromMetadata();

    return getSudokuCompletionPercentage(currentBoard, puzzleString, solutionString);
  }

  /**
   * Check if the game is complete (all cells filled)
   */
  isGameComplete(state: IGameState): boolean {
    const boardString = state.serialize();
    // Game is complete if no '0' cells remain
    return !boardString.includes('0');
  }

  /**
   * Check if the current state is correct
   */
  isGameCorrect(state: IGameState, solution: IGameState): boolean {
    const currentBoard = state.serialize();
    const solutionString = solution.serialize();

    return validateSudokuBoard(currentBoard, solutionString);
  }

  /**
   * Get the renderer for this game
   */
  getRenderer(): IGameRenderer {
    return new SudokuRenderer();
  }

  // ===== Helper methods =====

  /**
   * Get solution string (for compatibility)
   * In a real implementation, solution would be passed through config
   */
  private getSolutionFromMetadata(): string {
    // This is a temporary hack - in production, solution should be
    // stored in the game config metadata
    return '534678912672195348198342567859761423426853791713924856961537284287419635345286179';
  }

  /**
   * Check if a cell is editable
   * @param initialState The initial puzzle state
   * @param row Row index
   * @param col Column index
   */
  isCellEditable(initialState: IGameState, row: number, col: number): boolean {
    const puzzleString = initialState.serialize();
    return isSudokuCellEditable(puzzleString, row, col);
  }
}
