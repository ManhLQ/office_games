import React from 'react';

interface SudokuNumberPadProps {
  selectedCell: { row: number; col: number } | null;
  numberCounts: Record<number, number>;
  onNumberClick: (num: number) => void;
  onClearClick: () => void;
}

/**
 * Sudoku number pad component
 * Displays numbers 1-9 with clear button
 * Grays out numbers that are fully used (9 times)
 */
export const SudokuNumberPad: React.FC<SudokuNumberPadProps> = ({
  selectedCell,
  numberCounts,
  onNumberClick,
  onClearClick
}) => {
  return (
    <div className="w-fit mx-auto">
      <div className="grid grid-cols-5 gap-2 mt-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
          const isFilled = numberCounts[num] >= 9;
          const isDisabled = !selectedCell || isFilled;

          return (
            <button
              key={num}
              onClick={() => !isDisabled && onNumberClick(num)}
              disabled={isDisabled}
              className={`
                w-12 h-12 rounded-lg text-xl font-semibold transition-all
                ${isFilled
                  ? 'bg-gray-300 text-gray-400 cursor-not-allowed opacity-50'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}
                ${isDisabled ? 'cursor-not-allowed' : ''}
              `}
            >
              {num}
            </button>
          );
        })}
        <button
          onClick={onClearClick}
          disabled={!selectedCell}
          className={`
            w-12 h-12 rounded-lg text-xl font-semibold transition-colors
            ${selectedCell
              ? 'bg-red-100 hover:bg-red-200 text-red-800'
              : 'bg-gray-300 text-gray-400 cursor-not-allowed'}
          `}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

SudokuNumberPad.displayName = 'SudokuNumberPad';
