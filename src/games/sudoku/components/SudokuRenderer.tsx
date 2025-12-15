import React from 'react';
import type { IGameRenderer, PlayerBoardProps, MiniBoardProps, ControlsProps } from '../../core/interfaces/IGameRenderer';
import { SudokuGrid } from './SudokuGrid';
import { SudokuNumberPad } from './SudokuNumberPad';
import { SudokuState } from '../SudokuState';

/**
 * Sudoku renderer implementation
 * Delegates to Sudoku-specific components
 */
export class SudokuRenderer implements IGameRenderer {
  renderPlayerBoard(props: PlayerBoardProps): React.ReactElement {
    const state = props.state as SudokuState;
    const initialState = props.initialState as SudokuState;

    // Adapt hintCell to Sudoku-specific format (value must be number)
    const hintCell = props.hintCell ? {
      row: props.hintCell.row,
      col: props.hintCell.col,
      value: typeof props.hintCell.value === 'number' ? props.hintCell.value : parseInt(String(props.hintCell.value), 10)
    } : null;

    return React.createElement(SudokuGrid, {
      state,
      initialState,
      selectedCell: props.selectedCell,
      hoveredCell: props.onCellSelect ? undefined : null,  // Simplified for now
      highlightedNumber: null, // Will be managed by parent component
      hintCell,
      onCellClick: (row: number, col: number) => {
        props.onCellSelect?.(row, col);
      },
      onCellHover: undefined,
      onCellLeave: undefined
    });
  }

  renderMiniBoard(props: MiniBoardProps): React.ReactElement {
    // For mini board, we'll create a simplified version
    // This is used in spectator view
    return React.createElement('div', {
      className: 'sudoku-mini-board bg-white p-2 rounded-lg shadow-md'
    },
      React.createElement('div', { className: 'text-sm font-bold mb-1' }, props.playerName),
      React.createElement('div', { className: 'text-xs text-gray-600' },
        `${props.completionPercentage || 0}% complete`
      )
    );
  }

  renderControls(props: ControlsProps): React.ReactElement {
    const numberCounts: Record<number, number> = {};
    for (let i = 1; i <= 9; i++) {
      numberCounts[i] = 0; // Will be properly calculated by parent
    }

    return React.createElement(SudokuNumberPad, {
      selectedCell: null, // Will be managed by parent
      numberCounts,
      onNumberClick: (num: number) => {
        props.onInput(num);
      },
      onClearClick: () => {
        props.onClear();
      }
    });
  }
}
