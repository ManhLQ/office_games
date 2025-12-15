import { useState, useCallback } from 'react';
import type { IGame } from '../games/core/interfaces/IGame';
import type { IGameState } from '../games/core/interfaces/IGameState';
import type { IGameMove } from '../games/core/interfaces/IGameMove';
import { useDebouncedCallback } from './useDebounce';

interface UseGameStateOptions {
  /** Game instance */
  game: IGame;
  /** Initial game state */
  initialState: IGameState;
  /** Solution state */
  solution: IGameState;
  /** Room code for Firebase sync */
  roomCode: string;
  /** Player ID for Firebase sync */
  playerId: string;
  /** Callback to sync state to Firebase */
  onStateSync: (state: IGameState) => void;
  /** Debounce delay in ms (default: 500) */
  debounceDelay?: number;
}

interface UseGameStateReturn {
  /** Current game state */
  state: IGameState;
  /** Apply a move to the state */
  applyMove: (move: IGameMove) => void;
  /** Reset state to initial */
  reset: () => void;
  /** Check if game is complete */
  isComplete: boolean;
  /** Check if current state is correct */
  isCorrect: boolean;
  /** Current completion score (0-100) */
  score: number;
}

/**
 * Game state management hook
 * Handles game state, move validation, and Firebase sync
 * Works with any game that implements IGame interface
 */
export function useGameState({
  game,
  initialState,
  solution,
  onStateSync,
  debounceDelay = 500
}: UseGameStateOptions): UseGameStateReturn {
  const [state, setState] = useState<IGameState>(initialState);

  // Debounced Firebase sync
  const debouncedSync = useDebouncedCallback(
    (newState: IGameState) => {
      onStateSync(newState);
    },
    debounceDelay
  );

  /**
   * Apply a move to the current state
   */
  const applyMove = useCallback(
    (move: IGameMove) => {
      // Validate move
      if (!game.validateMove(state, move)) {
        console.warn('Invalid move attempted:', move);
        return;
      }

      // Apply move
      const newState = game.applyMove(state, move);
      setState(newState);

      // Sync to Firebase with debounce
      debouncedSync(newState);
    },
    [game, state, debouncedSync]
  );

  /**
   * Reset state to initial
   */
  const reset = useCallback(() => {
    const resetState = initialState.clone();
    setState(resetState);
    onStateSync(resetState);
  }, [initialState, onStateSync]);

  // Calculate derived state
  const isComplete = game.isGameComplete(state);
  const isCorrect = game.isGameCorrect(state, solution);
  const score = game.calculateScore(state, initialState);

  return {
    state,
    applyMove,
    reset,
    isComplete,
    isCorrect,
    score
  };
}
