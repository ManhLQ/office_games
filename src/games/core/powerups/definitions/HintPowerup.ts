import type { IPowerup } from '../../interfaces/IPowerup';

/**
 * Hint powerup definition
 * Shows the correct value for a selected or random cell
 */
export const HintPowerup: IPowerup = {
  id: 'hint',
  name: 'Hint',
  icon: '💡',
  description: 'Reveals the correct value for a cell',
  duration: null, // Instant effect
  scope: 'self',
  color: '#f59e0b', // amber-500
};
