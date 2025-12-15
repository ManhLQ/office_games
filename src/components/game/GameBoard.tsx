import React, { useState, useCallback, useEffect } from 'react';
import { ref, update } from 'firebase/database';
import { database } from '../../config/firebase';
import type { IGame } from '../../games/core/interfaces/IGame';
import type { IGameState } from '../../games/core/interfaces/IGameState';
import type { IGameMove } from '../../games/core/interfaces/IGameMove';
import type { Players, PowerupInventory, SharedPowerupPool, PowerupType } from '../../types';
import { SudokuState } from '../../games/sudoku/SudokuState';
import { useGameTimer } from '../../hooks/useGameTimer';
import { useCellSelection } from '../../hooks/useCellSelection';
import { usePowerupEffects } from '../../hooks/usePowerupEffects';
import { GameTimer } from './GameTimer';
import { CompletionProgress } from './CompletionProgress';
import { PowerupControls } from './PowerupControls';
import { CompetitorsList } from './CompetitorsList';
import { FogOverlay } from './FogOverlay';

interface GameBoardProps {
  /** Game instance */
  game: IGame;
  /** Initial game state */
  initialState: IGameState;
  /** Solution state */
  solution: IGameState;
  /** Current game state */
  currentState: IGameState;
  /** Room code */
  roomCode: string;
  /** Current player ID */
  playerId: string;
  /** Player name */
  playerName: string;
  /** All players in room */
  players: Players;
  /** Game start timestamp */
  gameStartTime: number;
  /** Time limit in minutes */
  timeLimitMinutes: number;
  /** Current completion percentage */
  completionPercentage: number;
  /** Powerup inventory (personal mode) */
  powerupInventory?: PowerupInventory;
  /** Shared powerup pool (global mode) */
  sharedPowerupPool?: SharedPowerupPool;
  /** Whether using global powerup mode */
  isGlobalMode?: boolean;
  /** Callback when move is made */
  onMove: (move: IGameMove) => void;
  /** Callback when game ends */
  onGameEnd?: (isWinner: boolean) => void;
}

/**
 * Generic game board component
 * Works with any game implementing IGame interface
 * Handles timer, powerups, competitors list, and game rendering
 */
