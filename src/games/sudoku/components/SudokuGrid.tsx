import React from 'react';
import { SudokuCell } from './SudokuCell';
import { SudokuState } from '../SudokuState';

interface SudokuGridProps {
  state: SudokuState;
  initialState: SudokuState;
  selectedCell?: { row: number; col: number } | null;
  hoveredCell?: { row: number; col: number } | null;
  highlightedNumber?: number | null;
  hintCell?: { row: number; col: number; value: number } | null;
  onCellClick?: (row: number, col: number) => void;
  onCellHover?: (row: number, col: number) => void;
  onCellLeave?: () => void;
}

/**
 * 9x9 Sudoku grid component
 * Pure presentational component - no business logic
 */
export const SudokuGrid: React.FC<SudokuGridProps> = ({
  state,
  initialState,
  selectedCell,
  hoveredCell,
  highlightedNumber,
  hintCell,
  onCellClick,
  onCellHover,
  onCellLeave
}) => {
  const grid = state.getGrid();

  return (
    <div className="grid grid-cols-9 gap-0 border-2 border-gray-800 bg-white w-fit mx-auto">
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const isEditable = initialState.getCell(rowIndex, colIndex) === 0;
          const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
          const isHoveredRow = hoveredCell?.row === rowIndex;
          const isHoveredCol = hoveredCell?.col === colIndex;
          const isHovered = isHoveredRow || isHoveredCol;
          const isHighlighted = highlightedNumber !== null && cell === highlightedNumber;
          const isHintCell = hintCell?.row === rowIndex && hintCell?.col === colIndex;

          return (
            <SudokuCell
              key={`${rowIndex}-${colIndex}`}
              row={rowIndex}
              col={colIndex}
              value={cell}
              isEditable={isEditable}
              isSelected={isSelected}
              isHovered={isHovered}
              isHighlighted={isHighlighted}
              isHinted={isHintCell}
              hintValue={hintCell?.value}
              onClick={() => onCellClick?.(rowIndex, colIndex)}
              onMouseEnter={() => onCellHover?.(rowIndex, colIndex)}
              onMouseLeave={onCellLeave}
            />
          );
        })
      )}
    </div>
  );
};

SudokuGrid.displayName = 'SudokuGrid';
