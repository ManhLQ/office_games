import { useState, useEffect, useCallback } from 'react';
import type { Players, PowerupType, PowerupInventory, SharedPowerupPool } from '../types';
import { usePowerup, clearActivePowerup } from '../services/powerupService';
import { POWERUP_META } from '../constants/powerups';

interface UsePowerupEffectsOptions {
  roomCode: string;
  playerId: string;
  players: Players;
  powerupInventory?: PowerupInventory;
  sharedPowerupPool?: SharedPowerupPool;
  isGlobalMode?: boolean;
}

interface PowerupState {
  type: PowerupType;
  startedAt: number;
  durationMs: number;
  hintCell?: { row: number; col: number; value: number };
}

interface UsePowerupEffectsReturn {
  /** Currently active powerup for this player */
  activePowerup: PowerupState | null;
  /** Use a powerup */
  handleUsePowerup: (type: PowerupType) => Promise<void>;
  /** Get count of available powerups by type */
  getPowerupCount: (type: PowerupType) => number;
  /** Powerup metadata (name, icon, color) */
  powerupMeta: typeof POWERUP_META;
  /** Clear active powerup manually */
  clearPowerup: () => Promise<void>;
}

/**
 * Powerup effects hook
 * Manages powerup activation, auto-clear, and inventory
 * Works with any game that supports powerups
 */
export function usePowerupEffects({
  roomCode,
  playerId,
  players,
  powerupInventory,
  sharedPowerupPool,
  isGlobalMode = false
}: UsePowerupEffectsOptions): UsePowerupEffectsReturn {
  const [activePowerup, setActivePowerup] = useState<PowerupState | null>(null);

  const player = players[playerId];

  // Monitor active powerup from Firebase
  useEffect(() => {
    const firebasePowerup = player?.powerups?.activePowerup;

    if (!firebasePowerup) {
      setActivePowerup(null);
      return;
    }

    setActivePowerup(firebasePowerup);

    // Auto-clear powerups after duration
    if (firebasePowerup.durationMs > 0) {
      const elapsed = Date.now() - firebasePowerup.startedAt;
      const remaining = firebasePowerup.durationMs - elapsed;

      if (remaining > 0) {
        const timeout = setTimeout(() => {
          clearActivePowerup(roomCode, playerId);
        }, remaining);

        return () => clearTimeout(timeout);
      } else {
        // Already expired, clear immediately
        clearActivePowerup(roomCode, playerId);
      }
    }
  }, [player?.powerups?.activePowerup, roomCode, playerId]);

  /**
   * Use a powerup
   */
  const handleUsePowerup = useCallback(
    async (type: PowerupType) => {
      if (activePowerup) {
        alert('A powerup is already active!');
        return;
      }

      try {
        // Note: usePowerup is a service function (not a React hook) despite the naming
        // eslint-disable-next-line react-hooks/rules-of-hooks
        await usePowerup(roomCode, playerId, type, isGlobalMode);
      } catch (error) {
        console.error('Failed to use powerup:', error);
        alert('Failed to use powerup');
      }
    },
    [roomCode, playerId, isGlobalMode, activePowerup]
  );

  /**
   * Get powerup count from inventory or shared pool
   */
  const getPowerupCount = useCallback(
    (type: PowerupType): number => {
      return isGlobalMode
        ? sharedPowerupPool?.inventory?.[type] || 0
        : powerupInventory?.[type] || 0;
    },
    [isGlobalMode, powerupInventory, sharedPowerupPool]
  );

  /**
   * Clear active powerup
   */
  const clearPowerup = useCallback(async () => {
    await clearActivePowerup(roomCode, playerId);
  }, [roomCode, playerId]);

  return {
    activePowerup,
    handleUsePowerup,
    getPowerupCount,
    powerupMeta: POWERUP_META,
    clearPowerup
  };
}
