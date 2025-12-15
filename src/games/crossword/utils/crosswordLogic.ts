import type { CrosswordPuzzle } from '../types';

/**
 * Calculate completion percentage for crossword
 */
export function getCrosswordCompletionPercentage(
  currentBoard: string,
  solutionString: string
): number {
  const current = JSON.parse(currentBoard);
  const solution = JSON.parse(solutionString);

  let correctLetters = 0;
  let totalLetters = 0;

  const size = solution.size;
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const solutionCell = solution.grid[row][col];

      // Skip black cells
      if (solutionCell === '#') continue;

      totalLetters++;

      // Check if current matches solution
      if (current.grid[row][col] === solutionCell) {
        correctLetters++;
      }
    }
  }

  if (totalLetters === 0) return 100;
  return Math.round((correctLetters / totalLetters) * 100);
}

/**
 * Validate if crossword is completely and correctly solved
 */
export function validateCrosswordBoard(currentBoard: string, solution: string): boolean {
  const current = JSON.parse(currentBoard);
  const sol = JSON.parse(solution);

  const size = sol.size;
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (current.grid[row][col] !== sol.grid[row][col]) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Get word cells at position in given direction
 */
export function getWordAtPosition(
  grid: string[][],
  row: number,
  col: number,
  direction: 'across' | 'down'
): { cells: { row: number, col: number }[], word: string } {
  const cells: { row: number, col: number }[] = [];
  const size = grid.length;

  if (direction === 'across') {
    // Find start of word
    let startCol = col;
    while (startCol > 0 && grid[row][startCol - 1] !== '#') {
      startCol--;
    }

    // Collect cells
    let c = startCol;
    while (c < size && grid[row][c] !== '#') {
      cells.push({ row, col: c });
      c++;
    }
  } else {
    // Find start of word
    let startRow = row;
    while (startRow > 0 && grid[startRow - 1][col] !== '#') {
      startRow--;
    }

    // Collect cells
    let r = startRow;
    while (r < size && grid[r][col] !== '#') {
      cells.push({ row: r, col });
      r++;
    }
  }

  const word = cells.map(c => grid[c.row][c.col]).join('');
  return { cells, word };
}

/**
 * Create empty grid for initial state
 */
export function createEmptyGrid(puzzle: CrosswordPuzzle): string[][] {
  return puzzle.grid.map((row: string[]) =>
    row.map((cell: string) => cell === '#' ? '#' : '')
  );
}
