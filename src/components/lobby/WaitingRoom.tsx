import React from 'react';
import type { Players } from '../../types';
import { updateRoomStatus } from '../../services/roomService';

interface WaitingRoomProps {
    roomCode: string;
    players: Players;
    isAdmin: boolean;
}

/**
 * WaitingRoom Component - Pre-game lobby with party vibe
 */
export const WaitingRoom: React.FC<WaitingRoomProps> = ({
    roomCode,
    players,
    isAdmin,
}) => {
    const playerList = Object.values(players);
    const canStart = playerList.length >= 2;

    const handleStartGame = async () => {
        await updateRoomStatus(roomCode, 'playing');
    };

    return (
        <div className="max-w-lg w-full mx-auto p-8 bg-gradient-to-br from-white via-yellow-50 to-orange-50 rounded-3xl shadow-2xl border-4 border-yellow-400">
            {/* Room Code Display */}
            <div className="text-center mb-8">
                <div className="text-4xl mb-3">🎊 🎉 🎈</div>
                <p className="text-sm font-bold text-orange-600 mb-2">PARTY ROOM CODE</p>
                <div className="text-6xl font-black tracking-widest bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent py-4 drop-shadow-lg">
                    {roomCode}
                </div>
                <p className="text-sm font-bold text-pink-600 mt-2 animate-pulse">
                    ✨ Share this code to join the fun! ✨
                </p>
            </div>

            {/* Players List */}
            <div className="mb-8">
                <h3 className="text-xl font-black text-gray-700 mb-4 flex items-center gap-2">
                    <span className="text-2xl">👥</span>
                    Players Ready ({playerList.length}/4)
                </h3>
                <div className="space-y-3">
                    {playerList.map((player, index) => (
                        <div
                            key={index}
                            className="flex items-center p-4 bg-gradient-to-r from-cyan-100 via-blue-100 to-purple-100 rounded-xl border-2 border-blue-300 shadow-md transform hover:scale-105 transition-transform"
                        >
                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg">
                                {player.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="ml-4 font-bold text-gray-800 text-lg">
                                {player.name}
                            </span>
                            <span className="ml-auto text-green-600 text-lg font-black flex items-center gap-1">
                                <span className="text-2xl">✓</span>
                                READY!
                            </span>
                        </div>
                    ))}

                    {/* Empty Slots */}
                    {Array.from({ length: 4 - playerList.length }).map((_, index) => (
                        <div
                            key={`empty-${index}`}
                            className="flex items-center p-4 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 opacity-60"
                        >
                            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 text-2xl">
                                ?
                            </div>
                            <span className="ml-4 text-gray-500 italic">
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
            w-full py-5 rounded-2xl font-black text-2xl text-white
            transition-all duration-300 transform
            ${canStart
                            ? 'bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 hover:from-green-500 hover:via-emerald-600 hover:to-teal-600 shadow-2xl hover:shadow-green-500/50 hover:scale-105 animate-pulse'
                            : 'bg-gray-400 cursor-not-allowed opacity-50'}
          `}
                >
                    {canStart ? (
                        <span className="flex items-center justify-center gap-3">
                            <span className="text-3xl">🚀</span>
                            START THE PARTY!
                            <span className="text-3xl">🎉</span>
                        </span>
                    ) : (
                        'Need at least 2 players to start'
                    )}
                </button>
            )}

            {/* Waiting Message (Players) */}
            {!isAdmin && (
                <div className="text-center py-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl border-2 border-purple-300">
                    <div className="flex items-center justify-center gap-2 text-purple-700 font-bold text-lg">
                        <div className="flex gap-1">
                            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                            <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                        <span>Waiting for host to start the game...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WaitingRoom;
