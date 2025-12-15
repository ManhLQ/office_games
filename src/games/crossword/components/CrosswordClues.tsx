import React from 'react';
import type { Clue } from '../types';

interface CrosswordCluesProps {
  acrossClues: Clue[];
  downClues: Clue[];
  selectedClue: Clue | null;
  onClueClick: (clue: Clue, direction: 'across' | 'down') => void;
}

/**
 * Crossword clues component - displays across and down clues
 */
export const CrosswordClues: React.FC<CrosswordCluesProps> = ({
  acrossClues,
  downClues,
  selectedClue,
  onClueClick
}) => {
  const renderClueList = (clues: Clue[], direction: 'across' | 'down') => {
    return (
      <div className="space-y-2">
        {clues.map(clue => {
          const isSelected = selectedClue?.number === clue.number &&
            selectedClue?.row === clue.row &&
            selectedClue?.col === clue.col;

          return (
            <div
              key={`${direction}-${clue.number}`}
              className={`p-2 rounded cursor-pointer transition-colors ${isSelected
                  ? 'bg-blue-200 border-2 border-blue-500'
                  : 'hover:bg-gray-100 border-2 border-transparent'
                }`}
              onClick={() => onClueClick(clue, direction)}
            >
              <span className="font-bold text-gray-700">{clue.number}.</span>{' '}
              <span className="text-gray-900">{clue.clue}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      {/* Across Clues */}
      <div className="flex flex-col">
        <h3 className="text-lg font-bold mb-3 text-gray-800 border-b-2 border-gray-300 pb-2">
          Across
        </h3>
        <div className="overflow-y-auto flex-1 pr-2">
          {renderClueList(acrossClues, 'across')}
        </div>
      </div>

      {/* Down Clues */}
      <div className="flex flex-col">
        <h3 className="text-lg font-bold mb-3 text-gray-800 border-b-2 border-gray-300 pb-2">
          Down
        </h3>
        <div className="overflow-y-auto flex-1 pr-2">
          {renderClueList(downClues, 'down')}
        </div>
      </div>
    </div>
  );
};
