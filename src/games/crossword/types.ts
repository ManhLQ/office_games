/**
 * Crossword game types
 */

export interface Clue {
  number: number;
  clue: string;
  answer: string;
  row: number;
  col: number;
  length: number;
}

export interface CrosswordClues {
  across: Clue[];
  down: Clue[];
}

export interface CrosswordPuzzle {
  grid: string[][]; // Solution grid ('#' for black cells)
  clues: CrosswordClues;
  size: number; // Grid dimension (e.g., 7, 11, 15)
}

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
