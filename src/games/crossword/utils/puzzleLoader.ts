import type { CrosswordPuzzle, Difficulty } from '../types';
import easyPuzzle1 from '../puzzles/easy-1.json';

/**
 * Load a puzzle by difficulty
 */
export function loadPuzzle(difficulty: Difficulty): CrosswordPuzzle {
  // For now, just return the first puzzle of each difficulty
  // In the future, randomly select from multiple puzzles

  switch (difficulty) {
    case 'easy':
      return easyPuzzle1 as CrosswordPuzzle;
    case 'medium':
      // TODO: Add medium puzzles
      return easyPuzzle1 as CrosswordPuzzle;
    case 'hard':
      // TODO: Add hard puzzles
      return easyPuzzle1 as CrosswordPuzzle;
    case 'expert':
      // TODO: Add expert puzzles
      return easyPuzzle1 as CrosswordPuzzle;
    default:
      return easyPuzzle1 as CrosswordPuzzle;
  }
}
