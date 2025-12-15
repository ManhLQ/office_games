import { ref, update } from 'firebase/database';
import { database } from '../config/firebase';
import type { IGameState } from '../games/core/interfaces/IGameState';
import type { IGame } from '../games/core/interfaces/IGame';
import { gameRegistry } from '../games/core/GameRegistry';

/**
 * Game state service
 * Centralized operations for game state management
 * Works with any game implementing IGame interface
 */

/**
 * Update player's current game state in Firebase
 * @param roomCode Room code
 * @param playerId Player ID
 * @param state Current game state
 */
export async function updatePlayerState(
  roomCode: string,
  playerId: string,
  state: IGameState
): Promise<void> {
  const serialized = state.serialize();
  const playerRef = ref(database, `rooms/${roomCode}/players/${playerId}`);

  await update(playerRef, {
    currentGameState: serialized
  });
}

/**
 * Update player's completion percentage
 * @param roomCode Room code
 * @param playerId Player ID
 * @param game Game instance
 * @param currentState Current game state
 * @param initialState Initial game state
 */
export async function updatePlayerCompletion(
  roomCode: string,
  playerId: string,
  game: IGame,
  currentState: IGameState,
  initialState: IGameState
): Promise<void> {
  const completionPercentage = game.calculateScore(currentState, initialState);
  const playerRef = ref(database, `rooms/${roomCode}/players/${playerId}`);

  await update(playerRef, {
    completionPercentage
  });
}

/**
 * Mark player as finished with final score
 * @param roomCode Room code
 * @param playerId Player ID
 * @param finalScore Final score (0-100)
 */
export async function markPlayerFinished(
  roomCode: string,
  playerId: string,
  finalScore: number
): Promise<void> {
  const playerRef = ref(database, `rooms/${roomCode}/players/${playerId}`);

  await update(playerRef, {
    status: 'finished',
    finalScore
  });
}

/**
 * Get game instance from registry by game ID
 * @param gameId Game identifier
 * @returns Game instance or null if not found
 */
export function getGameInstance(gameId: string): IGame | null {
  const game = gameRegistry.get(gameId);
  if (!game) {
    console.error(`Game "${gameId}" not found in registry`);
    return null;
  }
  return game;
}

/**
 * Deserialize game state from string
 * @param gameId Game identifier
 * @param serialized Serialized state string
 * @returns Deserialized game state or null if game not found
 */
export function deserializeGameState(gameId: string, serialized: string): IGameState | null {
  const game = getGameInstance(gameId);
  if (!game) return null;

  // Create a temporary state instance to use deserialize method
  const config = game.createGame('easy'); // Difficulty doesn't matter for deserialization
  return config.initialState.deserialize(serialized);
}
