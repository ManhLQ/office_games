import React, { useState, useRef, useEffect } from 'react';
import type { PowerupType, PowerupInventory, ActivePowerup } from '../../types';
import { usePowerup } from '../../services/powerupService';

interface PowerupButtonProps {
    roomCode: string;
    playerId: string;
    inventory: PowerupInventory;
    activePowerup: ActivePowerup | null;
    isGlobalMode: boolean;
    sharedPoolInventory?: PowerupInventory;
    onPowerupUsed?: () => void;
}

// Powerup metadata
const POWERUP_META: Record<
    PowerupType,
    { name: string; icon: string; description: string; color: string }
> = {
    hint: {
        name: 'Hint',
        icon: '💡',
        description: 'Reveals the correct value for one cell',
        color: 'from-yellow-400 to-orange-500',
    },
    fog: {
        name: 'Fog',
        icon: '🌫️',
        description: 'Hide competitors\' boards for 5 seconds',
        color: 'from-gray-400 to-gray-600',
    },
    peep: {
        name: 'Peep',
        icon: '👀',
        description: 'View competitors\' boards for 5 seconds',
        color: 'from-blue-400 to-purple-500',
    },
};

/**
 * PowerupButton Component - Main powerup interface
 */
export const PowerupButton: React.FC<PowerupButtonProps> = ({
    roomCode,
    playerId,
    inventory,
    activePowerup,
    isGlobalMode,
    sharedPoolInventory,
    onPowerupUsed,
}) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const menuRef = useRef<HTMLDivElement>(null);

    // Calculate total available powerups
    const totalPowerups = isGlobalMode
        ? (sharedPoolInventory?.hint || 0) +
        (sharedPoolInventory?.fog || 0) +
        (sharedPoolInventory?.peep || 0)
        : inventory.hint + inventory.fog + inventory.peep;

    const hasNoPowerups = totalPowerups === 0;

    // Update timer for active powerup
    useEffect(() => {
        if (!activePowerup) {
            setTimeRemaining(0);
            return;
        }

        const updateTimer = () => {
            const elapsed = Date.now() - activePowerup.startedAt;
            const remaining = Math.max(0, activePowerup.durationMs - elapsed);
            setTimeRemaining(Math.ceil(remaining / 1000));

            if (remaining <= 0) {
                setTimeRemaining(0);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 100);
        return () => clearInterval(interval);
    }, [activePowerup]);

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };

        if (menuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [menuOpen]);

    const handleUsePowerup = async (type: PowerupType) => {
        try {
            await usePowerup(roomCode, playerId, type, isGlobalMode);
            setMenuOpen(false);
            onPowerupUsed?.();
        } catch (error) {
            console.error('Failed to use powerup:', error);
            alert('Failed to use powerup');
        }
    };

    const getAvailableCount = (type: PowerupType): number => {
        return isGlobalMode
            ? sharedPoolInventory?.[type] || 0
            : inventory[type] || 0;
    };

    return (
        <div className="relative" ref={menuRef}>
            {/* Main Button */}
            <button
                onClick={() => setMenuOpen(!menuOpen)}
                disabled={hasNoPowerups}
                className={`
          relative px-4 py-2 rounded-lg font-bold text-white shadow-lg transition-all
          ${hasNoPowerups
                        ? 'bg-gray-400 cursor-not-allowed opacity-50'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:scale-105'
                    }
        `}
            >
                <span className="flex items-center gap-2">
                    <span className="text-xl">⚡</span>
                    <span>Powerups</span>
                    {totalPowerups > 0 && (
                        <span className="bg-white text-purple-600 px-2 py-0.5 rounded-full text-sm font-black">
                            {totalPowerups}
                        </span>
                    )}
                </span>

                {/* Active powerup timer overlay */}
                {activePowerup && timeRemaining > 0 && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <span className="text-white font-black text-lg">{timeRemaining}s</span>
                    </div>
                )}
            </button>

            {/* Powerup Menu */}
            {menuOpen && (
                <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-2xl p-4 min-w-[280px] z-50 border-2 border-purple-200">
                    <div className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide">
                        Select Powerup
                    </div>

                    {activePowerup && (
                        <div className="mb-3 p-2 bg-yellow-100 border border-yellow-300 rounded-lg text-sm text-yellow-800">
                            ⚠️ Powerup already active
                        </div>
                    )}

                    <div className="space-y-2">
                        {(['hint', 'fog', 'peep'] as PowerupType[]).map((type) => {
                            const count = getAvailableCount(type);
                            const meta = POWERUP_META[type];
                            const canUse = count > 0 && !activePowerup;

                            return (
                                <button
                                    key={type}
                                    onClick={() => canUse && handleUsePowerup(type)}
                                    disabled={!canUse}
                                    className={`
                    w-full p-3 rounded-lg transition-all text-left
                    ${canUse
                                            ? `bg-gradient-to-r ${meta.color} text-white hover:scale-105 shadow-md`
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }
                  `}
                                    title={meta.description}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{meta.icon}</span>
                                            <div>
                                                <div className="font-bold">{meta.name}</div>
                                                <div className="text-xs opacity-90">{meta.description}</div>
                                            </div>
                                        </div>
                                        <span className="font-black text-lg">×{count}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PowerupButton;
