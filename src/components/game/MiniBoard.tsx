import React from 'react';
import { stringToGrid } from '../../utils/sudoku';

interface MiniBoardProps {
    playerName: string;
    puzzleString: string;
    liveInput: string;
    solutionString: string;
    showErrors?: boolean;
    isWinner?: boolean;
    finalScore?: number | null;
    completionPercentage?: number; // 0-100, shown during gameplay
}

/**
 * MiniBoard Component - Displays a single player's board on the spectator dashboard
 * 
 * Visuals:
 * - Starting clues = Black
 * - Live input = Blue
 * - Errors (optional) = Red (audience can see mistakes, players cannot)
 */
export const MiniBoard: React.FC<MiniBoardProps> = React.memo(
    ({
        playerName,
        puzzleString,
        liveInput,
        solutionString,
        showErrors = true,
        isWinner = false,
        finalScore,
        completionPercentage = 0,
    }) => {
        const puzzleGrid = stringToGrid(puzzleString);
        const inputGrid = stringToGrid(liveInput);
        const solutionGrid = stringToGrid(solutionString);

        return (
            <div
                className={`
          flex flex-col items-center p-4 rounded-xl
          ${isWinner ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 ring-4 ring-yellow-400' : 'bg-white'}
          shadow-lg
        `}
            >
                {/* Player Name */}
                <h3 className="text-lg font-bold mb-2 text-gray-800">
                    {playerName}
                    {isWinner && <span className="ml-2 text-yellow-600">🏆 Winner!</span>}
                </h3>

                {/* Completion Progress (shown during gameplay) */}
                {(finalScore === null || finalScore === undefined) && (
                    <div className="w-full mb-2">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-500"
                                    style={{ width: `${completionPercentage}%` }}
                                />
                            </div>
                            <span className="text-xs font-semibold text-gray-600">
                                {completionPercentage}%
                            </span>
                        </div>
                    </div>
                )}

                {/* Mini Grid */}
                <div className="grid grid-cols-9 gap-0 border-2 border-gray-800">
                    {inputGrid.map((row, rowIndex) =>
                        row.map((cell, colIndex) => {
                            const isClue = puzzleGrid[rowIndex][colIndex] !== 0;
                            const isError =
                                showErrors &&
                                !isClue &&
                                cell !== 0 &&
                                cell !== solutionGrid[rowIndex][colIndex];
                            const borderRight = (colIndex + 1) % 3 === 0 && colIndex < 8;
                            const borderBottom = (rowIndex + 1) % 3 === 0 && rowIndex < 8;

                            return (
                                <div
                                    key={`${rowIndex}-${colIndex}`}
                                    className={`
                    w-5 h-5 md:w-6 md:h-6 flex items-center justify-center
                    text-xs md:text-sm font-medium
                    border border-gray-200
                    ${borderRight ? 'border-r-2 border-r-gray-600' : ''}
                    ${borderBottom ? 'border-b-2 border-b-gray-600' : ''}
                    ${isClue ? 'text-gray-900 bg-gray-50' : ''}
                    ${!isClue && !isError ? 'text-blue-600' : ''}
                    ${isError ? 'text-red-500 bg-red-50' : ''}
                  `}
                                >
                                    {cell !== 0 ? cell : ''}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Score (shown when game is finished) */}
                {finalScore !== null && finalScore !== undefined && (
                    <div className="mt-2 text-sm font-semibold text-gray-600">
                        Score: {finalScore}%
                    </div>
                )}
            </div>
        );
    }
);

MiniBoard.displayName = 'MiniBoard';

export default MiniBoard;
