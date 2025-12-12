import React, { useState } from 'react';
import { joinRoom } from '../../services/roomService';
import { isValidRoomCode } from '../../utils/room';

interface JoinRoomProps {
    onRoomJoined: (roomCode: string, playerId: string, playerName: string) => void;
    initialRoomCode?: string;
}

/**
 * JoinRoom Component - Party-themed room joining
 */
export const JoinRoom: React.FC<JoinRoomProps> = ({ onRoomJoined, initialRoomCode = '' }) => {
    const [roomCode, setRoomCode] = useState(initialRoomCode);
    // Generate random player name on mount
    const [playerName, setPlayerName] = useState(() => {
        const randomNum = Math.floor(Math.random() * 999) + 1;
        return `Player ${randomNum}`;
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleJoinRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!roomCode.trim()) {
            setError('Please enter a room code');
            return;
        }
        if (!isValidRoomCode(roomCode)) {
            setError('Invalid room code format');
            return;
        }
        if (!playerName.trim()) {
            setError('Please enter your name');
            return;
        }
        if (playerName.trim().length > 20) {
            setError('Name must be 20 characters or less');
            return;
        }

        setIsLoading(true);

        try {
            const formattedCode = roomCode.toUpperCase().trim();
            const playerId = await joinRoom(formattedCode, playerName.trim());
            onRoomJoined(formattedCode, playerId, playerName.trim());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to join room');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md w-full mx-auto p-8 bg-gradient-to-br from-white via-cyan-50 to-teal-50 rounded-2xl shadow-xl border border-cyan-200">
            <div className="text-center mb-6">
                <div className="text-4xl mb-3">🎮</div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                    Join Game
                </h2>
            </div>

            <form onSubmit={handleJoinRoom} className="space-y-6">
                {/* Room Code Input */}
                <div>
                    <label
                        htmlFor="roomCode"
                        className="block text-base font-semibold text-slate-700 mb-2"
                    >
                        Room Code
                    </label>
                    <input
                        type="text"
                        id="roomCode"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        placeholder="ENTER CODE"
                        maxLength={8}
                        className="w-full px-6 py-4 text-center text-2xl font-black tracking-widest
                       bg-white
                       border-2 border-cyan-300 rounded-xl
                       focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200
                       transition-all duration-200 uppercase shadow-sm"
                    />
                </div>

                {/* Player Name Input */}
                <div>
                    <label
                        htmlFor="playerName"
                        className="block text-base font-semibold text-slate-700 mb-2"
                    >
                        Your Name
                    </label>
                    <input
                        type="text"
                        id="playerName"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Enter your name"
                        maxLength={20}
                        className="w-full px-6 py-3 text-lg font-semibold text-center
                       bg-white
                       border-2 border-cyan-300 rounded-xl
                       focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200
                       transition-all duration-200 shadow-sm"
                    />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-4 bg-red-100 border-2 border-red-400 text-red-700 rounded-xl font-bold text-center">
                        ⚠️ {error}
                    </div>
                )}

                {/* Join Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`
            w-full py-4 rounded-xl font-bold text-lg text-white
            transition-all duration-200
            ${isLoading
                            ? 'bg-slate-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-lg hover:shadow-xl'}
          `}
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Joining...
                        </span>
                    ) : (
                        <span>
                            Join Game
                        </span>
                    )}
                </button>
            </form>
        </div>
    );
};

export default JoinRoom;
