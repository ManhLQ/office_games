import React from 'react';

interface CrosswordKeyboardProps {
  onLetterClick: (letter: string) => void;
  onBackspace: () => void;
  onDirectionToggle: () => void;
  currentDirection: 'across' | 'down';
}

/**
 * Virtual keyboard for crossword input
 */
export const CrosswordKeyboard: React.FC<CrosswordKeyboardProps> = ({
  onLetterClick,
  onBackspace,
  onDirectionToggle,
  currentDirection
}) => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="flex flex-col gap-3 p-4 bg-gray-100 rounded-lg">
      {/* Direction Toggle */}
      <button
        onClick={onDirectionToggle}
        className="px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition-colors"
      >
        Direction: {currentDirection.toUpperCase()} ↔
      </button>

      {/* Letter Buttons */}
      <div className="grid grid-cols-9 gap-2">
        {letters.map(letter => (
          <button
            key={letter}
            onClick={() => onLetterClick(letter)}
            className="w-10 h-10 bg-white border-2 border-gray-300 rounded font-bold text-gray-900 hover:bg-gray-200 hover:border-gray-400 transition-colors"
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Backspace Button */}
      <button
        onClick={onBackspace}
        className="px-4 py-2 bg-red-600 text-white rounded font-semibold hover:bg-red-700 transition-colors"
      >
        ← Backspace
      </button>
    </div>
  );
};
