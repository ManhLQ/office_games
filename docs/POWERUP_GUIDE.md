# Powerup System Guide

## Overview

The powerup system uses a two-interface architecture that separates powerup definitions from game-specific behavior:

1. **IPowerup** - Defines powerup metadata (id, name, icon, duration, scope, color)
2. **IPowerupHandler** - Implements game-specific powerup behavior

This design allows games to implement powerups differently while maintaining a consistent powerup registry.

---

## Architecture

### Core Components

```
src/games/core/
├── interfaces/
│   ├── IPowerup.ts           # Powerup definition interface
│   └── IPowerupHandler.ts    # Game-specific handler interface
└── powerups/
    ├── PowerupRegistry.ts    # Singleton registry
    └── definitions/
        ├── HintPowerup.ts    # Hint definition
        ├── FogPowerup.ts     # Fog definition
        └── PeepPowerup.ts    # Peep definition
```

### Built-in Powerups

| Powerup | ID | Duration | Scope | Description |
|---------|-----|----------|-------|-------------|
| 💡 Hint | `hint` | Instant | Self | Reveals correct value for a cell |
| 🌫️ Fog | `fog` | 10s | Others | Obscures other players' boards |
| 👀 Peep | `peep` | 5s | Self | View other players' boards |

---

## How to Create a New Powerup

### Step 1: Define the Powerup

Create a new file in `src/games/core/powerups/definitions/`:

```typescript
// src/games/core/powerups/definitions/FreezePowerup.ts
import type { IPowerup } from '../../interfaces/IPowerup';

export const FreezePowerup: IPowerup = {
  id: 'freeze',
  name: 'Freeze',
  icon: '❄️',
  description: 'Freezes other players for 5 seconds',
  duration: 5, // seconds
  scope: 'others',
  color: '#60a5fa', // blue-400
};
```

### Step 2: Register the Powerup

Add to `PowerupRegistry.ts`:

```typescript
import { FreezePowerup } from './definitions/FreezePowerup';

constructor() {
  this.register(HintPowerup);
  this.register(FogPowerup);
  this.register(PeepPowerup);
  this.register(FreezePowerup); // Add here
}
```

### Step 3: Implement Game-Specific Behavior

Update each game's powerup handler:

```typescript
// src/games/sudoku/SudokuPowerupHandler.ts
activate(powerup: IPowerup, state: IGameState, context: PowerupContext, solution?: IGameState): PowerupResult {
  if (powerup.id === 'hint') {
    return this.handleHint(state, context, solution);
  }
  
  if (powerup.id === 'freeze') {
    return this.handleFreeze(state, context);
  }

  // Fog and peep are handled at framework level
  return {
    success: true,
    message: `${powerup.name} activated!`
  };
}

private handleFreeze(state: IGameState, context: PowerupContext): PowerupResult {
  // Implement freeze logic
  return {
    success: true,
    message: 'Opponents frozen!'
  };
}
```

---

## How to Implement Powerups for a New Game

### Step 1: Create Powerup Handler

Create `YourGamePowerupHandler.ts`:

```typescript
import type { IPowerupHandler, PowerupContext, PowerupResult } from '../core/interfaces/IPowerupHandler';
import type { IPowerup } from '../core/interfaces/IPowerup';
import type { IGameState } from '../core/interfaces/IGameState';
import { YourGameState } from './YourGameState';

export class YourGamePowerupHandler implements IPowerupHandler {
  canActivate(powerup: IPowerup, state: IGameState, _context: PowerupContext): boolean {
    // Check if powerup can be activated
    // For example, hint requires empty cells
    if (powerup.id === 'hint') {
      const gameState = state as YourGameState;
      return gameState.hasEmptyCells();
    }
    return true;
  }

  activate(powerup: IPowerup, state: IGameState, context: PowerupContext, solution?: IGameState): PowerupResult {
    if (powerup.id === 'hint') {
      return this.handleHint(state, context, solution);
    }

    // Universal powerups (fog, peep) handled by framework
    return {
      success: true,
      message: `${powerup.name} activated!`
    };
  }

  private handleHint(state: IGameState, context: PowerupContext, solution?: IGameState): PowerupResult {
    if (!solution) {
      return { success: false, message: 'Solution not available' };
    }

    const gameState = state as YourGameState;
    const solutionState = solution as YourGameState;
    const { selectedCell } = context;

    // Your game-specific hint logic here
    // Return the cell and value to hint
    return {
      success: true,
      message: 'Hint provided',
      hintCell: {
        row: selectedCell.row,
        col: selectedCell.col,
        value: solutionState.getValue(selectedCell.row, selectedCell.col)
      }
    };
  }
}
```

