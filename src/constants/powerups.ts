import type { PowerupType } from '../types';

/**
 * Powerup metadata
 * Centralized definition to avoid duplication
 */
export const POWERUP_META: Record<PowerupType, { name: string; icon: string; color: string }> = {
  hint: {
    name: 'Hint',
    icon: '💡',
    color: 'bg-amber-500'
  },
  fog: {
    name: 'Fog',
    icon: '🌫️',
    color: 'bg-slate-500'
  },
  peep: {
    name: 'Peep',
    icon: '👀',
    color: 'bg-cyan-500'
  }
};

/**
 * Powerup durations in milliseconds
 */
export const POWERUP_DURATION: Record<PowerupType, number> = {
  hint: 0,      // Instant (cleared when cell is filled)
  fog: 5000,    // 5 seconds
  peep: 5000    // 5 seconds
};

/**
 * Get powerup duration for a specific type
 */
export function getPowerupDuration(type: PowerupType): number {
  return POWERUP_DURATION[type];
}
