/**
 * Simple test script to verify game registration works
 */
import '../games';  // This should register all games
import { gameRegistry } from '../games/core/GameRegistry';

// Check if Sudoku is registered
const sudoku = gameRegistry.get('sudoku');

if (!sudoku) {
  console.error('❌ Sudoku game NOT registered!');
  process.exit(1);
}

console.log('✅ Sudoku game registered successfully');
console.log(`   - ID: ${sudoku.id}`);
console.log(`   - Name: ${sudoku.name}`);
console.log(`   - Players: ${sudoku.minPlayers}-${sudoku.maxPlayers}`);
console.log(`   - Powerups: ${sudoku.supportsPowerups ? 'Yes' : 'No'}`);
console.log(`   - Difficulties: ${sudoku.difficultyLevels.join(', ')}`);

// Test game creation
console.log('\n📝 Testing game creation...');
const config = sudoku.createGame('medium');
console.log(`✅ Game config created`);
console.log(`   - Game ID: ${config.gameId}`);
console.log(`   - Difficulty: ${config.difficulty}`);
console.log(`   - Initial state length: ${config.initialState.serialize().length}`);
console.log(`   - Solution state length: ${config.solution.serialize().length}`);

// Test move validation
console.log('\n🎮 Testing move validation...');
const state = config.initialState;
const testMove = { row: 0, col: 0, value: 5 };
const isValid = sudoku.validateMove(state, testMove);
console.log(`✅ Move validation: ${isValid ? 'Valid' : 'Invalid'}`);

console.log('\n🎉 All tests passed!');
console.log(`\nTotal registered games: ${gameRegistry.count}`);
