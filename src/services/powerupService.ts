import { ref, set, update, get } from 'firebase/database';
import { database } from '../config/firebase';
import type {
  PowerupType,
  PowerupConfig,
  PowerupInventory,
  ActivePowerup,
  Player,
  Players,
  SharedPowerupPool,
} from '../types';

/**
 * Creates an empty powerup inventory
 */
export function createEmptyInventory(): PowerupInventory {
  return { hint: 0, fog: 0, peep: 0 };
}

/**
 * Validates powerup selection against constraints
 * @param selection - Array of selected powerup types
 * @param maxTotal - Maximum total powerups allowed
 * @param maxPerType - Maximum of same type allowed
 * @returns Validation result with error message if invalid
 */
export function validatePowerupSelection(
  selection: PowerupType[],
  maxTotal: number,
  maxPerType: number
): { valid: boolean; error?: string } {
  if (selection.length > maxTotal) {
    return {
      valid: false,
      error: `Total powerups (${selection.length}) exceeds maximum (${maxTotal})`,
    };
  }

  const counts: Record<PowerupType, number> = { hint: 0, fog: 0, peep: 0 };
  for (const type of selection) {
    counts[type]++;
    if (counts[type] > maxPerType) {
      return {
        valid: false,
        error: `Too many ${type} powerups (max ${maxPerType} per type)`,
      };
    }
  }

  return { valid: true };
}

/**
 * Converts array of powerup types to inventory map
 */
function arrayToInventory(powerups: PowerupType[]): PowerupInventory {
  const inventory = createEmptyInventory();
  for (const type of powerups) {
    inventory[type]++;
  }
  return inventory;
}

/**
 * Allocates random powerups from pool
 * @param count - Number of powerups to allocate
 * @param maxPerType - Maximum of same type
 * @param pool - Pool of powerup types to draw from
 */
export function allocateRandomPowerups(
  count: number,
  maxPerType: number,
  pool: PowerupType[] = ['hint', 'fog', 'peep']
): PowerupType[] {
  const selected: PowerupType[] = [];
  const counts: Record<PowerupType, number> = { hint: 0, fog: 0, peep: 0 };

  for (let i = 0; i < count; i++) {
    // Filter pool to exclude types that hit max
    const availablePool = pool.filter((type) => counts[type] < maxPerType);

    if (availablePool.length === 0) {
      break; // Can't allocate more without violating constraints
    }

    const randomIndex = Math.floor(Math.random() * availablePool.length);
    const selectedType = availablePool[randomIndex];
    selected.push(selectedType);
    counts[selectedType]++;
  }

  return selected;
}

/**
 * Allocates powerups for all players based on mode
 * @param config - Powerup configuration
 * @param playerIds - Array of player IDs
 * @returns Map of player ID to powerup inventory, and optional shared pool
 */
export function allocatePowerups(
  config: PowerupConfig,
  playerIds: string[]
): {
  playerInventories: Record<string, PowerupInventory>;
  sharedPool?: SharedPowerupPool;
} {
  const playerInventories: Record<string, PowerupInventory> = {};

  if (!config.enabled) {
    // No powerups enabled
    for (const playerId of playerIds) {
      playerInventories[playerId] = createEmptyInventory();
    }
    return { playerInventories };
  }

  const { mode, maxPowerupsPerEntity, perTypeMax, fixedList, pool } = config;

  if (mode === 'random') {
    // Random global mode: allocate once, share among all players
    const powerups = allocateRandomPowerups(
      maxPowerupsPerEntity,
      perTypeMax,
      pool
    );
    const sharedInventory = arrayToInventory(powerups);

    // All players start with empty inventory
    for (const playerId of playerIds) {
      playerInventories[playerId] = createEmptyInventory();
    }

    return {
      playerInventories,
      sharedPool: { inventory: sharedInventory },
    };
  } else if (mode === 'fixed') {
    // Fixed global mode: use admin selection, share among all players
    const powerups = fixedList || [];
    const sharedInventory = arrayToInventory(powerups);

    // All players start with empty inventory
    for (const playerId of playerIds) {
      playerInventories[playerId] = createEmptyInventory();
    }

    return {
      playerInventories,
      sharedPool: { inventory: sharedInventory },
    };
  } else if (mode === 'random_per_player') {
    // Random per-player mode: allocate independently for each player
    for (const playerId of playerIds) {
      const powerups = allocateRandomPowerups(
        maxPowerupsPerEntity,
        perTypeMax,
        pool
      );
      playerInventories[playerId] = arrayToInventory(powerups);
    }

    return { playerInventories };
  } else if (mode === 'fixed_per_player') {
    // Fixed per-player mode: each player gets the same fixed list
    const powerups = fixedList || [];
    const inventory = arrayToInventory(powerups);

    for (const playerId of playerIds) {
      playerInventories[playerId] = { ...inventory };
    }

    return { playerInventories };
  }

  // Default: empty inventories
  for (const playerId of playerIds) {
    playerInventories[playerId] = createEmptyInventory();
  }
  return { playerInventories };
}

/**
 * Checks if a player can use a powerup
 */
