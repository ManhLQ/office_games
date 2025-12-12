import React, { useState } from 'react';
import type { Difficulty, PowerupConfig, PowerupType } from '../../types';
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

    // Powerup configuration state
    const [powerupsEnabled, setPowerupsEnabled] = useState(false);
    const [powerupMode, setPowerupMode] = useState<PowerupConfig['mode']>('fixed_per_player');
    const [maxPowerups, setMaxPowerups] = useState(3);
    const [selectedPowerups, setSelectedPowerups] = useState<PowerupType[]>([]);

    const handleCreateRoom = async () => {
        setIsLoading(true);
        setError(null);

        try {
            let powerupConfig: PowerupConfig | undefined;

            if (powerupsEnabled) {
                powerupConfig = {
                    enabled: true,
                    mode: powerupMode,
                    maxPowerupsPerEntity: maxPowerups,
                    perTypeMax: 2,
                    ...(powerupMode === 'fixed' || powerupMode === 'fixed_per_player'
                        ? { fixedList: selectedPowerups }
                        : { pool: ['hint', 'fog', 'peep'] }),
                };
            }

            const { roomCode, adminId } = await createRoom(difficulty, powerupConfig);
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
        <div className="max-w-2xl w-full mx-auto p-8 bg-gradient-to-br from-white via-pink-50 to-purple-50 rounded-3xl shadow-2xl border-4 border-pink-300 max-h-[90vh] overflow-y-auto">
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

            {/* Powerup Configuration */}
            <div className="mb-6">
                <label className="flex items-center gap-2 mb-4 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={powerupsEnabled}
                        onChange={(e) => setPowerupsEnabled(e.target.checked)}
                        className="w-5 h-5 rounded accent-purple-600"
                    />
                    <span className="text-lg font-black text-gray-700">
                        ⚡ Enable Powerups
                    </span>
                </label>

                {powerupsEnabled && (
                    <div className="space-y-4 pl-2 border-l-4 border-purple-300">
                        <div className="text-xs text-gray-500 italic">
                            Each player will get their own powerups (not shared)
                        </div>

                        {/* Max Powerups */}
                        <div>
                            <div className="text-sm font-bold text-gray-600 mb-2">
                                Powerups per Player: {maxPowerups}
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                value={maxPowerups}
                                onChange={(e) => setMaxPowerups(parseInt(e.target.value))}
                                className="w-full accent-purple-600"
                            />
                        </div>

                        {/* Powerup Selection (for fixed modes) */}
                        {(powerupMode === 'fixed' || powerupMode === 'fixed_per_player') && (
                            <div>
                                <div className="text-sm font-bold text-gray-600 mb-2">
                                    Select Powerups ({selectedPowerups.length}/{maxPowerups})
                                </div>
                                <div className="space-y-3">
                                    {(['hint', 'fog', 'peep'] as PowerupType[]).map((type) => {
                                        const count = selectedPowerups.filter((p) => p === type).length;
                                        const icons = { hint: '💡', fog: '🌫️', peep: '👀' };
                                        const names = { hint: 'Hint', fog: 'Fog', peep: 'Peep' };
                                        const colors = {
                                            hint: 'from-yellow-400 to-orange-500',
                                            fog: 'from-gray-400 to-gray-600',
                                            peep: 'from-blue-400 to-purple-500',
                                        };

                                        const handleCountChange = (newCount: number) => {
                                            // Remove all instances of this type
                                            const withoutType = selectedPowerups.filter((p) => p !== type);
                                            // Add the new count
                                            const newSelection = [...withoutType, ...Array(newCount).fill(type)];

                                            // Only update if within total limit
                                            if (newSelection.length <= maxPowerups) {
                                                setSelectedPowerups(newSelection);
                                            }
                                        };

                                        return (
                                            <div
                                                key={type}
                                                className={`
                                                    flex items-center gap-3 p-3 rounded-lg border-2 transition-all
                                                    ${count > 0 ? 'border-purple-400 bg-purple-50' : 'border-gray-300 bg-white'}
                                                `}
                                            >
                                                {/* Powerup Icon & Name */}
                                                <div className={`
                                                    flex items-center gap-2 flex-1 px-3 py-2 rounded-lg text-white font-bold
                                                    bg-gradient-to-r ${colors[type]}
                                                `}>
                                                    <span className="text-2xl">{icons[type]}</span>
                                                    <span className="text-sm">{names[type]}</span>
                                                </div>

                                                {/* Number Input */}
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="2"
                                                    value={count}
                                                    onChange={(e) => {
                                                        const newCount = Math.max(0, Math.min(2, parseInt(e.target.value) || 0));
                                                        handleCountChange(newCount);
                                                    }}
                                                    className="w-16 px-3 py-2 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-300"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                                {selectedPowerups.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setSelectedPowerups([])}
                                        className="mt-3 text-sm text-red-600 hover:text-red-700 font-semibold"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Error Message */}
            {
                error && (
                    <div className="mb-4 p-4 bg-red-100 border-2 border-red-400 text-red-700 rounded-xl font-bold">
                        ⚠️ {error}
                    </div>
                )
            }

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
        </div >
    );
};

export default CreateRoom;
