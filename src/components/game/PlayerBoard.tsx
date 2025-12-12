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
import type { Players } from '../../types';

interface PlayerBoardProps {
    puzzleString: string;
    solutionString: string;
    initialBoard: string;
    roomCode: string;
    playerId: string;
    playerName: string;
    players: Players;
    gameStartTime: number; // timestamp when game started
    onGameEnd: (isWinner: boolean, score: number) => void;
}

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
        playerName,
        players,
        gameStartTime,
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

        // Format time as MM:SS
        const formatTime = (seconds: number): string => {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
                {/* Timer and Completion */}
                <div className="flex gap-4 items-center flex-wrap justify-center">
                    <div className="text-3xl font-mono font-bold text-white bg-gray-800 px-6 py-2 rounded-lg">
                        ⏱️ {formatTime(elapsedTime)}
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
                </div>

                {/* Competitors Panel */}
                {competitors.length > 0 && (
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
                )}

                {/* 9x9 Grid */}
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

                            // Determine background color priority
                            let bgColor = isEditable ? 'bg-gray-50' : 'bg-white';
                            if (isHoveredRow || isHoveredCol) bgColor = 'bg-yellow-50';
                            if (isHighlighted) bgColor = 'bg-purple-100';
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
                                    {cell !== 0 ? cell : ''}
                                </div>
                            );
                        })
                    )}
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
