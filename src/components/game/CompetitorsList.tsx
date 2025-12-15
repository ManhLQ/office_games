import React from 'react';
import type { Players } from '../../types';
import type { IGame } from '../../games/core/interfaces/IGame';
import { CompletionProgress } from './CompletionProgress';
import { SudokuState } from '../../games/sudoku/SudokuState';
import { CrosswordState } from '../../games/crossword/CrosswordState';

interface CompetitorsListProps {
  players: Players;
  currentPlayerId: string;
  isPeepMode: boolean;
  game: IGame;
  gameId: string; // Add gameId prop
}

/**
 * Generic competitors list component
 * Shows other players' progress
 * Works with any game type
 */
export const CompetitorsList: React.FC<CompetitorsListProps> = ({
  players,
  currentPlayerId,
  isPeepMode,
  game,
  gameId
}) => {
  const otherPlayers = Object.entries(players).filter(
    ([playerId]) => playerId !== currentPlayerId
  );

  if (otherPlayers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Competitors</h2>
        <p className="text-gray-500 text-center py-4">No other players yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Competitors ({otherPlayers.length})
      </h2>
      <div className="space-y-4">
        {otherPlayers.map(([playerId, player]) => {
          const isWinner = false; // We don't have winner info here
          const completionPercentage = player.completionPercentage || 0;

          return (
            <div key={playerId} className="border-b border-gray-200 pb-4 last:border-0">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">{player.name}</span>
              </div>

              <CompletionProgress
                percentage={completionPercentage}
                showPercentage={false}
              />

              {isPeepMode && (() => {
                try {
                  const currentStateStr = player.currentGameState || player.currentBoardString;
                  if (!currentStateStr) {
                    return (
                      <div className="mt-3 p-2 bg-gray-50 rounded border border-gray-200">
                        <div className="text-xs text-gray-500 text-center py-2">No board data</div>
                      </div>
                    );
                  }

                  // Deserialize game state - use game-specific deserialization
                  let currentState;
                  if (gameId === 'sudoku') {
                    currentState = new SudokuState(currentStateStr);
                  } else if (gameId === 'crossword') {
                    currentState = CrosswordState.deserialize(currentStateStr);
                  } else {
                    return (
                      <div className="mt-3 p-2 bg-gray-50 rounded border border-gray-200">
                        <div className="text-xs text-gray-500 text-center py-2">Unknown game type</div>
                      </div>
                    );
                  }

                  return (
                    <div className="mt-3 p-2 bg-gray-50 rounded border border-gray-200">
                      {game.getRenderer().renderMiniBoard({
                        playerName: player.name,
                        initialState: currentState,
                        currentState,
                        solution: currentState,
                        showErrors: false,
                        isWinner,
                        finalScore: player.finalScore,
                        completionPercentage
                      })}
                    </div>
                  );
                } catch (error) {
                  console.error('Error rendering peep board:', error);
                  return (
                    <div className="mt-3 p-2 bg-red-50 rounded border border-red-200">
                      <div className="text-xs text-red-600 text-center py-2">Error loading board</div>
                    </div>
                  );
                }
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
};

CompetitorsList.displayName = 'CompetitorsList';
