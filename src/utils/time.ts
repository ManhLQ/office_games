/**
 * Time formatting utilities
 */

/**
 * Format seconds as MM:SS
 * @param seconds Total seconds
 * @returns Formatted time string
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculate elapsed time in seconds
 * @param startTime Timestamp when timer started
 * @returns Elapsed seconds
 */
export function getElapsedSeconds(startTime: number): number {
  return Math.floor((Date.now() - startTime) / 1000);
}

/**
 * Calculate remaining time in seconds
 * @param startTime Timestamp when timer started
 * @param totalTimeSeconds Total time limit in seconds
 * @returns Remaining seconds (clamped to 0)
 */
export function getRemainingSeconds(startTime: number, totalTimeSeconds: number): number {
  const elapsed = getElapsedSeconds(startTime);
  return Math.max(0, totalTimeSeconds - elapsed);
}

/**
 * Convert minutes to seconds
 */
export function minutesToSeconds(minutes: number): number {
  return minutes * 60;
}

/**
 * Convert seconds to minutes (rounded down)
 */
export function secondsToMinutes(seconds: number): number {
  return Math.floor(seconds / 60);
}