export function canUsePowerup(
  player: Player,
  powerupType: PowerupType,
  sharedPool?: SharedPowerupPool
): { canUse: boolean; reason?: string } {
  // Check if player has an active powerup
  if (player.powerups?.activePowerup) {
    return { canUse: false, reason: 'Powerup already active' };
  }

  // Check player inventory or shared pool
  const inventory = player.powerups?.inventory || createEmptyInventory();
  const hasInInventory = inventory[powerupType] > 0;
  const hasInSharedPool = (sharedPool?.inventory[powerupType] || 0) > 0;

  if (!hasInInventory && !hasInSharedPool) {
    return { canUse: false, reason: 'Powerup not available' };
  }

  return { canUse: true };
}

/**
 * Uses a powerup for a player
 * @param roomCode - Room code
 * @param playerId - Player ID
 * @param powerupType - Type of powerup to use
 * @param isGlobalMode - Whether using global mode (shared pool)
 */
export async function usePowerup(
  roomCode: string,
  playerId: string,
  powerupType: PowerupType,
  isGlobalMode: boolean
): Promise<void> {
  const updates: Record<string, unknown> = {};

  // Determine duration based on powerup type
  const durationMs = powerupType === 'hint' ? 3000 : 5000; // Hint: 3 seconds, Fog and Peep: 5 seconds

  // Set active powerup
  const activePowerup: ActivePowerup = {
    type: powerupType,
    startedAt: Date.now(),
    durationMs,
  };

  // For hint powerup, we need to calculate the hint cell now
  // This is a placeholder - the actual calculation should be done in the component
  // For now, we'll let the component calculate it, but we need to pass game state here
  // TODO: Calculate hint cell here to avoid re-calculation on every render

  updates[
    `rooms/${roomCode}/players/${playerId}/powerups/activePowerup`
  ] = activePowerup;

  // Decrement inventory
  if (isGlobalMode) {
    // Decrement shared pool
    const poolRef = ref(
      database,
      `rooms/${roomCode}/sharedPowerupPool/inventory/${powerupType}`
    );
    const snapshot = await get(poolRef);
    const currentCount = (snapshot.val() as number) || 0;
    updates[
      `rooms/${roomCode}/sharedPowerupPool/inventory/${powerupType}`
    ] = Math.max(0, currentCount - 1);
  } else {
    // Decrement player inventory
    const inventoryRef = ref(
      database,
      `rooms/${roomCode}/players/${playerId}/powerups/inventory/${powerupType}`
    );
    const snapshot = await get(inventoryRef);
    const currentCount = (snapshot.val() as number) || 0;
    updates[
      `rooms/${roomCode}/players/${playerId}/powerups/inventory/${powerupType}`
    ] = Math.max(0, currentCount - 1);
  }

  await update(ref(database), updates);
}

/**
 * Clears a player's active powerup
 */
export async function clearActivePowerup(
  roomCode: string,
  playerId: string
): Promise<void> {
  const activePowerupRef = ref(
    database,
    `rooms/${roomCode}/players/${playerId}/powerups/activePowerup`
  );
  await set(activePowerupRef, null);
}

/**
 * Gets IDs of players affected by a powerup
 * @param players - All players in room
 * @param sourcePlayerId - Player using the powerup
 * @param powerupType - Type of powerup
 */
export function getAffectedPlayerIds(
  players: Players,
  sourcePlayerId: string,
  powerupType: PowerupType
): string[] {
  const playerIds = Object.keys(players);

  if (powerupType === 'hint') {
    // Hint only affects the user
    return [sourcePlayerId];
  } else if (powerupType === 'fog') {
    // Fog affects all other players (hides their boards from them)
    return playerIds.filter((id) => id !== sourcePlayerId);
  } else if (powerupType === 'peep') {
    // Peep affects the user (lets them see others)
    return [sourcePlayerId];
  }

  return [];
}

/**
 * Determines if a board should be visible based on active powerup effects
 * @param viewerId - Player viewing the board
 * @param boardOwnerId - Owner of the board being viewed
 * @param players - All players in room
 */
export function shouldShowBoard(
  viewerId: string,
  boardOwnerId: string,
  players: Players
): boolean {
  // Always show your own board
  if (viewerId === boardOwnerId) {
    return true;
  }

  const viewer = players[viewerId];
  const boardOwner = players[boardOwnerId];

  if (!viewer || !boardOwner) return false;

  const now = Date.now();

  // Check if viewer has active Peep (lets them see others' boards)
  const viewerPowerup = viewer.powerups?.activePowerup;
  if (viewerPowerup?.type === 'peep') {
    const isActive = now < viewerPowerup.startedAt + viewerPowerup.durationMs;
    if (isActive) {
      // Check if board owner has earlier Fog that blocks this
      const ownerPowerup = boardOwner.powerups?.activePowerup;
      if (ownerPowerup?.type === 'fog') {
        const isFogActive =
          now < ownerPowerup.startedAt + ownerPowerup.durationMs;
        // If Fog started before Peep, it takes precedence
        if (isFogActive && ownerPowerup.startedAt < viewerPowerup.startedAt) {
          return false;
        }
      }
      return true; // Peep allows viewing
    }
  }

  // Default: don't show other players' boards
  return false;
}
