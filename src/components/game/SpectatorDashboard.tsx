import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MiniBoard } from './MiniBoard';
import { terminateGame, deleteRoom } from '../../services/roomService';
import type { Players, PowerupType } from '../../types';

// Powerup metadata
const POWERUP_META: Record<PowerupType, { name: string; icon: string }> = {
    hint: { name: 'Hint', icon: '💡' },
    fog: { name: 'Fog', icon: '🌫️' },
    peep: { name: 'Peep', icon: '👀' },
};

interface SpectatorDashboardProps {
    players: Players;
    puzzleString: string;
    solutionString: string;
    winnerId: string | null;
    gameStatus: 'waiting' | 'playing' | 'finished';
    startTime: number | null;
    isAdmin?: boolean;
    roomCode?: string;
    timeLimit?: number; // in minutes
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
    isAdmin = false,
    roomCode = '',
    timeLimit = 15,
}) => {
    const navigate = useNavigate();
    const playerEntries = Object.entries(players);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isTerminating, setIsTerminating] = useState(false);

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

    // Auto-terminate when time limit is reached
    useEffect(() => {
        if (gameStatus === 'playing' && startTime && roomCode) {
            const timeLimitMs = timeLimit * 60 * 1000;
            const elapsedMs = Date.now() - startTime;

            if (elapsedMs >= timeLimitMs) {
                terminateGame(roomCode);
            }
        }
    }, [gameStatus, startTime, timeLimit, roomCode, elapsedTime]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleTerminateGame = async () => {
        if (!roomCode || isTerminating) return;

        if (confirm('Are you sure you want to terminate the game? This will end the game for all players.')) {
            setIsTerminating(true);
            try {
                await terminateGame(roomCode);
            } catch (error) {
                console.error('Error terminating game:', error);
                alert('Failed to terminate game');
                setIsTerminating(false);
            }
        }
    };

    const handleGoHome = async () => {
        if (!roomCode) return;

        if (confirm('Delete all game data and return to home? This action cannot be undone.')) {
            try {
                await deleteRoom(roomCode);
                navigate('/');
            } catch (error) {
                console.error('Error deleting room:', error);
                alert('Failed to delete room');
            }
        }
    };

    const timeLimitSeconds = timeLimit * 60;
    const remainingSeconds = Math.max(0, timeLimitSeconds - elapsedTime);

    const sortedPlayers = [...playerEntries].sort(([idA, playerA], [idB, playerB]) => {
        if (idA === winnerId) return -1;
        if (idB === winnerId) return 1;
        if (playerA.finalScore !== null && playerB.finalScore !== null) {
            return playerB.finalScore - playerA.finalScore;
        }
        return 0;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-teal-100 to-rose-100 p-6 relative overflow-hidden">
            {/* Animated background bubbles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                <div className="absolute top-20 left-20 w-64 h-64 bg-cyan-300 rounded-full blur-3xl"></div>
                <div className="absolute bottom-40 right-10 w-80 h-80 bg-rose-300 rounded-full blur-3xl"></div>
                <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-teal-300 rounded-full blur-3xl"></div>
            </div>

            {/* Header */}
            <div className="text-center mb-6 relative z-10">
                <div className="text-5xl mb-4">🎮</div>
                <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-cyan-600 via-teal-600 to-rose-600 bg-clip-text text-transparent mb-4">
                    SUDOKU BATTLE
                </h1>

                {/* Timer - HUGE display */}
                {gameStatus === 'playing' && (
                    <div className="space-y-3">
                        <div className="inline-block bg-white/95 backdrop-blur-sm px-10 py-5 rounded-2xl border-2 border-cyan-300 shadow-xl">
                            <div className={`text-5xl md:text-6xl font-black ${remainingSeconds <= 60
                                ? 'text-rose-600 animate-pulse'
                                : 'bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent'
                                }`}>
                                ⏱️ {formatTime(remainingSeconds)}
                            </div>
                        </div>

                        {/* Admin Controls - Terminate Button */}
                        {isAdmin && (
                            <div className="mt-4">
                                <button
                                    onClick={handleTerminateGame}
                                    disabled={isTerminating}
                                    className="px-8 py-4 bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white font-bold text-lg rounded-xl shadow-lg transition-all disabled:cursor-not-allowed"
                                >
                                    {isTerminating ? 'TERMINATING...' : 'Terminate Game'}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="text-xl md:text-2xl font-bold text-slate-700">
                    {gameStatus === 'waiting' && 'Get Ready!'}
                    {gameStatus === 'playing' && 'Game in Progress'}
                    {gameStatus === 'finished' && `Game Over - Time: ${formatTime(elapsedTime)}`}
                </div>
            </div>

            {/* Winner Announcement */}
            {gameStatus === 'finished' && winnerId && players[winnerId] && (
                <div className="text-center mb-8 relative z-10">
                    <div className="text-6xl md:text-7xl font-black text-rose-500 mb-4">
                        🏆 {players[winnerId].name.toUpperCase()} 🏆
                    </div>
                    <div className="text-4xl font-black bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                        WINNER!
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
                        // eslint-disable-next-line react-hooks/purity
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
                                    absolute -top-3 -right-3 z-20 px-3 py-1.5 rounded-full shadow-md
                                    ${powerupDisplay.type === 'hint' ? 'bg-amber-500' : powerupDisplay.type === 'fog' ? 'bg-slate-500' : 'bg-cyan-500'}
                                    text-white font-bold flex items-center gap-2 border-2 border-white text-sm
                                `}>
                                    <span className="text-lg">{powerupDisplay.icon}</span>
                                    <span className="text-xs uppercase">{powerupDisplay.type}</span>
                                    {powerupDisplay.remaining !== null && (
                                        <span className="text-xs">{powerupDisplay.remaining}s</span>
                                    )}
                                </div>
                            )}

                            <MiniBoard
                                playerName={player.name}
                                puzzleString={puzzleString}
                                liveInput={player.currentGameState || player.currentBoardString || puzzleString}
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
                <div className="mt-8 max-w-md mx-auto bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-cyan-200 relative z-10">
                    <h2 className="text-2xl font-black text-center mb-4 bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                        🏆 Final Scoreboard
                    </h2>
                    <div className="space-y-3">
                        {sortedPlayers.map(([playerId, player]) => (
                            <div
                                key={playerId}
                                className={`
                  flex items-center justify-between p-3 rounded-lg font-semibold
                  ${playerId === winnerId
                                        ? 'bg-gradient-to-r from-rose-50 to-pink-100 text-slate-900 ring-2 ring-rose-400'
                                        : 'bg-slate-50 text-slate-700 border border-slate-200'}
                `}
                            >
                                <div
                                    className="relative p-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                                >
                                    {/* Player Name with Active Powerup */}
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="text-sm font-bold text-gray-700">
                                            {player.name}
                                            {winnerId === playerId && (
                                                <span className="ml-1 text-yellow-500">👑</span>
                                            )}
                                        </div>
                                        {/* Active Powerup Indicator */}
                                        {player.powerups?.activePowerup && (() => {
                                            const powerup = player.powerups.activePowerup;
                                            const elapsed = Date.now() - powerup.startedAt;
                                            const remaining = Math.max(0, powerup.durationMs - elapsed);
                                            const remainingSeconds = Math.ceil(remaining / 1000);

                                            if (remaining > 0) {
                                                const meta = POWERUP_META[powerup.type];
                                                return (
                                                    <div className="flex items-center gap-1 bg-purple-100 px-2 py-1 rounded-full border-2 border-purple-400 animate-pulse">
                                                        <span className="text-lg">{meta.icon}</span>
                                                        <span className="text-xs font-bold text-purple-700">{remainingSeconds}s</span>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>
                                </div>
                                <span className="font-mono font-black text-xl">
                                    {player.finalScore !== null ? `${player.finalScore}%` : '-'}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Admin Go Home Button */}
                    {isAdmin && (
                        <button
                            onClick={handleGoHome}
                            className="mt-6 w-full px-8 py-4 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white font-bold text-xl rounded-xl shadow-lg transition-all"
                        >
                            🏠 GO HOME
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default SpectatorDashboard;
