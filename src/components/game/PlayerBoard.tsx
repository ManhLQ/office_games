import React, { useState, useCallback, useMemo } from 'react';
import { useDebouncedCallback } from '../../hooks/useDebounce';
import {
    stringToGrid,
    gridToString,
    isCellEditable,
    validateBoard,
    getCompletionPercentage,
} from '../../utils/sudoku';
import { updatePlayerBoard, submitAnswer, updatePlayerCompletion } from '../../services/roomService';
import { clearActivePowerup, usePowerup } from '../../services/powerupService';
import { getHintCell } from '../../utils/powerupEffects';
import type { Players, PowerupInventory, SharedPowerupPool, PowerupType } from '../../types';
import { MiniBoard } from './MiniBoard';

interface PlayerBoardProps {
    puzzleString: string;
    solutionString: string;
    initialBoard: string;
    roomCode: string;
    playerId: string;
    playerName: string;
    players: Players;
    gameStartTime: number; // timestamp when game started
    timeLimit: number; // game time limit in minutes
    powerupInventory?: PowerupInventory;
    sharedPowerupPool?: SharedPowerupPool;
    isGlobalMode?: boolean;
    onGameEnd: (isWinner: boolean, score: number) => void;
}

// Powerup metadata
const POWERUP_META: Record<PowerupType, { name: string; icon: string; color: string }> = {
    hint: { name: 'Hint', icon: '💡', color: 'bg-gradient-to-r from-yellow-400 to-orange-500' },
    fog: { name: 'Fog', icon: '🌫️', color: 'bg-gradient-to-r from-gray-400 to-gray-600' },
    peep: { name: 'Peep', icon: '👀', color: 'bg-gradient-to-r from-blue-400 to-purple-500' },
};

/**
 * PlayerBoard Component - The main controller for player's Sudoku input
 * 
 * Features:
 * - Grays out numbers that have 9 instances filled
 * - Highlights row/col on hover
 * - Highlights same numbers on click
 * - Reset button to clear user input
 * - Shows completion percentage with periodic updates
 * - Displays competitors' progress
 */
