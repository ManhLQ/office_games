import React, { useCallback } from 'react';
import type { IGame } from '../../games/core/interfaces/IGame';
import type { IGameState } from '../../games/core/interfaces/IGameState';
import type { IGameMove } from '../../games/core/interfaces/IGameMove';
import type { Players, PowerupInventory, SharedPowerupPool, PowerupType } from '../../types';
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
    selectCell,
    handleKeyDown
  } = useCellSelection({
    gridSize: 9, // TODO: Make this game-specific
    onCellSelect: (row, col) => {
      console.log('Cell selected:', row, col);
    }
  });

  const {
    activePowerup,
    handleUsePowerup,
    getPowerupCount
  } = usePowerupEffects({
    roomCode,
    playerId,
    players,
    powerupInventory,
    sharedPowerupPool,
    isGlobalMode
  });

  // Handle input from game controls
  const handleInput = useCallback((value: number | string) => {
    if (selectedCell) {
      const move: IGameMove = {
        row: selectedCell.row,
        col: selectedCell.col,
        value
      };
      onMove(move);
    }
  }, [selectedCell, onMove]);

  const handleClear = useCallback(() => {
    if (selectedCell) {
      const move: IGameMove = {
        row: selectedCell.row,
        col: selectedCell.col,
        value: 0
      };
      onMove(move);
    }
  }, [selectedCell, onMove]);

  // Get powerup counts
  const powerupCounts: Record<PowerupType, number> = {
    hint: getPowerupCount('hint'),
    fog: getPowerupCount('fog'),
    peep: getPowerupCount('peep')
  };

  // Check if peep mode is active
  const isPeepMode = activePowerup?.type === 'peep';

  // Check if fog is affecting this player
  const isFogged = Object.values(players).some(
    (player) => player.powerups?.activePowerup?.type === 'fog' && player.powerups.activePowerup !== null
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
                  onCellSelect: selectCell,
                  hintCell: activePowerup?.type === 'hint' ? { row: 0, col: 0, value: 5 } : null
                })}
              </div>

              {/* Fog overlay if active */}
              {isFogged && <FogOverlay isActive={true} />}
            </div>

            {/* Game controls */}
            <div className="mt-6">
              {renderer.renderControls({
                onInput: handleInput,
                onClear: handleClear
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
                  disabled={hasExpired}
                />
              </div>
            )}

            {/* Competitors list */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <CompetitorsList
                currentPlayerId={playerId}
                players={players}
                game={game}
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
