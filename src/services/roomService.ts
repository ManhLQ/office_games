import { ref, set, update, get } from 'firebase/database';
import { database } from '../config/firebase';
import type { Room, RoomConfig, Player, RoomStatus, Difficulty, PowerupConfig } from '../types';
import { generateBoard } from '../utils/sudoku';
import { generateRoomCode, generatePlayerId } from '../utils/room';
import { allocatePowerups, createEmptyInventory } from './powerupService';

/**
 * Creates a new game room
 * @param difficulty - The difficulty level for the puzzle
 * @param powerupConfig - Optional powerup configuration
 * @returns The room code and admin player ID
 */
export async function createRoom(
  difficulty: Difficulty,
  powerupConfig?: PowerupConfig
): Promise<{
  roomCode: string;
  adminId: string;
}> {
  const roomCode = generateRoomCode();
  const adminId = generatePlayerId();
  const { puzzleString, solutionString } = generateBoard(difficulty);

  const roomData: Room = {
    status: 'waiting',
    config: {
      difficulty,
      puzzleString,
      solutionString,
      powerupConfig,
    },
    winnerId: null,
    players: {},
    startTime: null,
  };

  // Initialize shared powerup pool if using global modes
  if (powerupConfig?.enabled && (powerupConfig.mode === 'random' || powerupConfig.mode === 'fixed')) {
    const { sharedPool } = allocatePowerups(powerupConfig, []);
    if (sharedPool) {
      roomData.sharedPowerupPool = sharedPool;
    }
  }

  const roomRef = ref(database, `rooms/${roomCode}`);
  await set(roomRef, roomData);

  return { roomCode, adminId };
}

/**
 * Joins an existing room
 * @param roomCode - The room code to join
 * @param playerName - The player's display name
 * @returns The player ID
 */
export async function joinRoom(
  roomCode: string,
  playerName: string
): Promise<string> {
  const playerId = generatePlayerId();
  const roomRef = ref(database, `rooms/${roomCode}`);

  // Check if room exists
  const snapshot = await get(roomRef);
  if (!snapshot.exists()) {
    throw new Error('Room not found');
  }

  const room = snapshot.val() as Room;
  if (room.status !== 'waiting') {
    throw new Error('Game has already started');
  }

  // Count existing players
  const playerCount = Object.keys(room.players || {}).length;
  if (playerCount >= 4) {
    throw new Error('Room is full (max 4 players)');
  }

  const playerData: Player = {
    name: playerName,
    currentBoardString: room.config.puzzleString,
    finalScore: null,
    status: 'playing',
    completionPercentage: 0,
  };

  // Initialize powerup inventory if powerups are enabled
  const powerupConfig = room.config.powerupConfig;
  if (powerupConfig?.enabled) {
    const allPlayerIds = [...Object.keys(room.players || {}), playerId];
    const { playerInventories } = allocatePowerups(powerupConfig, allPlayerIds);
    
    playerData.powerups = {
      inventory: playerInventories[playerId] || createEmptyInventory(),
      activePowerup: null,
    };
  }

  const playerRef = ref(database, `rooms/${roomCode}/players/${playerId}`);
  await set(playerRef, playerData);

  return playerId;
}

/**
 * Updates the room status
 * @param roomCode - The room code
 * @param status - The new status
 */
export async function updateRoomStatus(
  roomCode: string,
  status: RoomStatus
): Promise<void> {
  const updates: Record<string, unknown> = {
    [`rooms/${roomCode}/status`]: status,
  };
  
  // Set startTime when game starts
  if (status === 'playing') {
    updates[`rooms/${roomCode}/startTime`] = Date.now();
  }
  
  await update(ref(database), updates);
}

/**
 * Updates a player's current board
 * @param roomCode - The room code
 * @param playerId - The player ID
 * @param boardString - The current board string
 */
export async function updatePlayerBoard(
  roomCode: string,
  playerId: string,
  boardString: string
): Promise<void> {
  const boardRef = ref(
    database,
    `rooms/${roomCode}/players/${playerId}/currentBoardString`
  );
  await set(boardRef, boardString);
}

/**
 * Updates a player's completion percentage
 * @param roomCode - The room code
 * @param playerId - The player ID
 * @param completionPercentage - The completion percentage (0-100)
 */
export async function updatePlayerCompletion(
  roomCode: string,
  playerId: string,
  completionPercentage: number
): Promise<void> {
  const completionRef = ref(
    database,
    `rooms/${roomCode}/players/${playerId}/completionPercentage`
  );
  await set(completionRef, completionPercentage);
}

/**
 * Submits a player's final answer and handles win condition
 * @param roomCode - The room code
 * @param playerId - The player ID
 * @param isWinner - Whether this player won
 * @param finalScore - The player's final score
 */
export async function submitAnswer(
  roomCode: string,
  playerId: string,
  isWinner: boolean,
  finalScore: number
): Promise<void> {
  const updates: Record<string, unknown> = {};

  if (isWinner) {
    updates[`rooms/${roomCode}/winnerId`] = playerId;
    updates[`rooms/${roomCode}/status`] = 'finished';
  }

  updates[`rooms/${roomCode}/players/${playerId}/status`] = 'finished';
  updates[`rooms/${roomCode}/players/${playerId}/finalScore`] = finalScore;

  await update(ref(database), updates);
}

/**
 * Gets a room's configuration
 * @param roomCode - The room code
 * @returns The room config or null
 */
export async function getRoomConfig(
  roomCode: string
): Promise<RoomConfig | null> {
  const configRef = ref(database, `rooms/${roomCode}/config`);
  const snapshot = await get(configRef);

  if (snapshot.exists()) {
    return snapshot.val() as RoomConfig;
  }

  return null;
}
