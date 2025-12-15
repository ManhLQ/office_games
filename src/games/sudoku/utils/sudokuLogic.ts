import { getSudoku } from 'sudoku-gen';
import type { Difficulty } from '../../../types';


/**
 * Generates a new Sudoku board with puzzle and solution
 * @param difficulty - The difficulty level of the puzzle
 * @returns Object containing puzzle and solution strings (81 characters each)
 */
export function generateSudokuBoard(difficulty: Difficulty): {
  puzzleString: string;
  solutionString: string;
} {
  const sudoku = getSudoku(difficulty);

  // Convert '-' to '0' for empty cells to match our data format
  const puzzleString = sudoku.puzzle.replace(/-/g, '0');
  const solutionString = sudoku.solution;

  return {
    puzzleString,
    solutionString,
  };
}

/**
 * Validates if the current board matches the solution
 * @param currentBoard - The player's current board string (81 characters)
 * @param solution - The solution string (81 characters)
 * @returns true if the board is completely and correctly solved
 */
export function validateSudokuBoard(currentBoard: string, solution: string): boolean {
  if (currentBoard.length !== 81 || solution.length !== 81) {
    return false;
  }
  return currentBoard === solution;
}

/**
 * Calculates the completion percentage of a Sudoku board
 * @param currentBoard - The player's current board string
 * @param puzzleString - The original puzzle string (to identify empty cells)
 * @param solutionString - The solution string
 * @returns Score as percentage (0-100)
 */
export function getSudokuCompletionPercentage(
  currentBoard: string,
  puzzleString: string,
  solutionString: string
): number {
  if (
    currentBoard.length !== 81 ||
    puzzleString.length !== 81 ||
    solutionString.length !== 81
  ) {
    return 0;
  }

  let correctlyFilled = 0;
  let totalEmpty = 0;

  for (let i = 0; i < 81; i++) {
    // Count cells that were originally empty
    if (puzzleString[i] === '0') {
      totalEmpty++;
      // Check if player's answer is correct
      if (currentBoard[i] === solutionString[i]) {
        correctlyFilled++;
      }
    }
  }

  if (totalEmpty === 0) return 100;

  return Math.round((correctlyFilled / totalEmpty) * 100);
}

/**
 * Checks if a cell is editable (was originally empty in the puzzle)
 * @param puzzleString - The original puzzle string
 * @param row - Row index (0-8)
 * @param col - Column index (0-8)
 * @returns true if the cell can be edited
 */
export function isSudokuCellEditable(
  puzzleString: string,
  row: number,
  col: number
): boolean {
  const index = row * 9 + col;
  return puzzleString[index] === '0';
}
