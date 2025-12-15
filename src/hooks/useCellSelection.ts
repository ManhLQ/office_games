import { useState, useCallback } from 'react';

interface CellPosition {
  row: number;
  col: number;
}

interface UseCellSelectionOptions {
  /** Grid size (e.g., 9 for Sudoku, 8 for Chess) */
  gridSize?: number;
  /** Callback when a cell is selected */
  onCellSelect?: (row: number, col: number) => void;
}

interface UseCellSelectionReturn {
  /** Currently selected cell */
  selectedCell: CellPosition | null;
  /** Currently hovered cell */
  hoveredCell: CellPosition | null;
  /** Currently highlighted number/value */
  highlightedValue: number | string | null;
  /** Select a cell */
  selectCell: (row: number, col: number) => void;
  /** Clear selection */
  clearSelection: () => void;
  /** Set hovered cell */
  setHoveredCell: (position: CellPosition | null) => void;
  /** Set highlighted value */
  setHighlightedValue: (value: number | string | null) => void;
  /** Handle keyboard input for grid navigation */
  handleKeyDown: (e: React.KeyboardEvent, onInput?: (value: number | string) => void) => void;
}

/**
 * Cell selection hook for grid-based games
 * Manages selected cell, hovered cell, and highlighted values
 * Provides keyboard navigation support
 */
export function useCellSelection({
  gridSize = 9,
  onCellSelect
}: UseCellSelectionOptions = {}): UseCellSelectionReturn {
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null);
  const [hoveredCell, setHoveredCell] = useState<CellPosition | null>(null);
  const [highlightedValue, setHighlightedValue] = useState<number | string | null>(null);

  /**
   * Select a cell
   */
  const selectCell = useCallback(
    (row: number, col: number) => {
      setSelectedCell({ row, col });
      onCellSelect?.(row, col);
    },
    [onCellSelect]
  );

  /**
   * Clear selection
   */
  const clearSelection = useCallback(() => {
    setSelectedCell(null);
    setHighlightedValue(null);
  }, []);

  /**
   * Handle keyboard input for navigation and input
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, onInput?: (value: number | string) => void) => {
      if (!selectedCell) return;

      const { row, col } = selectedCell;

      // Arrow navigation
      switch (e.key) {
        case 'ArrowUp':
          if (row > 0) selectCell(row - 1, col);
          e.preventDefault();
          break;
        case 'ArrowDown':
          if (row < gridSize - 1) selectCell(row + 1, col);
          e.preventDefault();
          break;
        case 'ArrowLeft':
          if (col > 0) selectCell(row, col - 1);
          e.preventDefault();
          break;
        case 'ArrowRight':
          if (col < gridSize - 1) selectCell(row, col + 1);
          e.preventDefault();
          break;
        case 'Escape':
          clearSelection();
          e.preventDefault();
          break;
        default:
          // Pass through to onInput callback if provided
          if (onInput) {
            // Number input (1-9) or (0 for clear)
            if (e.key >= '0' && e.key <= '9') {
              onInput(parseInt(e.key, 10));
            }
            // Backspace or Delete to clear
            else if (e.key === 'Backspace' || e.key === 'Delete') {
              onInput(0);
            }
            // Letter input (for word games, etc.)
            else if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
              onInput(e.key.toUpperCase());
            }
          }
      }
    },
    [selectedCell, gridSize, selectCell, clearSelection]
  );

  return {
    selectedCell,
    hoveredCell,
    highlightedValue,
    selectCell,
    clearSelection,
    setHoveredCell,
    setHighlightedValue,
    handleKeyDown
  };
}
