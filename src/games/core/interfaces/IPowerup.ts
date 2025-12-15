/**
 * Powerup definition interface
 * Defines metadata and properties for a powerup
 */
export interface IPowerup {
  /** Unique identifier for the powerup */
  id: string;

  /** Display name */
  name: string;

  /** Icon/emoji for UI display */
  icon: string;

  /** Description of what the powerup does */
  description: string;

  /** Duration in seconds (null for instant powerups like hint) */
  duration: number | null;

  /** Who the powerup affects */
  scope: 'self' | 'others' | 'all';

  /** Color for UI display (CSS color) */
  color: string;
}
