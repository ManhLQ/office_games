import { useState, useEffect } from 'react';
import { formatTime, getElapsedSeconds, getRemainingSeconds, minutesToSeconds } from '../utils/time';

interface UseGameTimerOptions {
  /** Timestamp when the game started */
  startTime: number;
  /** Time limit in minutes */
  timeLimitMinutes: number;
  /** Update interval in milliseconds (default: 1000ms) */
  updateInterval?: number;
}

interface UseGameTimerReturn {
  /** Elapsed time in seconds */
  elapsed: number;
  /** Remaining time in seconds */
  remaining: number;
  /** Format time as MM:SS */
  format: (seconds: number) => string;
  /** Whether time is running low (less than 1 minute) */
  isRunningLow: boolean;
  /** Whether time has expired */
  hasExpired: boolean;
}

/**
 * Game timer hook
 * Provides elapsed and remaining time with automatic updates
 * Works with any game type
 */
export function useGameTimer({
  startTime,
  timeLimitMinutes,
  updateInterval = 1000
}: UseGameTimerOptions): UseGameTimerReturn {
  const [elapsed, setElapsed] = useState(getElapsedSeconds(startTime));

  const timeLimitSeconds = minutesToSeconds(timeLimitMinutes);
  const remaining = getRemainingSeconds(startTime, timeLimitSeconds);
  const isRunningLow = remaining > 0 && remaining <= 60;
  const hasExpired = remaining === 0;

  useEffect(() => {
    // Update elapsed time
    const interval = setInterval(() => {
      setElapsed(getElapsedSeconds(startTime));
    }, updateInterval);

    return () => clearInterval(interval);
  }, [startTime, updateInterval]);

  return {
    elapsed,
    remaining,
    format: formatTime,
    isRunningLow,
    hasExpired
  };
}
