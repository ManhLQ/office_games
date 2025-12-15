import type { IPowerup } from '../interfaces/IPowerup';
import { HintPowerup } from './definitions/HintPowerup';
import { FogPowerup } from './definitions/FogPowerup';
import { PeepPowerup } from './definitions/PeepPowerup';

/**
 * Powerup Registry - Singleton registry for all powerups
 */
class PowerupRegistry {
  private powerups: Map<string, IPowerup> = new Map();

  constructor() {
    // Register default powerups
    this.register(HintPowerup);
    this.register(FogPowerup);
    this.register(PeepPowerup);
  }

  /**
   * Register a powerup
   */
  register(powerup: IPowerup): void {
    if (this.powerups.has(powerup.id)) {
      console.warn(`Powerup "${powerup.id}" is already registered. Overwriting.`);
    }
    this.powerups.set(powerup.id, powerup);
  }

  /**
   * Get a powerup by ID
   */
  get(id: string): IPowerup | undefined {
    return this.powerups.get(id);
  }

  /**
   * Get all registered powerups
   */
  getAll(): IPowerup[] {
    return Array.from(this.powerups.values());
  }

  /**
   * Check if a powerup is registered
   */
  has(id: string): boolean {
    return this.powerups.has(id);
  }
}

// Export singleton instance
export const powerupRegistry = new PowerupRegistry();
