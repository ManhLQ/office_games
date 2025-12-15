/**
 * Game state interface
 * Represents the current state of any game
 */
export interface IGameState {
  /**
   * Serialize state to string for Firebase storage
   * @returns Serialized state string
   */
  serialize(): string;

  /**
   * Deserialize state from string
   * @param data Serialized state string
   * @returns New IGameState instance
   */
  deserialize(data: string): IGameState;

  /**
   * Create a deep copy of the state
   * @returns Cloned IGameState instance
   */
  clone(): IGameState;
}
