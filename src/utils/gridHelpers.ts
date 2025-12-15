/**
 * Grid helper utilities for grid-based games
 */

/**
 * Check if a border should be rendered for a 3x3 block (Sudoku)
 * @param index Current index (0-8)
 * @returns true if border should be rendered
 */
export function shouldRenderBlockBorderRight(index: number): boolean {
  return (index + 1) % 3 === 0 && index < 8;
}

/**
 * Check if a bottom border should be rendered for a 3x3 block (Sudoku)
 * @param index Current index (0-8)
 * @returns true if border should be rendered
 */
export function shouldRenderBlockBorderBottom(index: number): boolean {
  return (index + 1) % 3 === 0 && index < 8;
}

/**
 * Convert 2D grid coordinates to 1D array index
 * @param row Row index
 * @param col Column index
 * @param gridSize Grid size (default 9 for Sudoku)
 * @returns 1D array index
 */
export function gridCoordinatesToIndex(row: number, col: number, gridSize: number = 9): number {
  return row * gridSize + col;
}

/**
 * Convert 1D array index to 2D grid coordinates
 * @param index 1D array index
 * @param gridSize Grid size (default 9 for Sudoku)
 * @returns Object with row and col
 */
export function indexToGridCoordinates(index: number, gridSize: number = 9): { row: number; col: number } {
  return {
    row: Math.floor(index / gridSize),
    col: index % gridSize
  };
}

/**
 * Check if two cells are in the same row
 */
export function inSameRow(row1: number, row2: number): boolean {
  return row1 === row2;
}

/**
 * Check if two cells are in the same column
 */
export function inSameColumn(col1: number, col2: number): boolean {
  return col1 === col2;
}

/**
 * Check if two cells are in the same 3x3 block (Sudoku-specific)
 */
export function inSameBlock(row1: number, col1: number, row2: number, col2: number): boolean {
  const block1Row = Math.floor(row1 / 3);
  const block1Col = Math.floor(col1 / 3);
  const block2Row = Math.floor(row2 / 3);
  const block2Col = Math.floor(col2 / 3);
  return block1Row === block2Row && block1Col === block2Col;
}