export const PlayerBoard: React.FC<PlayerBoardProps> = React.memo(
    ({
        puzzleString,
        solutionString,
        initialBoard,
        roomCode,
        playerId,
        players,
        gameStartTime,
        timeLimit,
        powerupInventory,
        sharedPowerupPool,
        isGlobalMode = false,
        onGameEnd,
    }) => {
        const [userGrid, setUserGrid] = useState<number[][]>(() =>
            stringToGrid(initialBoard)
        );
        const [selectedCell, setSelectedCell] = useState<{
            row: number;
            col: number;
        } | null>(null);
        const [hoveredCell, setHoveredCell] = useState<{
            row: number;
            col: number;
        } | null>(null);
        const [highlightedNumber, setHighlightedNumber] = useState<number | null>(null);
        const [elapsedTime, setElapsedTime] = useState(0);
        const [currentCompletion, setCurrentCompletion] = useState(0);
        const [hintCell, setHintCell] = useState<{ row: number; col: number; value: number } | null>(null);

        // Calculate remaining time
        const timeLimitMs = timeLimit * 60 * 1000;
        const remainingMs = Math.max(0, timeLimitMs - (elapsedTime * 1000));
        const remainingSeconds = Math.floor(remainingMs / 1000);

        // Timer effect
        React.useEffect(() => {
            const interval = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - gameStartTime) / 1000));
            }, 1000);
            return () => clearInterval(interval);
        }, [gameStartTime]);

        // Completion tracking effect - update every 5 seconds
        React.useEffect(() => {
            const updateCompletion = () => {
                const boardString = gridToString(userGrid);
                const completion = getCompletionPercentage(
                    boardString,
                    puzzleString,
                    solutionString
                );
                setCurrentCompletion(completion);
                updatePlayerCompletion(roomCode, playerId, completion);
            };

            // Initial update
            updateCompletion();

            // Periodic updates every 5 seconds
            const interval = setInterval(updateCompletion, 5000);
            return () => clearInterval(interval);
        }, [userGrid, puzzleString, solutionString, roomCode, playerId]);

        // Monitor active powerup and apply effects
        const player = players[playerId];
        const activePowerup = player?.powerups?.activePowerup;

        React.useEffect(() => {
            if (!activePowerup) {
                setHintCell(null);
                return;
            }

            // Handle hint powerup
            if (activePowerup.type === 'hint') {
                // Get hint cell - use selected cell if available
                const hint = getHintCell(
                    gridToString(userGrid),
                    solutionString,
                    selectedCell || undefined
                );
                setHintCell(hint);

                // Auto-clear after 30 seconds as fallback
                const timeout = setTimeout(() => {
                    clearActivePowerup(roomCode, playerId);
                    setHintCell(null);
                }, 30000);

                return () => clearTimeout(timeout);
            }

            // Auto-clear powerup after duration for Fog/Peep
            if (activePowerup.type === 'fog' || activePowerup.type === 'peep') {
                const timeLeft = activePowerup.durationMs - (Date.now() - activePowerup.startedAt);
                if (timeLeft > 0) {
                    const timeout = setTimeout(() => {
                        clearActivePowerup(roomCode, playerId);
                    }, timeLeft);

                    return () => clearTimeout(timeout);
                }
            }
        }, [activePowerup, roomCode, playerId, solutionString, userGrid]);

        // Clear hint when the hinted cell is filled
        React.useEffect(() => {
            if (hintCell && userGrid[hintCell.row][hintCell.col] !== 0) {
                // User filled the hinted cell, clear the hint and active powerup
                clearActivePowerup(roomCode, playerId);
                setHintCell(null);
            }
        }, [userGrid, hintCell, roomCode, playerId]);

        // Format time as MM:SS
        const formatTime = (seconds: number): string => {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        };

        // Handle powerup usage
        const handleUsePowerup = async (type: PowerupType) => {
            if (activePowerup) {
                alert('A powerup is already active!');
                return;
            }
            try {
                await usePowerup(roomCode, playerId, type, isGlobalMode);
            } catch (error) {
                console.error('Failed to use powerup:', error);
                alert('Failed to use powerup');
            }
        };

        // Get powerup counts
        const getPowerupCount = (type: PowerupType): number => {
            return isGlobalMode
                ? sharedPowerupPool?.inventory?.[type] || 0
                : powerupInventory?.[type] || 0;
        };

        // Get competitors (all players except current player)
        const competitors = useMemo(() => {
            return Object.entries(players)
                .filter(([id]) => id !== playerId)
                .map(([id, player]) => ({ id, ...player }))
                .sort((a, b) => b.completionPercentage - a.completionPercentage);
        }, [players, playerId]);

        // Count occurrences of each number (1-9)
        const numberCounts = useMemo(() => {
            const counts: Record<number, number> = {};
            for (let i = 1; i <= 9; i++) {
                counts[i] = 0;
            }
            userGrid.forEach((row) => {
                row.forEach((cell) => {
                    if (cell >= 1 && cell <= 9) {
                        counts[cell]++;
                    }
                });
            });
            return counts;
        }, [userGrid]);

        // Debounced upload to Firebase (500ms delay as per spec)
        const debouncedUpload = useDebouncedCallback(
            (boardString: string) => {
                updatePlayerBoard(roomCode, playerId, boardString);
            },
            500
        );

        // Handle cell value change
        const handleCellChange = useCallback(
            (row: number, col: number, value: number) => {
                if (!isCellEditable(puzzleString, row, col)) {
                    return;
                }

                setUserGrid((prev) => {
                    const newGrid = prev.map((r) => [...r]);
                    newGrid[row][col] = value;
                    const boardString = gridToString(newGrid);
                    debouncedUpload(boardString);
                    return newGrid;
                });
            },
            [puzzleString, debouncedUpload]
        );

        // Handle cell click - select and highlight same numbers
        const handleCellClick = useCallback((row: number, col: number) => {
            const cellValue = userGrid[row][col];

            // Always set highlighted number based on clicked cell value
            if (cellValue !== 0) {
                setHighlightedNumber(cellValue);
            } else {
                setHighlightedNumber(null);
            }

            // Only allow selection of editable cells for input
            if (isCellEditable(puzzleString, row, col)) {
                setSelectedCell({ row, col });
            } else {
                setSelectedCell(null);
            }
        }, [puzzleString, userGrid]);

        // Handle keyboard input
        const handleKeyDown = useCallback(
            (e: React.KeyboardEvent) => {
                if (!selectedCell) return;

                const { row, col } = selectedCell;
                const key = e.key;

                if (key >= '1' && key <= '9') {
                    const num = parseInt(key, 10);
                    // Only allow if not all 9 are filled
                    if (numberCounts[num] < 9) {
                        handleCellChange(row, col, num);
                    }
                } else if (key === 'Backspace' || key === 'Delete' || key === '0') {
                    handleCellChange(row, col, 0);
                }
            },
            [selectedCell, handleCellChange, numberCounts]
        );

        // Handle reset - clear all user-filled cells
        const handleReset = useCallback(() => {
            if (confirm('Are you sure you want to reset your progress?')) {
                const puzzleGrid = stringToGrid(puzzleString);
                setUserGrid(puzzleGrid);
                const boardString = gridToString(puzzleGrid);
                debouncedUpload(boardString);
                setSelectedCell(null);
                setHighlightedNumber(null);
            }
        }, [puzzleString, debouncedUpload]);

        // Handle submit
        const handleSubmit = useCallback(async () => {
            const currentBoard = gridToString(userGrid);
            const isCorrect = validateBoard(currentBoard, solutionString);

            if (isCorrect) {
                await submitAnswer(roomCode, playerId, true, 100);
                onGameEnd(true, 100);
            } else {
                getCompletionPercentage(currentBoard, puzzleString, solutionString);
                alert('Incorrect! Keep trying.');
            }
        }, [userGrid, solutionString, puzzleString, roomCode, playerId, onGameEnd]);

        return (
            <div
                className="flex flex-col items-center gap-4 p-4"
                onKeyDown={handleKeyDown}
                tabIndex={0}
            >
                {/* Timer, Completion, and Powerups */}
                <div className="flex gap-4 items-center flex-wrap justify-center">
                    <div className={`text-3xl font-mono font-bold text-white px-6 py-2 rounded-lg ${remainingSeconds <= 60 ? 'bg-red-600 animate-pulse' : 'bg-gray-800'
                        }`}>
                        ⏱️ {formatTime(remainingSeconds)}
                    </div>
                    <div className="bg-white px-6 py-2 rounded-lg shadow-lg">
                        <div className="text-sm font-semibold text-gray-600 mb-1">
                            Your Progress
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                                    style={{ width: `${currentCompletion}%` }}
                                />
                            </div>
                            <span className="text-lg font-bold text-gray-800">
                                {currentCompletion}%
                            </span>
                        </div>
                    </div>
                    {/* Powerup Buttons */}
                    {(powerupInventory || sharedPowerupPool) && (
                        <div className="flex gap-2">
                            {Object.entries(POWERUP_META).map(([type, meta]) => {
                                const powerupType = type as PowerupType;
                                const count = getPowerupCount(powerupType);
                                const isActive = activePowerup?.type === powerupType;
                                const isDisabled = count === 0 || isActive;

                                return (
                                    <button
                                        key={type}
                                        onClick={() => handleUsePowerup(powerupType)}
                                        disabled={isDisabled}
                                        className={`
                                            relative flex items-center justify-center w-12 h-12 rounded-full text-2xl
                                            font-bold text-white shadow-md transition-all duration-200
                                            ${meta.color}
                                            ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
                                            ${isActive ? 'ring-4 ring-offset-2 ring-blue-400 animate-pulse' : ''}
                                        `}
                                        title={`${meta.name} (${count} available)`}
                                    >
                                        {meta.icon}
                                        {count > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                                                {count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Competitors Panel */}
                {competitors.length > 0 && (() => {
                    // Check if current player has Peep active (revealing competitors)
                    const hasPeep = activePowerup?.type === 'peep' &&
                        (Date.now() - (activePowerup?.startedAt || 0)) < (activePowerup?.durationMs || 0);

                    if (hasPeep) {
                        // Show actual mini boards of competitors when Peep is active
                        return (
                            <div className="w-full max-w-6xl">
                                <div className="ring-4 ring-blue-400 animate-pulse bg-white/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg">
                                    <div className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">
                                        👀 Peeking at Competitors
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {competitors.map((competitor) => (
                                            <MiniBoard
                                                key={competitor.id}
                                                playerName={competitor.name}
                                                puzzleString={puzzleString}
                                                liveInput={competitor.currentBoardString || puzzleString}
                                                solutionString={solutionString}
                                                showErrors={false}
                                                completionPercentage={competitor.completionPercentage}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    // Normal view: show compact progress bars
                    return (
                        <div className="bg-white/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg w-full max-w-md">
                            <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                                🏁 Competitors
                            </div>
                            <div className="space-y-2">
                                {competitors.map((competitor) => (
                                    <div key={competitor.id} className="flex items-center gap-2">
                                        <div className="flex-1">
                                            <div className="text-sm font-semibold text-gray-700">
                                                {competitor.name}
                                            </div>
                                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                                                    style={{ width: `${competitor.completionPercentage}%` }}
                                                />
                                            </div>
                                        </div>
                                        <span className="text-sm font-bold text-gray-700 min-w-[3rem] text-right">
                                            {competitor.completionPercentage}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })()}

                {/* 9x9 Grid */}
                <div className="relative inline-block">
                    <div className="grid grid-cols-9 gap-0 border-2 border-gray-800 bg-white">
                        {userGrid.map((row, rowIndex) =>
                            row.map((cell, colIndex) => {
                                const isEditable = isCellEditable(puzzleString, rowIndex, colIndex);
                                const isSelected =
                                    selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                                const isHoveredRow = hoveredCell?.row === rowIndex;
                                const isHoveredCol = hoveredCell?.col === colIndex;
                                const isHighlighted = highlightedNumber !== null && cell === highlightedNumber;
                                const borderRight = (colIndex + 1) % 3 === 0 && colIndex < 8;
                                const borderBottom = (rowIndex + 1) % 3 === 0 && rowIndex < 8;
                                const isHintCell = hintCell && hintCell.row === rowIndex && hintCell.col === colIndex;

                                // Determine background color priority
                                let bgColor = isEditable ? 'bg-gray-50' : 'bg-white';
                                if (isHoveredRow || isHoveredCol) bgColor = 'bg-yellow-50';
                                if (isHighlighted) bgColor = 'bg-purple-100';
                                if (isHintCell) bgColor = 'bg-green-200';
                                if (isSelected) bgColor = 'bg-blue-200';

                                return (
                                    <div
                                        key={`${rowIndex}-${colIndex}`}
                                        onClick={() => handleCellClick(rowIndex, colIndex)}
                                        onMouseEnter={() => setHoveredCell({ row: rowIndex, col: colIndex })}
                                        onMouseLeave={() => setHoveredCell(null)}
                                        className={`
                    w-10 h-10 md:w-12 md:h-12 flex items-center justify-center
                    text-lg md:text-xl font-semibold cursor-pointer
                    border border-gray-300
                    ${borderRight ? 'border-r-2 border-r-gray-800' : ''}
                    ${borderBottom ? 'border-b-2 border-b-gray-800' : ''}
                    ${isEditable ? 'text-blue-600' : 'text-gray-900'}
                    ${bgColor}
                    transition-colors duration-100
                  `}
                                    >
                                        {cell !== 0 ? cell : isHintCell && hintCell ? (
                                            <span className="text-green-600 font-black animate-pulse">
                                                {hintCell.value}
                                            </span>
                                        ) : ''}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Fog Overlay on Main Board */}
                    {(() => {
                        // Check if any competitor has Fog active (hiding this player's board)
                        const activeFog = competitors.find(comp => {
                            const fog = comp.powerups?.activePowerup;
                            if (fog?.type === 'fog') {
                                const elapsed = Date.now() - fog.startedAt;
                                return elapsed < fog.durationMs; // Still active
                            }
                            return false;
                        });

                        if (activeFog) {
                            return (
                                <div className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden border-2 border-gray-800 z-10 pointer-events-none">
                                    {/* Layered fog effect with multiple animated clouds */}
                                    <div
                                        className="absolute inset-0 opacity-40"
                                        style={{
                                            background: 'radial-gradient(circle at 20% 30%, rgba(200, 210, 220, 0.9) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(180, 190, 200, 0.8) 0%, transparent 50%)',
                                            animation: 'fog-drift-1 8s ease-in-out infinite alternate'
                                        }}
                                    />
                                    <div
                                        className="absolute inset-0 opacity-50"
                                        style={{
                                            background: 'radial-gradient(circle at 60% 40%, rgba(220, 225, 230, 0.85) 0%, transparent 50%), radial-gradient(circle at 30% 80%, rgba(190, 200, 210, 0.75) 0%, transparent 50%)',
                                            animation: 'fog-drift-2 10s ease-in-out infinite alternate-reverse'
                                        }}
                                    />
                                    <div
                                        className="absolute inset-0 opacity-60"
                                        style={{
                                            background: 'radial-gradient(circle at 50% 50%, rgba(210, 215, 220, 0.9) 0%, transparent 60%)',
                                            animation: 'fog-pulse 6s ease-in-out infinite'
                                        }}
                                    />

                                    {/* Backdrop blur and gradient overlay */}
                                    <div className="absolute inset-0 backdrop-blur-xl bg-gradient-to-br from-gray-200/60 via-gray-300/50 to-gray-400/60" />

                                    {/* Center content */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center drop-shadow-2xl">
                                            <div
                                                className="text-7xl mb-4"
                                                style={{
                                                    animation: 'fog-float 3s ease-in-out infinite',
                                                    filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.8))'
                                                }}
                                            >
                                                🌫️
                                            </div>
                                            <div className="text-3xl font-black text-gray-800 mb-2 tracking-wide" style={{ textShadow: '2px 2px 4px rgba(255,255,255,0.8)' }}>
                                                FOGGED!
                                            </div>
                                            <div className="text-base text-gray-700 font-semibold" style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.6)' }}>
                                                Competitor obscured your view
                                            </div>
                                        </div>
                                    </div>

                                    {/* CSS animations injected via style tag */}
                                    <style dangerouslySetInnerHTML={{
                                        __html: `
                                    @keyframes fog-drift-1 {
                                        0%, 100% { transform: translate(0, 0) scale(1); }
                                        50% { transform: translate(10px, -10px) scale(1.1); }
                                    }
                                    @keyframes fog-drift-2 {
                                        0%, 100% { transform: translate(0, 0) scale(1); }
                                        50% { transform: translate(-15px, 10px) scale(1.15); }
                                    }
                                    @keyframes fog-pulse {
                                        0%, 100% { opacity: 0.6; transform: scale(1); }
                                        50% { opacity: 0.8; transform: scale(1.05); }
                                    }
                                    @keyframes fog-float {
                                        0%, 100% { transform: translateY(0px); }
                                        50% { transform: translateY(-10px); }
                                    }
                                `}} />
                                </div>
                            );
                        }
                        return null;
                    })()}
                </div>

                {/* Number Pad */}
                <div className="grid grid-cols-5 gap-2 mt-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                        const isFilled = numberCounts[num] >= 9;
                        return (
                            <button
                                key={num}
                                onClick={() => {
                                    if (selectedCell && !isFilled) {
                                        handleCellChange(selectedCell.row, selectedCell.col, num);
                                    }
                                }}
                                disabled={isFilled}
                                className={`
                  w-12 h-12 rounded-lg text-xl font-semibold transition-all
                  ${isFilled
                                        ? 'bg-gray-300 text-gray-400 cursor-not-allowed opacity-50'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}
                `}
                            >
                                {num}
                            </button>
                        );
                    })}
                    <button
                        onClick={() => {
                            if (selectedCell) {
                                handleCellChange(selectedCell.row, selectedCell.col, 0);
                            }
                        }}
                        className="w-12 h-12 bg-red-100 hover:bg-red-200 rounded-lg text-xl font-semibold transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-4">
                    <button
                        onClick={handleReset}
                        className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-lg transition-colors"
                    >
                        🔄 Reset
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-lg shadow-lg transition-colors"
                    >
                        ✅ Submit Answer
                    </button>
                </div>
            </div>
        );
    }
);

PlayerBoard.displayName = 'PlayerBoard';

export default PlayerBoard;