### Step 2: Add to Game Class

Update `YourGame.ts`:

```typescript
import { YourGamePowerupHandler } from './YourGamePowerupHandler';

export class YourGame implements IGame {
  // ... other methods ...

  getPowerupHandler(): IPowerupHandler {
    return new YourGamePowerupHandler();
  }
}
```

---

## Powerup Scopes

### `self` - Affects only the activating player
- **Hint**: Shows correct value to the player
- **Peep**: Allows player to see others' boards

### `others` - Affects all other players
- **Fog**: Obscures other players' boards (from their perspective)

### `all` - Affects everyone
- Future powerups that affect all players

---

## Universal vs Game-Specific Powerups

### Universal Powerups
Handled at the framework level (no game-specific code needed):
- **Fog**: Overlay on mini boards
- **Peep**: Show/hide competitor boards

### Game-Specific Powerups
Require implementation in each game's handler:
- **Hint**: Different logic for Sudoku (numbers) vs Crossword (letters)
- **Future powerups**: Shuffle, Swap, etc.

---

## Best Practices

### 1. Keep Powerups Simple
Each powerup should have a single, clear purpose.

### 2. Validate Before Activating
Use `canActivate()` to check if a powerup can be used:
```typescript
canActivate(powerup: IPowerup, state: IGameState, _context: PowerupContext): boolean {
  if (powerup.id === 'hint') {
    return this.hasEmptyCells(state);
  }
  return true;
}
```

### 3. Provide Clear Feedback
Return meaningful messages in `PowerupResult`:
```typescript
return {
  success: false,
  message: 'No empty cells available for hint'
};
```

### 4. Handle Missing Solution
Always check if solution is provided for hint-like powerups:
```typescript
if (!solution) {
  return { success: false, message: 'Solution not available' };
}
```

### 5. Use Type Guards
Cast states safely:
```typescript
const gameState = state as YourGameState;
const solutionState = solution as YourGameState;
```

---

## Testing Powerups

### Unit Tests
```typescript
describe('YourGamePowerupHandler', () => {
  it('should activate hint for empty cell', () => {
    const handler = new YourGamePowerupHandler();
    const result = handler.activate(HintPowerup, state, context, solution);
    expect(result.success).toBe(true);
    expect(result.hintCell).toBeDefined();
  });

  it('should reject hint when no empty cells', () => {
    const handler = new YourGamePowerupHandler();
    const canActivate = handler.canActivate(HintPowerup, fullState, context);
    expect(canActivate).toBe(false);
  });
});
```

### Integration Tests
1. Activate powerup in game
2. Verify visual effects
3. Check state changes
4. Confirm duration tracking

---

## Examples

### Example 1: Hint in Sudoku
```typescript
// Shows number in selected or random empty cell
hintCell: {
  row: 3,
  col: 5,
  value: 7  // number
}
```

### Example 2: Hint in Crossword
```typescript
// Shows letter in selected or random empty cell
hintCell: {
  row: 2,
  col: 4,
  value: 'A'  // letter
}
```

### Example 3: Universal Fog
```typescript
// No game-specific code needed
// Framework handles overlay on mini boards
return {
  success: true,
  message: 'Fog activated!'
};
```

---

## Troubleshooting

### Powerup not appearing
- Check if registered in `PowerupRegistry.ts`
- Verify powerup ID matches in handler

### Hint not working
- Ensure `solution` parameter is passed
- Check `canActivate()` returns true
- Verify `hintCell` includes `value` property

### Build errors
- Import `IPowerupHandler` type in game class
- Add handler import to game file
- Implement all interface methods

---

## Summary

**To add a new powerup**:
1. Define in `definitions/`
2. Register in `PowerupRegistry`
3. Implement in each game's handler

**To add powerups to a new game**:
1. Create `YourGamePowerupHandler`
2. Implement `canActivate()` and `activate()`
3. Add `getPowerupHandler()` to game class

The powerup system is designed to be extensible while maintaining type safety and clear separation of concerns.
