import type React from 'react';
import type { IGameState } from './IGameState';
import type { IPowerup } from './IPowerup';
import type { Players } from '../../../types';

/**
 * Context provided when activating a powerup
 */
export interface PowerupContext {
  playerId: string;
  roomCode: string;
  selectedCell?: { row: number; col: number };
  players: Players;
}

/**
 * Result of activating a powerup
 */
export interface PowerupResult {
  success: boolean;
  message?: string;
  visualEffect?: React.ReactElement;
  hintCell?: { row: number; col: number; value: number | string };
}

/**
 * Game-specific powerup handler interface
 * Each game implements this to define how powerups work for that game
 */
export interface IPowerupHandler {
  /**
   * Check if a powerup can be activated in the current state
   */
  canActivate(powerup: IPowerup, state: IGameState, context: PowerupContext): boolean;

  /**
   * Activate a powerup and return the result
   * @param solution - Optional solution state for hint calculation
   */
  activate(powerup: IPowerup, state: IGameState, context: PowerupContext, solution?: IGameState): PowerupResult;

  /**
   * Get visual effect for a powerup (optional)
   */
  getVisualEffect?(powerup: IPowerup, context: PowerupContext): React.ReactElement | null;
}
