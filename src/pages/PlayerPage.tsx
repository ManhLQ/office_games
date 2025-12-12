import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoom } from '../hooks/useRoom';
import { WaitingRoom } from '../components/lobby';
import { PlayerBoard } from '../components/game';
import { getCompletionPercentage } from '../utils/sudoku';
import { submitAnswer } from '../services/roomService';

/**
 * PlayerPage - Player's game view
 * 
 * Session Validation:
 * - Redirects to home with join mode if player name is missing
 */
export const PlayerPage = () => {
    const { roomCode } = useParams<{ roomCode: string }>();
    const navigate = useNavigate();
    const { room, loading, error } = useRoom(roomCode || null);
    const [gameEnded, setGameEnded] = useState(false);
    const [isWinner, setIsWinner] = useState(false);
    const [finalScore, setFinalScore] = useState(0);

    // Get player info from sessionStorage
    const playerId = sessionStorage.getItem('playerId') || '';
    const playerName = sessionStorage.getItem('playerName') || '';

    // Session validation - redirect to join if name is missing
    useEffect(() => {
        if (!playerId || !playerName) {
            // Store the room code so we can pre-fill it on join page
            if (roomCode) {
                sessionStorage.setItem('pendingRoomCode', roomCode);
            }
            navigate('/?mode=join');
        }
    }, [playerId, playerName, roomCode, navigate]);

    // Handle game end (when another player wins)
    useEffect(() => {
        if (room?.status === 'finished' && !gameEnded) {
            const player = room.players?.[playerId];

            if (room.winnerId === playerId) {
                // We are the winner
                setIsWinner(true);
                setFinalScore(100);
            } else if (player && player.status !== 'finished') {
                // We lost - calculate and submit score
                const score = getCompletionPercentage(
                    player.currentBoardString,
                    room.config.puzzleString,
                    room.config.solutionString
                );
                setFinalScore(score);
                submitAnswer(roomCode!, playerId, false, score);
            } else if (player?.finalScore !== null) {
                // Score already submitted
                setFinalScore(player.finalScore);
            }

            setGameEnded(true);
        }
    }, [room, playerId, roomCode, gameEnded]);

    // Handle local game end (when we submit correct answer)
    const handleGameEnd = useCallback((won: boolean, score: number) => {
        setIsWinner(won);
        setFinalScore(score);
        setGameEnded(true);
    }, []);

    if (!roomCode) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                    <h1 className="text-2xl mb-4">Invalid room code</h1>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-700"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    // Show loading while checking session or if player info missing (will redirect)
    if (!playerId || !playerName) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                    <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
                    <p>Redirecting to join...</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                    <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
                    <p>Loading game...</p>
                </div>
            </div>
        );
    }

    if (error || !room) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                    <h1 className="text-2xl mb-4">Room not found</h1>
                    <p className="text-gray-400 mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-700"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    // Waiting state - show lobby
    if (room.status === 'waiting') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
                <div className="w-full max-w-lg">
                    <WaitingRoom
                        roomCode={roomCode}
                        players={room.players || {}}
                        isAdmin={false}
                    />
                </div>
            </div>
        );
    }

    // Game finished - show results
    if (gameEnded || room.status === 'finished') {
        const winner = room.winnerId ? room.players?.[room.winnerId] : null;

        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
                <div className="text-center bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full">
                    {isWinner ? (
                        <>
                            <div className="text-6xl mb-4">🏆</div>
                            <h1 className="text-4xl font-bold text-yellow-500 mb-2">
                                YOU WIN!
                            </h1>
                            <p className="text-gray-600 mb-6">
                                Congratulations, {playerName}!
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="text-6xl mb-4">😓</div>
                            <h1 className="text-3xl font-bold text-gray-700 mb-2">
                                Game Over
                            </h1>
                            <p className="text-gray-600 mb-2">
                                {winner?.name} won the game!
                            </p>
                            <p className="text-2xl font-bold text-purple-600 mb-6">
                                Your Score: {finalScore}%
                            </p>
                        </>
                    )}

                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all"
                    >
                        Play Again
                    </button>
                </div>
            </div>
        );
    }

    // Playing state - show game board
    const player = room.players?.[playerId];
    const initialBoard = player?.currentBoardString || room.config.puzzleString;
    const gameStartTime = room.startTime || Date.now();

    // Extract powerup data
    const powerupConfig = room.config.powerupConfig;
    const isGlobalMode = powerupConfig?.enabled && (powerupConfig.mode === 'random' || powerupConfig.mode === 'fixed');
    const powerupInventory = player?.powerups?.inventory;
    const sharedPowerupPool = room.sharedPowerupPool;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-300 via-pink-400 to-purple-500 py-6 px-4">
            {/* Header */}
            <div className="text-center mb-4">
                <h1 className="text-3xl font-black text-white mb-1 drop-shadow-lg">
                    🎮 SUDOKU PARTY! 🎊
                </h1>
                <p className="text-white font-bold drop-shadow-md">
                    Room: <span className="font-mono font-black bg-white/30 px-3 py-1 rounded-lg">{roomCode}</span> •
                    Player: <span className="font-black bg-white/30 px-3 py-1 rounded-lg">{playerName}</span>
                </p>
            </div>

            {/* Game Board */}
            <PlayerBoard
                puzzleString={room.config.puzzleString}
                solutionString={room.config.solutionString}
                initialBoard={initialBoard}
                roomCode={roomCode}
                playerId={playerId}
                playerName={playerName}
                players={room.players || {}}
                gameStartTime={gameStartTime}
                powerupInventory={powerupInventory}
                sharedPowerupPool={sharedPowerupPool}
                isGlobalMode={isGlobalMode || false}
                onGameEnd={handleGameEnd}
            />
        </div>
    );
};

export default PlayerPage;
