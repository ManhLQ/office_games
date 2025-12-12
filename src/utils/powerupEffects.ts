import { stringToGrid } from './sudoku';

/**
 * Finds a hint cell - returns the preferred cell if empty, otherwise first empty cell
 * @param currentBoardString - Current board state
 * @param solutionString - Solution board
 * @param preferredCell - Optional preferred cell position (row, col)
 * @returns Cell position and value, or null if board is complete
 */
export function getHintCell(
  currentBoardString: string,
  solutionString: string,
  preferredCell?: { row: number; col: number }
): { row: number; col: number; value: number } | null {
  const currentGrid = stringToGrid(currentBoardString);
  const solutionGrid = stringToGrid(solutionString);

  // If preferred cell is provided and empty, use it
  if (preferredCell) {
    const { row, col } = preferredCell;
    if (currentGrid[row][col] === 0) {
      return {
        row,
        col,
        value: solutionGrid[row][col],
      };
    }
  }

  // Find first empty cell
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (currentGrid[row][col] === 0) {
        return {
          row,
          col,
          value: solutionGrid[row][col],
        };
      }
    }
  }

  return null; // Board is complete
}
