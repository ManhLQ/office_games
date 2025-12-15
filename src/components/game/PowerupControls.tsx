import React from 'react';
import type { PowerupType } from '../../types';
import { POWERUP_META } from '../../constants/powerups';

interface PowerupControlsProps {
  /** Available powerup counts */
  powerupCounts: Record<PowerupType, number>;
  /** Currently active powerup */
  activePowerup?: { type: PowerupType; startedAt: number } | null;
  /** Callback when powerup is used */
  onUsePowerup: (type: PowerupType) => void;
  /** Whether controls are disabled */
  disabled?: boolean;
}

/**
 * Generic powerup controls
 * Works with any game that supports powerups
 */
export const PowerupControls: React.FC<PowerupControlsProps> = ({
  powerupCounts,
  activePowerup,
  onUsePowerup,
  disabled = false
}) => {
  const powerupTypes: PowerupType[] = ['hint', 'fog', 'peep'];

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-bold text-gray-700">Powerups</h3>
      <div className="flex gap-2">
        {powerupTypes.map((type) => {
          const meta = POWERUP_META[type];
          const count = powerupCounts[type] || 0;
          const isActive = activePowerup?.type === type;
          const isDisabled = disabled || count === 0 || (activePowerup !== null && !isActive);

          return (
            <button
              key={type}
              onClick={() => !isDisabled && onUsePowerup(type)}
              disabled={isDisabled}
              className={`
                relative flex flex-col items-center gap-1 px-4 py-2 rounded-lg
                transition-all duration-200 min-w-[80px]
                ${isActive
                  ? `${meta.color} text-white animate-pulse`
                  : isDisabled
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                    : `${meta.color} hover:opacity-80 text-white`}
              `}
            >
              <span className="text-2xl">{meta.icon}</span>
              <span className="text-xs font-bold">{meta.name}</span>
              <span className="absolute -top-1 -right-1 bg-white text-gray-800 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-gray-300">
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

PowerupControls.displayName = 'PowerupControls';
