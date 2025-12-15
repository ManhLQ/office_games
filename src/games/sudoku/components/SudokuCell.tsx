import React from 'react';
import { shouldRenderBlockBorderRight, shouldRenderBlockBorderBottom } from '../../../utils/gridHelpers';

interface SudokuCellProps {
  row: number;
  col: number;
  value: number;
  isEditable: boolean;
  isSelected?: boolean;
  isHovered?: boolean;
  isHighlighted?: boolean;
  isHinted?: boolean;
  hintValue?: number;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

/**
 * Single Sudoku cell component
 * Pure presentational component with all styling logic
 */
export const SudokuCell: React.FC<SudokuCellProps> = ({
  row,
  col,
  value,
  isEditable,
  isSelected = false,
  isHovered = false,
  isHighlighted = false,
  isHinted = false,
  hintValue,
  onClick,
  onMouseEnter,
  onMouseLeave
}) => {
  // Determine background color priority
  let bgColor = isEditable ? 'bg-gray-50' : 'bg-white';
  if (isHovered) bgColor = 'bg-yellow-50';
  if (isHighlighted) bgColor = 'bg-purple-100';
  if (isHinted) bgColor = 'bg-green-200';
  if (isSelected) bgColor = 'bg-blue-200';

  const borderRight = shouldRenderBlockBorderRight(col);
  const borderBottom = shouldRenderBlockBorderBottom(row);

  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`
        w-10 h-10 md:w-12 md:h-12 flex items-center justify-center
        text-lg md:text-xl font-semibold cursor-pointer
        border border-gray-300
        ${borderRight ? 'border-r-2 border-r-gray-800' : ''}
        ${borderBottom ? 'border-b-2 border-b-gray-800' : ''}
        ${isEditable ? 'text-blue-600' : 'text-gray-900'}
        ${bgColor}
        transition-colors duration-100
      `}
    >
      {value !== 0 ? value : isHinted && hintValue ? (
        <span className="text-green-600 font-black animate-pulse">
          {hintValue}
        </span>
      ) : ''}
    </div>
  );
};

SudokuCell.displayName = 'SudokuCell';
