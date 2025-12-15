import type React from 'react';
import type { IGameState } from './IGameState';
import type { IGameMove } from './IGameMove';

/**
 * Props for player board rendering
 */
export interface PlayerBoardProps {
  /** Current game state */
  state: IGameState;
  /** Initial/puzzle state */
  initialState: IGameState;
  /** Solution state */
  solution: IGameState;
  /** Callback when a move is made */
  onMove: (move: IGameMove) => void;
  /** Currently selected cell */
  selectedCell?: { row: number; col: number } | null;
  /** Currently hovered cell */
  hoveredCell?: { row: number; col: number } | null;
  /** Currently highlighted number/value */
  highlightedNumber?: number | string | null;
  /** Callback when a cell is selected */
  onCellSelect?: (row: number, col: number) => void;
  /** Hint cell (for hint powerup) */
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
  selectedCell?: { row: number; col: number } | null;
  currentState?: IGameState;
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
