import React, { useState } from 'react';
import type { Difficulty, PowerupConfig, PowerupType } from '../../types';
import { createRoom } from '../../services/roomService';
import { gameRegistry } from '../../games/core/GameRegistry';

interface CreateRoomProps {
    onRoomCreated: (roomCode: string, adminId: string) => void;
}

/**
 * CreateRoom Component - Party-themed room creation
 */
export const CreateRoom: React.FC<CreateRoomProps> = ({ onRoomCreated }) => {
    const [difficulty, setDifficulty] = useState<Difficulty>('medium');
    const [gameId, setGameId] = useState<string>('sudoku');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Powerup configuration state
    const [powerupsEnabled, setPowerupsEnabled] = useState(false);
    const [powerupMode, setPowerupMode] = useState<PowerupConfig['mode']>('fixed_per_player');
    const [maxPowerups, setMaxPowerups] = useState(3);
    const [selectedPowerups, setSelectedPowerups] = useState<PowerupType[]>([]);

    // Advanced settings state
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [timeLimit, setTimeLimit] = useState(15); // Default 15 minutes

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
                    fixedList: selectedPowerups,
                };
            }

            const { roomCode, adminId } = await createRoom(difficulty, gameId, powerupConfig, timeLimit);
            onRoomCreated(roomCode, adminId);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create room');
        } finally {
            setIsLoading(false);
        }
    };

    const difficulties: { value: Difficulty; label: string; color: string }[] = [
        { value: 'easy', label: 'Easy', color: 'emerald' },
        { value: 'medium', label: 'Medium', color: 'cyan' },
        { value: 'hard', label: 'Hard', color: 'rose' },
        { value: 'expert', label: 'Expert', color: 'pink' },
    ];

    return (
        <div className="max-w-2xl w-full mx-auto p-8 bg-gradient-to-br from-white via-cyan-50 to-teal-50 rounded-2xl shadow-xl border border-cyan-200 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
                <div className="text-4xl mb-3">🎮</div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                    Create Game
                </h2>
            </div>

            {/* Difficulty Selection */}
            <div className="mb-6">
                <label className="block text-base font-semibold text-slate-700 mb-4">
                    Difficulty Level
                </label>
                <div className="grid grid-cols-2 gap-4">
                    {difficulties.map(({ value, label, color }) => (
                        <button
                            key={value}
                            onClick={() => setDifficulty(value)}
                            className={`
                p-4 rounded-xl font-semibold text-base transition-all duration-200
                ${difficulty === value
                                    ? `bg-${color}-600 text-white ring-2 ring-${color}-600 shadow-lg`
                                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'}
              `}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Game Selection */}
            <div className="mb-6">
                <label className="block text-base font-semibold text-slate-700 mb-4">
                    Select Game
                </label>
                <div className="grid grid-cols-2 gap-4">
                    {gameRegistry.getAll().map((game) => (
                        <button
                            key={game.id}
                            onClick={() => setGameId(game.id)}
                            className={`
                p-4 rounded-xl font-semibold text-base transition-all duration-200
                ${gameId === game.id
                                    ? 'bg-teal-600 text-white ring-2 ring-teal-600 shadow-lg'
                                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'}
              `}
                        >
                            {game.name}
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
                    <span className="text-base font-semibold text-slate-700">
                        Enable Powerups
                    </span>
                </label>

                {powerupsEnabled && (
                    <div className="space-y-4 pl-2 border-l-4 border-purple-300">
                        {/* Powerup Mode Selection */}
                        <div>
                            <div className="text-sm font-bold text-gray-600 mb-2">
                                Powerup Mode
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { value: 'random' as const, label: 'Random (Shared)', desc: 'Random pool shared by all' },
                                    { value: 'fixed' as const, label: 'Fixed (Shared)', desc: 'Admin picks, shared pool' },
                                    { value: 'random_per_player' as const, label: 'Random (Per Player)', desc: 'Random per player' },
                                    { value: 'fixed_per_player' as const, label: 'Fixed (Per Player)', desc: 'Admin picks per player' },
                                ].map(({ value, label, desc }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setPowerupMode(value)}
                                        className={`
                                            p-3 rounded-lg text-xs font-bold transition-all border-2
                                            ${powerupMode === value
                                                ? 'bg-purple-600 text-white border-purple-600'
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'}
                                        `}
                                        title={desc}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Max Powerups */}
                        <div>
                            <div className="text-sm font-bold text-gray-600 mb-2">
                                Powerups per {powerupMode.includes('per_player') ? 'Player' : 'Game'}: {maxPowerups}
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

                        {/* Powerup Selection - Only for Fixed Modes */}
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

            {/* Advanced Settings */}
            <div className="mb-6">
                <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-semibold text-sm transition-colors"
                >
                    <span className="text-lg">{showAdvanced ? '▼' : '▶'}</span>
                    <span>Advanced Settings</span>
                </button>

                {showAdvanced && (
                    <div className="mt-4 p-4 bg-white/60 rounded-lg border-2 border-gray-200">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-bold text-gray-700">
                                    ⏱️ Game Time Limit
                                </label>
                                <span className="text-lg font-black text-purple-600">{timeLimit} min</span>
                            </div>
                            <input
                                type="range"
                                min="5"
                                max="60"
                                value={timeLimit}
                                onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                                className="w-full accent-purple-600"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>5 min</span>
                                <span>60 min</span>
                            </div>
                        </div>
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
          w-full py-4 rounded-xl font-bold text-lg text-white
          transition-all duration-200
          ${isLoading
                        ? 'bg-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 shadow-lg hover:shadow-xl'}
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
                    <span className="flex items-center justify-center gap-2">
                        Create Room
                    </span>
                )}
            </button>
        </div >
    );
};

export default CreateRoom;
