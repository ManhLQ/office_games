import React from 'react';

interface CompletionProgressProps {
  /** Completion percentage (0-100) */
  percentage: number;
  /** Player name (optional, for display) */
  playerName?: string;
  /** Show percentage text */
  showPercentage?: boolean;
}

/**
 * Generic completion progress bar
 * Works with any game type
 */
export const CompletionProgress: React.FC<CompletionProgressProps> = ({
  percentage,
  playerName,
  showPercentage = true
}) => {
  // Clamp percentage to 0-100
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  // Determine color based on completion
  let barColor = 'bg-blue-500';
  if (clampedPercentage >= 100) {
    barColor = 'bg-green-500';
  } else if (clampedPercentage >= 75) {
    barColor = 'bg-cyan-500';
  } else if (clampedPercentage >= 50) {
    barColor = 'bg-blue-500';
  } else if (clampedPercentage >= 25) {
    barColor = 'bg-yellow-500';
  } else {
    barColor = 'bg-gray-400';
  }

  return (
    <div className="w-full">
      {playerName && (
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium text-gray-700">{playerName}</span>
          {showPercentage && (
            <span className="text-gray-600">{clampedPercentage}%</span>
          )}
        </div>
      )}
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-300 ease-out`}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
      {!playerName && showPercentage && (
        <div className="text-center text-sm text-gray-600 mt-1">
          {clampedPercentage}% Complete
        </div>
      )}
    </div>
  );
};

CompletionProgress.displayName = 'CompletionProgress';
