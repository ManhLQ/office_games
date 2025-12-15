import React from 'react';
import type { Players } from '../../types';
import type { IGame } from '../../games/core/interfaces/IGame';
import { CompletionProgress } from './CompletionProgress';

interface CompetitorsListProps {
  /** Current player ID */
  currentPlayerId: string;
  /** All players in the room */
  players: Players;
  /** Game instance for rendering mini boards */
  game: IGame;
  /** Whether in "peep" mode (show expanded view) */
  isPeepMode?: boolean;
}

/**
 * Generic competitors list component
 * Shows other players' progress
 * Works with any game type
 */
export const CompetitorsList: React.FC<CompetitorsListProps> = ({
  currentPlayerId,
  players,
  game,
  isPeepMode = false
}) => {
  const competitors = Object.entries(players).filter(
    ([playerId]) => playerId !== currentPlayerId
  );

  if (competitors.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        <p>No other players yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-gray-700">Competitors</h3>
      {competitors.map(([playerId, player]) => {
        const completionPercentage = player.completionPercentage || 0;
        const isWinner = player.status === 'finished' && player.finalScore !== null && player.finalScore > 0;

        return (
          <div
            key={playerId}
            className={`
              p-3 rounded-lg border-2 transition-all
              ${isWinner
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 bg-white'}
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-gray-900">
                {player.name}
                {isWinner && <span className="ml-2 text-green-600">🏆</span>}
              </span>
              <span className="text-sm text-gray-600">
                {completionPercentage}%
              </span>
            </div>

            <CompletionProgress
              percentage={completionPercentage}
              showPercentage={false}
            />

            {isPeepMode && (
              <div className="mt-3 p-2 bg-gray-50 rounded border border-gray-200">
                {/* Render mini board using game renderer */}
                {game.getRenderer().renderMiniBoard({
                  playerName: player.name,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  initialState: {} as any,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  currentState: {} as any,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  solution: {} as any,
                  showErrors: false,
                  isWinner,
                  finalScore: player.finalScore,
                  completionPercentage
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

CompetitorsList.displayName = 'CompetitorsList';
