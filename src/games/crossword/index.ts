import { gameRegistry } from '../core/GameRegistry';
import { CrosswordGame } from './CrosswordGame';

// Register crossword game
gameRegistry.register(new CrosswordGame());

export * from './CrosswordGame';
export * from './CrosswordState';
export * from './CrosswordMove';
export * from './types';
