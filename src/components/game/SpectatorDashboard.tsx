import React, { useState, useEffect } from 'react';
import { MiniBoard } from './MiniBoard';
import type { Players } from '../../types';

interface SpectatorDashboardProps {
    players: Players;
    puzzleString: string;
    solutionString: string;
    winnerId: string | null;
    gameStatus: 'waiting' | 'playing' | 'finished';
    startTime: number | null;
}

/**
 * SpectatorDashboard Component - Party-themed big screen spectator view
 */
export const SpectatorDashboard: React.FC<SpectatorDashboardProps> = ({
    players,
    puzzleString,
    solutionString,
    winnerId,
    gameStatus,
    startTime,
}) => {
    const playerEntries = Object.entries(players);
    const [elapsedTime, setElapsedTime] = useState(0);

    // Timer effect
    useEffect(() => {
        if (gameStatus !== 'playing' || !startTime) {
            return;
        }

        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));

        const interval = setInterval(() => {
            setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [gameStatus, startTime]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const sortedPlayers = [...playerEntries].sort(([idA, playerA], [idB, playerB]) => {
        if (idA === winnerId) return -1;
        if (idB === winnerId) return 1;
        if (playerA.finalScore !== null && playerB.finalScore !== null) {
            return playerB.finalScore - playerA.finalScore;
        }
        return 0;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-6 relative overflow-hidden">
            {/* Animated background bubbles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-64 h-64 bg-yellow-300 rounded-full opacity-10 animate-pulse" style={{ animationDuration: '3s' }}></div>
                <div className="absolute bottom-40 right-10 w-80 h-80 bg-cyan-300 rounded-full opacity-10 animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
                <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-lime-300 rounded-full opacity-10 animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }}></div>
            </div>

            {/* Header */}
            <div className="text-center mb-6 relative z-10">
                <div className="text-6xl mb-4 animate-bounce">🎉 🎮 🎊</div>
                <h1 className="text-5xl md:text-7xl font-black text-white mb-4 drop-shadow-2xl" style={{
                    textShadow: '4px 4px 0px rgba(0,0,0,0.3)'
                }}>
                    SUDOKU PARTY!
                </h1>

                {/* Timer - HUGE display */}
                {gameStatus === 'playing' && (
                    <div className="inline-block bg-white/90 backdrop-blur-sm px-12 py-6 rounded-3xl mb-4 border-4 border-yellow-400 shadow-2xl">
                        <div className="text-6xl md:text-7xl font-black bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                            ⏱️ {formatTime(elapsedTime)}
                        </div>
                    </div>
                )}

                <div className="text-2xl md:text-3xl font-black text-white drop-shadow-lg">
                    {gameStatus === 'waiting' && '⏳ Get Ready to Party!'}
                    {gameStatus === 'playing' && '🔥 THE RACE IS ON! 🔥'}
                    {gameStatus === 'finished' && `🏆 PARTY OVER! Time: ${formatTime(elapsedTime)}`}
                </div>
            </div>

            {/* Winner Announcement */}
            {gameStatus === 'finished' && winnerId && players[winnerId] && (
                <div className="text-center mb-8 animate-pulse relative z-10">
                    <div className="text-8xl md:text-9xl font-black text-yellow-300 drop-shadow-2xl mb-4" style={{
                        textShadow: '6px 6px 0px rgba(0,0,0,0.3), 0 0 40px rgba(255,255,0,0.5)'
                    }}>
                        🎉 {players[winnerId].name.toUpperCase()} 🎉
                    </div>
                    <div className="text-5xl font-black text-white drop-shadow-xl">
                        ⭐ CHAMPION! ⭐
                    </div>
                </div>
            )}

            {/* Player Boards Grid */}
            <div
                className={`
          grid gap-6 max-w-6xl mx-auto relative z-10
          ${playerEntries.length <= 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2'}
        `}
            >
                {sortedPlayers.map(([playerId, player]) => {
                    // Extract active powerup info
                    const activePowerup = player.powerups?.activePowerup;
                    let powerupDisplay = null;

                    if (activePowerup) {
                        const elapsed = Date.now() - activePowerup.startedAt;
                        const remaining = Math.max(0, Math.ceil((activePowerup.durationMs - elapsed) / 1000));
                        const icons = { hint: '💡', fog: '🌫️', peep: '👀' };
                        const colors = {
                            hint: 'from-yellow-400 to-orange-500',
                            fog: 'from-gray-400 to-gray-600',
                            peep: 'from-blue-400 to-purple-500',
                        };

                        if (remaining > 0 || activePowerup.type === 'hint') {
                            powerupDisplay = {
                                type: activePowerup.type,
                                icon: icons[activePowerup.type],
                                remaining: activePowerup.type === 'hint' ? null : remaining,
                                color: colors[activePowerup.type],
                            };
                        }
                    }

                    return (
                        <div key={playerId} className="relative">
                            {/* Powerup Badge */}
                            {powerupDisplay && (
                                <div className={`
                                    absolute -top-3 -right-3 z-20 px-4 py-2 rounded-full shadow-lg
                                    bg-gradient-to-r ${powerupDisplay.color} text-white font-black
                                    flex items-center gap-2 border-2 border-white
                                    ${powerupDisplay.remaining ? 'animate-pulse' : ''}
                                `}>
                                    <span className="text-xl">{powerupDisplay.icon}</span>
                                    <span className="text-sm uppercase">{powerupDisplay.type}</span>
                                    {powerupDisplay.remaining !== null && (
                                        <span className="text-sm">{powerupDisplay.remaining}s</span>
                                    )}
                                </div>
                            )}

                            <MiniBoard
                                playerName={player.name}
                                puzzleString={puzzleString}
                                liveInput={player.currentBoardString}
                                solutionString={solutionString}
                                showErrors={true}
                                isWinner={playerId === winnerId}
                                finalScore={player.finalScore}
                                completionPercentage={player.completionPercentage || 0}
                            />
                        </div>
                    );
                })}
            </div>

            {/* No Players Message */}
            {playerEntries.length === 0 && (
                <div className="text-center text-white text-2xl font-bold relative z-10">
                    Waiting for players to join the party...
                </div>
            )}

            {/* Leaderboard */}
            {gameStatus === 'finished' && (
                <div className="mt-8 max-w-md mx-auto bg-white/95 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border-4 border-yellow-400 relative z-10">
                    <h2 className="text-3xl font-black text-center mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        🏆 FINAL SCOREBOARD 🏆
                    </h2>
                    <div className="space-y-3">
                        {sortedPlayers.map(([playerId, player], index) => (
                            <div
                                key={playerId}
                                className={`
                  flex items-center justify-between p-4 rounded-xl font-bold text-lg
                  ${playerId === winnerId
                                        ? 'bg-gradient-to-r from-yellow-300 to-orange-300 text-gray-900 ring-4 ring-yellow-500 scale-105'
                                        : 'bg-gradient-to-r from-purple-100 to-pink-100 text-gray-700'}
                `}
                            >
                                <span className="flex items-center gap-3">
                                    <span className="text-2xl font-black">{index + 1}.</span>
                                    {player.name}
                                    {playerId === winnerId && <span className="text-2xl">👑</span>}
                                </span>
                                <span className="font-mono font-black text-xl">
                                    {player.finalScore !== null ? `${player.finalScore}%` : '-'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpectatorDashboard;
