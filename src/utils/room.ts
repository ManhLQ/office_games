/**
 * Generates a random room code
 * @param length - Length of the room code (default: 6)
 * @returns Random alphanumeric room code
 */
export function generateRoomCode(length: number = 6): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Generates a unique player ID
 * @returns Unique player ID string
 */
export function generatePlayerId(): string {
  return `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Validates a room code format
 * @param code - Room code to validate
 * @returns true if valid format
 */
export function isValidRoomCode(code: string): boolean {
  return /^[A-Z0-9]{4,8}$/.test(code.toUpperCase());
}
