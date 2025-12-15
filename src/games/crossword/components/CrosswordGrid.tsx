import React from 'react';
import { CrosswordCell } from './CrosswordCell';
import type { CrosswordState } from '../CrosswordState';

interface CrosswordGridProps {
  state: CrosswordState;
  selectedCell: { row: number; col: number } | null;
  highlightedCells: { row: number; col: number }[];
  hintCell: { row: number; col: number; value?: string | number } | null;
  onCellClick: (row: number, col: number) => void;
}

/**
 * Crossword grid component
 */
export const CrosswordGrid: React.FC<CrosswordGridProps> = ({
  state,
  selectedCell,
  highlightedCells,
  hintCell,
  onCellClick
}) => {
  const grid = state.getGrid();
  const size = state.getSize();

  // Build cell number map
  const cellNumbers: Map<string, number> = new Map();
  let currentNumber = 1;

  // Assign numbers to cells that start words
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col] === '#') continue;

      const startsAcross = col === 0 || grid[row][col - 1] === '#';
      const startsDown = row === 0 || grid[row - 1][col] === '#';
      const hasAcrossSpace = col < size - 1 && grid[row][col + 1] !== '#';
      const hasDownSpace = row < size - 1 && grid[row + 1][col] !== '#';

      if ((startsAcross && hasAcrossSpace) || (startsDown && hasDownSpace)) {
        cellNumbers.set(`${row},${col}`, currentNumber);
        currentNumber++;
      }
    }
  }

  const isHighlighted = (row: number, col: number) => {
    return highlightedCells.some(cell => cell.row === row && cell.col === col);
  };

  return (
    <div
      className="inline-grid gap-0 border-4 border-gray-800 bg-gray-800"
      style={{
        gridTemplateColumns: `repeat(${size}, 48px)`,
        gridTemplateRows: `repeat(${size}, 48px)`
      }}
    >
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const isHintCell = hintCell?.row === rowIndex && hintCell?.col === colIndex;
          const displayValue = isHintCell && hintCell.value ? String(hintCell.value) : cell;

          return (
            <CrosswordCell
              key={`${rowIndex}-${colIndex}`}
              row={rowIndex}
              col={colIndex}
              value={displayValue}
              number={cellNumbers.get(`${rowIndex},${colIndex}`)}
              isSelected={selectedCell?.row === rowIndex && selectedCell?.col === colIndex}
              isHighlighted={isHighlighted(rowIndex, colIndex)}
              isHint={isHintCell}
              isBlack={cell === '#'}
              onClick={onCellClick}
            />
          );
        })
      )}
    </div>
  );
};
