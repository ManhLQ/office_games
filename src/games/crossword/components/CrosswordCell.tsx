import React from 'react';

interface CrosswordCellProps {
  row: number;
  col: number;
  value: string; // Letter or '#' for black cell
  number?: number; // Cell number for clue reference
  isSelected: boolean;
  isHighlighted: boolean; // Part of selected word
  isHint: boolean;
  isBlack: boolean;
  onClick: (row: number, col: number) => void;
}

/**
 * Individual crossword cell component
 */
export const CrosswordCell: React.FC<CrosswordCellProps> = ({
  row,
  col,
  value,
  number,
  isSelected,
  isHighlighted,
  isHint,
  isBlack,
  onClick
}) => {
  if (isBlack) {
    return (
      <div className="w-12 h-12 bg-gray-900 border border-gray-700" />
    );
  }

  const cellClasses = [
    'w-12 h-12 border-2 border-gray-400',
    'flex items-center justify-center',
    'relative cursor-pointer',
    'font-bold text-xl',
    'transition-colors duration-150',
    isSelected ? 'bg-yellow-200 border-yellow-500' : '',
    isHighlighted ? 'bg-blue-100' : 'bg-white hover:bg-gray-50',
    isHint ? 'bg-green-200' : ''
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cellClasses}
      onClick={() => onClick(row, col)}
    >
      {number && (
        <span className="absolute top-0.5 left-1 text-[10px] font-normal text-gray-600">
          {number}
        </span>
      )}
      <span className="text-gray-900">
        {value && value !== '#' ? value.toUpperCase() : ''}
      </span>
    </div>
  );
};
