import type React from 'react';
import type { IGameState } from './IGameState';
import type { IGameMove } from './IGameMove';

/**
 * Props for player board rendering
 */
export interface PlayerBoardProps {
  state: IGameState;
  initialState: IGameState;
  solution: IGameState;
  onMove: (move: IGameMove) => void;
  selectedCell?: { row: number; col: number } | null;
  onCellSelect?: (row: number, col: number) => void;
  hintCell?: { row: number; col: number; value: number | string } | null;
  [key: string]: unknown; // Allow additional game-specific props
}

/**
 * Props for mini board rendering (spectator view)
 */
export interface MiniBoardProps {
  playerName: string;
  initialState: IGameState;
  currentState: IGameState;
  solution: IGameState;
  showErrors?: boolean;
  isWinner?: boolean;
  finalScore?: number | null;
  completionPercentage?: number;
  [key: string]: unknown; // Allow additional game-specific props
}

/**
 * Props for game controls rendering
 */
export interface ControlsProps {
  onInput: (value: number | string) => void;
  onClear: () => void;
  disabled?: Record<number | string, boolean>;
  [key: string]: unknown; // Allow additional game-specific props
}

/**
 * Game renderer interface
 * Handles game-specific UI rendering
 */
export interface IGameRenderer {
  /**
   * Render the main player board
   */
  renderPlayerBoard(props: PlayerBoardProps): React.ReactElement;

  /**
   * Render miniature board for spectator view
   */
  renderMiniBoard(props: MiniBoardProps): React.ReactElement;

  /**
   * Render game-specific controls (e.g., number pad, move input)
   */
  renderControls(props: ControlsProps): React.ReactElement;
}
