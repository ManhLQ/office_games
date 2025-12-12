import React, { useState } from 'react';
import type { Difficulty } from '../../types';
import { createRoom } from '../../services/roomService';

interface CreateRoomProps {
    onRoomCreated: (roomCode: string, adminId: string) => void;
}

/**
 * CreateRoom Component - Party-themed room creation
 */
export const CreateRoom: React.FC<CreateRoomProps> = ({ onRoomCreated }) => {
    const [difficulty, setDifficulty] = useState<Difficulty>('medium');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreateRoom = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const { roomCode, adminId } = await createRoom(difficulty);
            onRoomCreated(roomCode, adminId);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create room');
        } finally {
            setIsLoading(false);
        }
    };

    const difficulties: { value: Difficulty; label: string; emoji: string; gradient: string }[] = [
        { value: 'easy', label: 'Easy Breezy', emoji: '🌈', gradient: 'from-green-400 to-emerald-500' },
        { value: 'medium', label: 'Party Mode', emoji: '🎉', gradient: 'from-yellow-400 to-orange-500' },
        { value: 'hard', label: 'Challenge!', emoji: '🔥', gradient: 'from-orange-500 to-red-500' },
        { value: 'expert', label: 'EPIC Boss', emoji: '⚡', gradient: 'from-purple-500 to-pink-600' },
    ];

    return (
        <div className="max-w-md w-full mx-auto p-8 bg-gradient-to-br from-white via-pink-50 to-purple-50 rounded-3xl shadow-2xl border-4 border-pink-300">
            <div className="text-center mb-6">
                <div className="text-5xl mb-3">🎮✨</div>
                <h2 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    CREATE PARTY!
                </h2>
            </div>

            {/* Difficulty Selection */}
            <div className="mb-6">
                <label className="block text-lg font-black text-gray-700 mb-4 text-center">
                    🎯 Choose Your Challenge Level
                </label>
                <div className="grid grid-cols-2 gap-4">
                    {difficulties.map(({ value, label, emoji, gradient }) => (
                        <button
                            key={value}
                            onClick={() => setDifficulty(value)}
                            className={`
                p-5 rounded-2xl font-bold text-lg transition-all duration-300 transform
                ${difficulty === value
                                    ? `bg-gradient-to-br ${gradient} text-white ring-4 ring-offset-2 ring-yellow-400 scale-110 shadow-xl`
                                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md hover:scale-105'}
              `}
                        >
                            <span className="text-3xl block mb-2">{emoji}</span>
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-4 bg-red-100 border-2 border-red-400 text-red-700 rounded-xl font-bold">
                    ⚠️ {error}
                </div>
            )}

            {/* Create Button */}
            <button
                onClick={handleCreateRoom}
                disabled={isLoading}
                className={`
          w-full py-5 rounded-2xl font-black text-2xl text-white
          transition-all duration-300 transform
          ${isLoading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 shadow-2xl hover:shadow-pink-500/50 hover:scale-105'}
        `}
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Creating Party...
                    </span>
                ) : (
                    <span className="flex items-center justify-center gap-3">
                        <span className="text-3xl">🎊</span>
                        START PARTY
                        <span className="text-3xl">🎉</span>
                    </span>
                )}
            </button>
        </div>
    );
};

export default CreateRoom;
