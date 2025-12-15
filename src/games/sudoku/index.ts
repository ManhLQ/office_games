import { gameRegistry } from '../core/GameRegistry';
import { SudokuGame } from './SudokuGame';

/**
 * Sudoku game plugin entry point
 * Auto-registers the game when imported
 */

// Create and register the Sudoku game
export const sudokuGame = new SudokuGame();
gameRegistry.register(sudokuGame);

// Export game classes for direct access if needed
export * from './SudokuGame';
export * from './SudokuState';
export * from './SudokuMove';
export * from './utils/sudokuLogic';
