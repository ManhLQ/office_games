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

    // Convert highlightedNumber to number for Sudoku (which only uses numbers)
    const highlightedNum = props.highlightedNumber
      ? (typeof props.highlightedNumber === 'number' ? props.highlightedNumber : parseInt(String(props.highlightedNumber), 10))
      : null;

    return React.createElement(SudokuGrid, {
      state,
      initialState,
      selectedCell: props.selectedCell,
      hoveredCell: props.hoveredCell || null,
      highlightedNumber: highlightedNum,
      hintCell,
      onCellClick: (row: number, col: number) => {
        props.onCellSelect?.(row, col);
      },
      onCellHover: undefined,
      onCellLeave: undefined
    });
  }

  renderMiniBoard(props: MiniBoardProps): React.ReactElement {
    const currentState = props.currentState as SudokuState;
    const initialState = props.initialState as SudokuState;

    // Create a mini version of the Sudoku grid
    const grid = currentState.getGrid();
    const initialGrid = initialState.getGrid();

    return React.createElement('div', {
      className: 'sudoku-mini-board bg-white p-2 rounded border border-gray-300'
    },
      // Grid container
      React.createElement('div', {
        className: 'grid grid-cols-9 gap-0 border border-gray-600',
        style: { fontSize: '8px', lineHeight: '1' }
      },
        grid.map((row, r) =>
          row.map((cell, c) => {
            const isInitial = initialGrid[r][c] !== 0;
            return React.createElement('div', {
              key: `${r}-${c}`,
              className: `w-3 h-3 flex items-center justify-center border border-gray-300 ${isInitial ? 'font-bold text-gray-900' : 'text-blue-600'
                }`,
              style: {
                borderRightWidth: (c + 1) % 3 === 0 && c < 8 ? '2px' : '1px',
                borderBottomWidth: (r + 1) % 3 === 0 && r < 8 ? '2px' : '1px'
              }
            }, cell !== 0 ? String(cell) : '');
          })
        ).flat()
      )
    );
  }

  renderControls(props: ControlsProps): React.ReactElement {
    // Calculate number counts from current state if available
    const numberCounts: Record<number, number> = {};
    for (let i = 1; i <= 9; i++) {
      numberCounts[i] = 0;
    }

    // Count numbers in grid if state is available
    if (props.currentState) {
      const state = props.currentState as SudokuState;
      const grid = state.getGrid();
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          const val = grid[r][c];
          if (val >= 1 && val <= 9) {
            numberCounts[val]++;
          }
        }
      }
    }

    return React.createElement(SudokuNumberPad, {
      selectedCell: props.selectedCell || null,
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
