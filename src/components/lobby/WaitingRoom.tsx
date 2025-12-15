import React from 'react';
import type { Players } from '../../types';
import { updateRoomStatus } from '../../services/roomService';

interface WaitingRoomProps {
    roomCode: string;
    players: Players;
    isAdmin: boolean;
    playerId?: string; // For server-side validation
}

/**
 * WaitingRoom Component - Pre-game lobby with party vibe
 */
export const WaitingRoom: React.FC<WaitingRoomProps> = ({
    roomCode,
    players,
    isAdmin,
    playerId,
}) => {
    const playerList = Object.values(players);
    const canStart = playerList.length >= 2;

    const handleStartGame = async () => {
        try {
            // Pass playerId for server-side admin validation
            await updateRoomStatus(roomCode, 'playing', playerId);
        } catch (error) {
            console.error('Failed to start game:', error);
            alert(error instanceof Error ? error.message : 'Failed to start game');
        }
    };

    return (
        <div className="max-w-lg w-full mx-auto p-8 bg-gradient-to-br from-white via-cyan-50 to-teal-50 rounded-2xl shadow-xl border border-cyan-200">
            <div className="text-center mb-8">
                <div className="text-3xl mb-3">🎮</div>
                <p className="text-sm font-semibold text-slate-600 mb-2">Room Code</p>
                <div className="text-5xl font-black bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent py-3 tracking-widest">
                    {roomCode}
                </div>
                <p className="text-sm font-medium text-slate-500 mt-2">
                    Share this code to join
                </p>
            </div>

            {/* Players List */}
            <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-700 mb-4">
                    Players ({playerList.length}/4)
                </h3>
                <div className="space-y-3">
                    {playerList.map((player, index) => (
                        <div
                            key={index}
                            className="flex items-center p-4 bg-cyan-50 rounded-lg border border-cyan-200 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow">
                                {player.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="ml-4 font-semibold text-slate-800">
                                {player.name}
                            </span>
                            <span className="ml-auto text-emerald-600 font-semibold flex items-center gap-1">
                                ✓ Ready
                            </span>
                        </div>
                    ))}

                    {/* Empty Slots */}
                    {Array.from({ length: 4 - playerList.length }).map((_, index) => (
                        <div
                            key={`empty-${index}`}
                            className="flex items-center p-4 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300"
                        >
                            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 text-xl">
                                ?
                            </div>
                            <span className="ml-4 text-slate-400 italic text-sm">
                                Waiting for player...
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Start Button (Admin only) */}
            {isAdmin && (
                <button
                    onClick={handleStartGame}
                    disabled={!canStart}
                    className={`
            w-full py-4 rounded-xl font-bold text-lg text-white
            transition-all duration-200
            ${canStart
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg hover:shadow-xl'
                            : 'bg-slate-400 cursor-not-allowed opacity-50'}
          `}
                >
                    {canStart ? (
                        'Start Game'
                    ) : (
                        'Need at least 2 players to start'
                    )}
                </button>
            )}

            {/* Waiting Message (Players) */}
            {!isAdmin && (
                <div className="text-center py-5 bg-cyan-50 rounded-xl border border-cyan-200">
                    <div className="flex items-center justify-center gap-2 text-slate-600 font-medium">
                        <div className="flex gap-1">
                            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                            <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                        <span>Waiting for host to start...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WaitingRoom;
