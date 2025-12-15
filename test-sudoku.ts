/**
 * Sudoku Game Critical Path Tests
 * Simple runtime tests without test framework
 */
import { SudokuGame } from './src/games/sudoku/SudokuGame';
import { SudokuState } from './src/games/sudoku/SudokuState';
import { SudokuMove } from './src/games/sudoku/SudokuMove';

console.log('🧪 Running Sudoku Game Tests...\n');

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
    failed++;
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

const game = new SudokuGame();

// Test 1: Game Metadata
test('Game has correct metadata', () => {
  assert(game.id === 'sudoku', 'Game ID should be "sudoku"');
  assert(game.name === 'Sudoku Sprint', 'Game name should be "Sudoku Sprint"');
  assert(game.minPlayers === 2, 'Min players should be 2');
  assert(game.maxPlayers === 4, 'Max players should be 4');
  assert(game.supportsPowerups === true, 'Should support powerups');
});

// Test 2: Game Creation
test('Creates valid game config', () => {
  const config = game.createGame('medium');
  assert(config.gameId === 'sudoku', 'Config game ID should be "sudoku"');
  assert(config.difficulty === 'medium', 'Difficulty should be "medium"');
  assert(config.initialState instanceof SudokuState, 'Initial state should be SudokuState');
  assert(config.solution instanceof SudokuState, 'Solution should be SudokuState');
});

// Test 3: State Serialization
test('State serializes to 81 characters', () => {
  const config = game.createGame('easy');
  const puzzle = config.initialState.serialize();
  const solution = config.solution.serialize();

  assert(puzzle.length === 81, 'Puzzle should be 81 characters');
  assert(solution.length === 81, 'Solution should be 81 characters');
  assert(!solution.includes('0'), 'Solution should have no empty cells');
});

// Test 4: Move Validation
test('Validates moves correctly', () => {
  const state = new SudokuState(
    '530070000600195000098000060800060000400800000000000000001000008070040000000000009'
  );

  const validMove = new SudokuMove(0, 2, 4);
  const outOfBoundsRow = new SudokuMove(9, 0, 5);
  const outOfBoundsCol = new SudokuMove(0, 9, 5);
  const invalidValue = new SudokuMove(0, 0, 10);

  assert(game.validateMove(state, validMove) === true, 'Valid move should pass');
  assert(game.validateMove(state, outOfBoundsRow) === false, 'Out of bounds row should fail');
  assert(game.validateMove(state, outOfBoundsCol) === false, 'Out of bounds col should fail');
  assert(game.validateMove(state, invalidValue) === false, 'Invalid value should fail');
});

// Test 5: Move Application
test('Applies moves correctly', () => {
  const state = new SudokuState(
    '530070000600195000098000060800060000400800000000000000001000008070040000000000009'
  );
  const move = new SudokuMove(0, 2, 4);
  const newState = game.applyMove(state, move) as SudokuState;

  assert(newState.getCell(0, 2) === 4, 'New state should have value 4 at (0,2)');
  assert(state.getCell(0, 2) === 0, 'Original state should be unchanged');
});

// Test 6: Game Completion Detection
test('Detects game completion', () => {
  const incomplete = new SudokuState(
    '530070000600195000098000060800060000400800000000000000001000008070040000000000009'
  );
  const complete = new SudokuState(
    '534678912672195348198342567859761423426853791713924856961537284287419635345286179'
  );

  assert(game.isGameComplete(incomplete) === false, 'Incomplete game should return false');
  assert(game.isGameComplete(complete) === true, 'Complete game should return true');
});

// Test 7: Correctness Validation
test('Validates correct solutions', () => {
  const solution = new SudokuState(
    '534678912672195348198342567859761423426853791713924856961537284287419635345286179'
  );
  const correct = new SudokuState(
    '534678912672195348198342567859761423426853791713924856961537284287419635345286179'
  );
  const incorrect = new SudokuState(
    '134678912672195348198342567859761423426853791713924856961537284287419635345286179'
  );

  assert(game.isGameCorrect(correct, solution) === true, 'Correct solution should pass');
  assert(game.isGameCorrect(incorrect, solution) === false, 'Incorrect solution should fail');
});

// Test 8: Score Calculation
test('Calculates completion score', () => {
  const initial = new SudokuState(
    '530070000600195000098000060800060000400800000000000000001000008070040000000000009'
  );
  const emptyState = new SudokuState(
    '530070000600195000098000060800060000400800000000000000001000008070040000000000009'
  );
  const completeState = new SudokuState(
    '534678912672195348198342567859761423426853791713924856961537284287419635345286179'
  );

  const emptyScore = game.calculateScore(emptyState, initial);
  const completeScore = game.calculateScore(completeState, initial);

  assert(emptyScore === 0, 'Empty board should score 0%');
  assert(completeScore === 100, 'Complete board should score 100%');
});

// Test 9: State Cloning
test('Clones state independently', () => {
  const original = new SudokuState(
    '530070000600195000098000060800060000400800000000000000001000008070040000000000009'
  );
  const clone = original.clone() as SudokuState;
  const modified = clone.setCell(0, 2, 9);

  assert(original.getCell(0, 2) === 0, 'Original should be unchanged after cloning');
  assert(modified.getCell(0, 2) === 9, 'Modified clone should have new value');
});

// Test 10: Number Counting
test('Counts numbers correctly', () => {
  const state = new SudokuState(
    '530070000600195000098000060800060000400800000000000000001000008070040000000000009'
  );
  const counts = state.getNumberCounts();

  assert(Object.keys(counts).length === 9, 'Should have counts for 1-9');
  assert(counts[5] > 0, 'Should count non-zero numbers');
});

console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
}

console.log('🎉 All tests passed!');
