import type { IGame } from './interfaces/IGame';

/**
 * Central registry for all available games
 * Games self-register when their module is imported
 */
class GameRegistry {
  private games: Map<string, IGame> = new Map();

  /**
   * Register a game in the registry
   * @param game Game instance to register
   * @throws Error if game ID is already registered
   */
  register(game: IGame): void {
    if (this.games.has(game.id)) {
      console.warn(`Game with id "${game.id}" is already registered. Overwriting.`);
    }
    this.games.set(game.id, game);
    console.log(`✅ Game registered: ${game.name} (${game.id})`);
  }

  /**
   * Get a game by its ID
   * @param gameId Unique game identifier
   * @returns Game instance or undefined if not found
   */
  get(gameId: string): IGame | undefined {
    return this.games.get(gameId);
  }

  /**
   * Get all registered games
   * @returns Array of all game instances
   */
  getAll(): IGame[] {
    return Array.from(this.games.values());
  }

  /**
   * Check if a game is registered
   * @param gameId Unique game identifier
   * @returns true if game is registered
   */
  has(gameId: string): boolean {
    return this.games.has(gameId);
  }

  /**
   * Unregister a game (useful for testing)
   * @param gameId Unique game identifier
   */
  unregister(gameId: string): void {
    this.games.delete(gameId);
  }

  /**
   * Get total number of registered games
   */
  get count(): number {
    return this.games.size;
  }
}

// Singleton instance
export const gameRegistry = new GameRegistry();
