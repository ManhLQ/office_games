import type { IPowerup } from '../../interfaces/IPowerup';

/**
 * Peep powerup definition
 * Allows viewing other players' boards temporarily
 */
export const PeepPowerup: IPowerup = {
  id: 'peep',
  name: 'Peep',
  icon: '👀',
  description: 'View other players\' boards temporarily',
  duration: 5, // 5 seconds
  scope: 'self',
  color: '#06b6d4', // cyan-500
};