export const GameBoard: React.FC<GameBoardProps> = ({
  game,
  initialState,
  solution,
  currentState,
  roomCode,
  playerId,
  playerName,
  players,
  gameStartTime,
  timeLimitMinutes,
  completionPercentage,
  powerupInventory,
  sharedPowerupPool,
  isGlobalMode = false,
  onMove
  // onGameEnd - reserved for future use
}) => {
  // Use hooks
  const { remaining, format, isRunningLow, hasExpired } = useGameTimer({
    startTime: gameStartTime,
    timeLimitMinutes
  });

  const {
    selectedCell,
    hoveredCell,
    highlightedValue,
    selectCell: baseCellSelect,
    setHighlightedValue,
    handleKeyDown
  } = useCellSelection({
    gridSize: 9, // TODO: Make this game-specific
  });

  // Wrap selectCell to add highlighting
  const selectCell = useCallback((row: number, col: number) => {
    baseCellSelect(row, col);
    // Set highlighted value to the number in the clicked cell
    const currentGrid = (currentState as SudokuState).getGrid();
    if (currentGrid) {
      const cellValue = currentGrid[row][col];
      setHighlightedValue(cellValue !== 0 ? cellValue : null);
    }
  }, [baseCellSelect, currentState, setHighlightedValue]);

  const {
    activePowerup,
    handleUsePowerup: baseHandleUsePowerup,
    getPowerupCount
  } = usePowerupEffects({
    roomCode,
    playerId,
    players,
    powerupInventory,
    sharedPowerupPool,
    isGlobalMode
  });

  // Wrap handleUsePowerup to add validation for hint
  const handleUsePowerup = useCallback(async (type: PowerupType) => {
    // For hint powerup, validate that a cell is selected
    if (type === 'hint') {
      const handler = game.getPowerupHandler();
      const powerup = { id: 'hint', name: 'Hint', icon: '💡', description: '', duration: null, scope: 'self' as const, color: '' };

      const canActivate = handler.canActivate(powerup, currentState, {
        playerId,
        roomCode,
        selectedCell: selectedCell || undefined,
        players
      });

      if (!canActivate) {
        alert('Please select a cell first to use the hint powerup!');
        return;
      }
    }

    // Call the base handler
    await baseHandleUsePowerup(type);
  }, [baseHandleUsePowerup, game, currentState, selectedCell, playerId, roomCode, players]);

  // Get powerup counts
  const powerupCounts: Record<PowerupType, number> = {
    hint: getPowerupCount('hint'),
    fog: getPowerupCount('fog'),
    peep: getPowerupCount('peep')
  };

  const [hintCell, setHintCell] = useState<{ row: number; col: number; value: number | string } | null>(null);

  // Calculate hint cell ONCE when hint powerup is activated
  useEffect(() => {
    if (!activePowerup || activePowerup.type !== 'hint') {
      setHintCell(null);
      return;
    }

    // Only calculate if we don't already have a hint cell
    if (hintCell) return;

    // Use game's powerup handler to calculate hint
    const handler = game.getPowerupHandler();
    const powerup = { id: 'hint', name: 'Hint', icon: '💡', description: '', duration: null, scope: 'self' as const, color: '' };

    const result = handler.activate(
      powerup,
      currentState,
      {
        playerId,
        roomCode,
        selectedCell: selectedCell || undefined,
        players
      },
      solution
    );

    if (result.success && result.hintCell) {
      setHintCell(result.hintCell);
    } else {
      setHintCell(null);
    }
  }, [activePowerup, game, currentState, selectedCell, players, solution, playerId, roomCode, hintCell]);

  // Update Firebase with the calculated hint cell when it changes
  useEffect(() => {
    if (activePowerup?.type === 'hint' && hintCell) {
      update(ref(database), {
        [`rooms/${roomCode}/players/${playerId}/powerups/activePowerup/hintCell`]: hintCell
      });
    } else if (activePowerup?.type === 'hint' && !hintCell && activePowerup.hintCell) {
      // If hintCell becomes null locally but Firebase still has one, clear it
      update(ref(database), {
        [`rooms/${roomCode}/players/${playerId}/powerups/activePowerup/hintCell`]: null
      });
    }
  }, [hintCell, activePowerup, roomCode, playerId]);

  // Handle input from game controls
  const handleInput = useCallback((value: number | string) => {
    if (selectedCell) {
      // CRITICAL: Check if cell is editable (not pre-filled)
      const initialGrid = (initialState as SudokuState).getGrid();
      if (initialGrid && initialGrid[selectedCell.row][selectedCell.col] !== 0) {
        // Cell is pre-filled, cannot edit
        return;
      }

      const move: IGameMove = {
        row: selectedCell.row,
        col: selectedCell.col,
        value
      };
      onMove(move);
    }
  }, [selectedCell, onMove, initialState]);

  const handleClear = useCallback(() => {
    if (selectedCell) {
      // CRITICAL: Check if cell is editable (not pre-filled)
      const initialGrid = (initialState as SudokuState).getGrid();
      if (initialGrid && initialGrid[selectedCell.row][selectedCell.col] !== 0) {
        // Cell is pre-filled, cannot clear
        return;
      }

      const move: IGameMove = {
        row: selectedCell.row,
        col: selectedCell.col,
        value: 0
      };
      onMove(move);
    }
  }, [selectedCell, onMove, initialState]);

  // Peep mode - show competitor boards when peep powerup is active
  const isPeepMode = activePowerup?.type === 'peep';

  // Check if fog is affecting this player (someone else used fog on them)
  const isFogged = Object.entries(players).some(
    ([pid, player]) => {
      const powerup = player.powerups?.activePowerup;
      // Fog affects everyone EXCEPT the player who activated it
      return powerup?.type === 'fog' && pid !== playerId;
    }
  );

  // Get renderer
  const renderer = game.getRenderer();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{game.name}</h1>
              <p className="text-gray-600">{playerName}</p>
            </div>
            <GameTimer
              remaining={remaining}
              formatTime={format}
              isRunningLow={isRunningLow}
              hasExpired={hasExpired}
            />
          </div>
          <div className="mt-4">
            <CompletionProgress percentage={completionPercentage} />
          </div>
        </div>
        {/* Main content */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Game board - Left side (2 columns on desktop) */}
          <div className="md:col-span-2 bg-white rounded-lg shadow-lg p-6">
            <div className="relative">
              {/* Render game board */}
              <div
                tabIndex={0}
                onKeyDown={(e) => handleKeyDown(e, handleInput)}
                className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
              >
                {renderer.renderPlayerBoard({
                  state: currentState,
                  initialState,
                  solution,
                  onMove,
                  selectedCell,
                  hoveredCell,
                  highlightedNumber: highlightedValue,
                  onCellSelect: selectCell,
                  hintCell: activePowerup?.type === 'hint' ? activePowerup.hintCell || null : null
                })}
              </div>

              {/* Fog overlay if active */}
              {isFogged && <FogOverlay isActive={true} />}
            </div>

            {/* Game controls */}
            <div className="mt-6">
              {renderer.renderControls({
                onInput: handleInput,
                onClear: handleClear,
                selectedCell,
                currentState
              })}
            </div>
          </div>

          {/* Sidebar - Right side (1 column on desktop) */}
          <div className="space-y-4">
            {/* Powerup controls */}
            {game.supportsPowerups && (
              <div className="bg-white rounded-lg shadow-lg p-4">
                <PowerupControls
                  powerupCounts={powerupCounts}
                  activePowerup={activePowerup}
                  onUsePowerup={handleUsePowerup}
                />
              </div>
            )}

            {/* Competitors list */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <CompetitorsList
                currentPlayerId={playerId}
                players={players}
                game={game}
                gameId={game.id}
                isPeepMode={isPeepMode}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

GameBoard.displayName = 'GameBoard';
