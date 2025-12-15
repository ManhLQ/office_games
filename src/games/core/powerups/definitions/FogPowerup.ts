import type { IPowerup } from '../../interfaces/IPowerup';

/**
 * Fog powerup definition
 * Obscures other players' boards with fog overlay
 */
export const FogPowerup: IPowerup = {
  id: 'fog',
  name: 'Fog',
  icon: '🌫️',
  description: 'Obscures other players\' boards with fog',
  duration: 10, // 10 seconds
  scope: 'others',
  color: '#64748b', // slate-500
};
