import React, { useState, useCallback, useMemo } from 'react';
import type { PlayerBoardProps, MiniBoardProps, ControlsProps } from '../../core/interfaces/IGameRenderer';
import { CrosswordState } from '../CrosswordState';
import { CrosswordGrid } from './CrosswordGrid';
import { CrosswordClues } from './CrosswordClues';
import { CrosswordKeyboard } from './CrosswordKeyboard';
import { getWordAtPosition } from '../utils/crosswordLogic';
import type { Clue } from '../types';

/**
 * Crossword player board functional component
 */
export const CrosswordPlayerBoard: React.FC<PlayerBoardProps> = (props) => {
  const {
    state,
    selectedCell,
    onCellSelect,
    onMove,
    hintCell
  } = props;

  // Safety check - return loading state if state is undefined
  if (!state) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading crossword...</div>
      </div>
    );
  }

  const crosswordState = state as CrosswordState;
  const [direction, setDirection] = useState<'across' | 'down'>('across');
  const [selectedClue, setSelectedClue] = useState<Clue | null>(null);

  // Calculate highlighted cells based on selection
  const highlightedCells = useMemo(() => {
    if (!selectedCell) {
      return [];
    }

    const grid = crosswordState.getGrid();
    const wordInfo = getWordAtPosition(grid, selectedCell.row, selectedCell.col, direction);
    return wordInfo.cells;
  }, [selectedCell, direction, crosswordState]);

  const handleCellClick = useCallback((row: number, col: number) => {
    // Toggle direction if clicking same cell
    if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
      setDirection(prev => prev === 'across' ? 'down' : 'across');
    }
    if (onCellSelect) {
      onCellSelect(row, col);
    }
  }, [selectedCell, onCellSelect]);

  const handleLetterInput = useCallback((letter: string) => {
    if (!selectedCell) return;

    onMove({
      row: selectedCell.row,
      col: selectedCell.col,
      value: letter
    });

    // Auto-advance to next cell in word
    const grid = crosswordState.getGrid();
    const wordInfo = getWordAtPosition(grid, selectedCell.row, selectedCell.col, direction);
    const currentIndex = wordInfo.cells.findIndex(
      c => c.row === selectedCell.row && c.col === selectedCell.col
    );

    if (currentIndex >= 0 && currentIndex < wordInfo.cells.length - 1) {
      const nextCell = wordInfo.cells[currentIndex + 1];
      if (onCellSelect) {
        onCellSelect(nextCell.row, nextCell.col);
      }
    }
  }, [selectedCell, onMove, onCellSelect, direction, crosswordState]);

  const handleBackspace = useCallback(() => {
    if (!selectedCell) return;

    onMove({
      row: selectedCell.row,
      col: selectedCell.col,
      value: 0 // Clear cell
    });

    // Move to previous cell in word
    const grid = crosswordState.getGrid();
    const wordInfo = getWordAtPosition(grid, selectedCell.row, selectedCell.col, direction);
    const currentIndex = wordInfo.cells.findIndex(
      c => c.row === selectedCell.row && c.col === selectedCell.col
    );

    if (currentIndex > 0) {
      const prevCell = wordInfo.cells[currentIndex - 1];
      if (onCellSelect) {
        onCellSelect(prevCell.row, prevCell.col);
      }
    }
  }, [selectedCell, onMove, onCellSelect, direction, crosswordState]);

  const handleClueClick = useCallback((clue: Clue, dir: 'across' | 'down') => {
    setSelectedClue(clue);
    setDirection(dir);
    if (onCellSelect) {
      onCellSelect(clue.row, clue.col);
    }
  }, [onCellSelect]);

  const clues = crosswordState.getClues();

  return (
    <div className="flex gap-6 p-6">
      {/* Left: Grid */}
      <div className="flex flex-col items-center gap-4">
        <CrosswordGrid
          state={crosswordState}
          selectedCell={selectedCell || null}
          highlightedCells={highlightedCells}
          hintCell={hintCell || null}
          onCellClick={handleCellClick}
        />
        <CrosswordKeyboard
          onLetterClick={handleLetterInput}
          onBackspace={handleBackspace}
          onDirectionToggle={() => setDirection(prev => prev === 'across' ? 'down' : 'across')}
          currentDirection={direction}
        />
      </div>
      {/* Right: Clues */}
      <div className="flex-1 min-w-[400px]">
        <CrosswordClues
          acrossClues={clues.across}
          downClues={clues.down}
          selectedClue={selectedClue}
          onClueClick={handleClueClick}
        />
      </div>
    </div>
  );
};

/**
 * Crossword mini board functional component
 */
export const CrosswordMiniBoard: React.FC<MiniBoardProps> = (props) => {
  const { currentState } = props;
  const crosswordState = currentState as CrosswordState;
  const grid = crosswordState.getGrid();
  const size = crosswordState.getSize();

  return (
    <div className="crossword-mini-board bg-white p-2 rounded border-2 border-gray-800 inline-block">
      <div
        className="inline-grid gap-0"
        style={{
          gridTemplateColumns: `repeat(${size}, 8px)`,
          gridTemplateRows: `repeat(${size}, 8px)`
        }}
      >
        {grid.flat().map((cell, i) => (
          <div
            key={i}
            className={cell === '#' ? 'bg-gray-900' : (cell ? 'bg-blue-600' : 'bg-white')}
            style={{ width: '8px', height: '8px', border: '1px solid #ccc' }}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Crossword controls functional component
 */
export const CrosswordControls: React.FC<ControlsProps> = () => {
  return (
    <div className="text-sm text-gray-600">
      Use keyboard or click letters below
    </div>
  );
};
