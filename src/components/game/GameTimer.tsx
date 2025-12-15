import React from 'react';

interface GameTimerProps {
  /** Remaining time in seconds */
  remaining: number;
  /** Format time function (usually from useGameTimer hook) */
  formatTime: (seconds: number) => string;
  /** Whether time is running low (< 1 minute) */
  isRunningLow?: boolean;
  /** Whether time has expired */
  hasExpired?: boolean;
}

/**
 * Generic game timer component
 * Works with any game type
 */
export const GameTimer: React.FC<GameTimerProps> = ({
  remaining,
  formatTime,
  isRunningLow = false,
  hasExpired = false
}) => {
  const formattedTime = formatTime(remaining);

  // Determine color based on time status
  let colorClass = 'text-gray-800';
  let bgClass = 'bg-gray-100';

  if (hasExpired) {
    colorClass = 'text-red-800';
    bgClass = 'bg-red-100';
  } else if (isRunningLow) {
    colorClass = 'text-orange-800';
    bgClass = 'bg-orange-100 animate-pulse';
  }

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${bgClass}`}>
      <span className="text-2xl">⏱️</span>
      <div className="flex flex-col">
        <span className="text-xs text-gray-600 font-medium">Time Remaining</span>
        <span className={`text-2xl font-bold ${colorClass}`}>
          {formattedTime}
        </span>
      </div>
    </div>
  );
};

GameTimer.displayName = 'GameTimer';
