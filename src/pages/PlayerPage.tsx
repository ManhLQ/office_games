import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoom } from '../hooks/useRoom';
import { WaitingRoom } from '../components/lobby';
import { GameBoard } from '../components/game/GameBoard';
import { gameRegistry } from '../games/core/GameRegistry';
import type { IGameMove } from '../games/core/interfaces/IGameMove';
import type { IGameState } from '../games/core/interfaces/IGameState';
import { SudokuState } from '../games/sudoku/SudokuState';
import { CrosswordState } from '../games/crossword/CrosswordState';
import { submitAnswer } from '../services/roomService';
import { updatePlayerState, updatePlayerCompletion } from '../services/gameStateService';

/**
 * PlayerPage - Player's game view
 * Now game-agnostic, works with any registered game
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

    // Session validation
    useEffect(() => {
        if (!playerId || !playerName) {
            if (roomCode) {
                sessionStorage.setItem('pendingRoomCode', roomCode);
            }
            navigate('/?mode=join');
        }
    }, [playerId, playerName, roomCode, navigate]);

    // CRITICAL: Detect if admin leaves the waiting room
    useEffect(() => {
        if (!room || room.status !== 'waiting') return;

        const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
        if (isAdmin) return; // Admin doesn't need to check for themselves

        // Check if room still has an adminId
        // Note: Admin is NOT in players list during waiting room (they're on AdminPage)
        // If room.adminId is missing/null, the room is orphaned
        if (!room.adminId) {
            // Room has no admin - redirect all players home
            alert('The host has left the room. Returning to home page.');
            sessionStorage.removeItem('playerId');
            sessionStorage.removeItem('playerName');
            navigate('/');
        }
    }, [room, navigate]);

    // Handle game end (when another player wins)
    useEffect(() => {
        if (room?.status === 'finished' && !gameEnded) {
            const player = room.players?.[playerId];

            if (room.winnerId === playerId) {
                setIsWinner(true);
                setFinalScore(100);
            } else if (player && player.status !== 'finished') {
                // Calculate final score
                const score = player.completionPercentage || 0;
                setFinalScore(score);
                submitAnswer(roomCode!, playerId, false, score);
            } else if (player?.finalScore !== null) {
                setFinalScore(player.finalScore);
            }

            setGameEnded(true);
        }
    }, [room, playerId, roomCode, gameEnded]);

    // Handle local game end
    const handleGameEnd = useCallback((won: boolean, score: number) => {
        setIsWinner(won);
        setFinalScore(score);
        setGameEnded(true);
    }, []);

    // Handle move
    const handleMove = useCallback(async (move: IGameMove) => {
        // CRITICAL: Check for undefined/null, not falsy (0 is valid for row/col!)
        if (!room || !roomCode || move.row === undefined || move.row === null || move.col === undefined || move.col === null) return;

        const game = gameRegistry.get(room.config.gameId);
        if (!game) return;

        const player = room.players?.[playerId];
        if (!player) return;

        // Get current state - use game-specific deserialization
        const currentStateString = player.currentGameState || player.currentBoardString || room.config.puzzleString;
        let currentState: IGameState;

        if (room.config.gameId === 'sudoku') {
            currentState = new SudokuState(currentStateString!);
        } else if (room.config.gameId === 'crossword') {
            currentState = CrosswordState.deserialize(currentStateString!);
        } else {
            console.error('Unknown game type:', room.config.gameId);
            return;
        }

        // Apply move using game's applyMove method
        const newState = game.applyMove(currentState, move);

        // Update Firebase
        await updatePlayerState(roomCode, playerId, newState);

        // Update completion percentage - deserialize initial and solution states
        let initialState: IGameState;
        let solution: IGameState;

        if (room.config.gameId === 'sudoku') {
            initialState = new SudokuState(room.config.puzzleString!);
            solution = new SudokuState(room.config.solutionString!);
        } else if (room.config.gameId === 'crossword') {
            initialState = CrosswordState.deserialize(room.config.puzzleString!);
            solution = CrosswordState.deserialize(room.config.solutionString!);
        } else {
            return;
        }

        await updatePlayerCompletion(roomCode, playerId, game, newState, initialState, solution);

        // Check if game is complete and correct
        if (game.isGameComplete(newState)) {
            const isCorrect = game.isGameCorrect(newState, solution);

            if (isCorrect) {
                const score = game.calculateScore(newState, initialState, solution);
                await submitAnswer(roomCode, playerId, true, score);
                handleGameEnd(true, score);
            }
        }
    }, [room, roomCode, playerId, handleGameEnd]);

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
                    <p>Loading room...</p>
                </div>
            </div>
        );
    }

    if (error || !room) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                    <h1 className="text-2xl mb-4">Error: {error || 'Room not found'}</h1>
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

    // Waiting state
    if (room.status === 'waiting') {
        // SECURITY: Check admin status from sessionStorage (set during room creation)
        // Do NOT trust client-side player order - this is validated server-side
        const isAdmin = sessionStorage.getItem('isAdmin') === 'true';

        return (
            <WaitingRoom
                roomCode={roomCode}
                players={room.players || {}}
                isAdmin={isAdmin}
                playerId={playerId}
            />
        );
    }

    // Game ended state
    if (gameEnded) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                    <div className="text-6xl mb-4">
                        {isWinner ? '🏆' : '🎯'}
                    </div>

                    <h1 className="text-3xl font-bold mb-2">
                        {isWinner ? 'You Won!' : 'Game Over'}
                    </h1>

                    <p className="text-xl text-gray-600 mb-6">
                        Final Score: <span className="font-bold text-purple-600">{finalScore}%</span>
                    </p>

                    <p className="text-sm text-gray-500 mb-4 italic">
                        Waiting for admin to end session...
                    </p>

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

    // Playing state - get game instance
    const game = gameRegistry.get(room.config.gameId);
    if (!game) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                    <h1 className="text-2xl mb-4">Game "{room.config.gameId}" not found</h1>
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

    const player = room.players?.[playerId];
    // eslint-disable-next-line react-hooks/purity
    const gameStartTime = room.startTime || Date.now();

    // Get game states - use game-specific deserialization
    const initialStateString = room.config.puzzleString!;
    const solutionStateString = room.config.solutionString!;
    const currentStateString = player?.currentGameState || player?.currentBoardString || initialStateString;

    // Deserialize states based on game type
    let initialState: IGameState;
    let solution: IGameState;
    let currentState: IGameState;

    if (room.config.gameId === 'sudoku') {
        initialState = new SudokuState(initialStateString);
        solution = new SudokuState(solutionStateString);
        currentState = new SudokuState(currentStateString);
    } else if (room.config.gameId === 'crossword') {
        initialState = CrosswordState.deserialize(initialStateString);
        solution = CrosswordState.deserialize(solutionStateString);
        currentState = CrosswordState.deserialize(currentStateString);
    } else {
        // Fallback: try to use game's createGame method
        const gameConfig = game.createGame(room.config.difficulty);
        initialState = gameConfig.initialState;
        solution = gameConfig.solution;
        currentState = gameConfig.initialState; // Use initial as fallback
    }

    // Extract powerup data
    const powerupConfig = room.config.powerupConfig;
    const isGlobalMode = powerupConfig?.enabled && (powerupConfig.mode === 'random' || powerupConfig.mode === 'fixed');
    const powerupInventory = player?.powerups?.inventory;
    const sharedPowerupPool = room.sharedPowerupPool;

    return (
        <GameBoard
            game={game}
            initialState={initialState}
            solution={solution}
            currentState={currentState}
            roomCode={roomCode}
            playerId={playerId}
            playerName={playerName}
            players={room.players || {}}
            gameStartTime={gameStartTime}
            timeLimitMinutes={room.config.timeLimit}
            completionPercentage={player?.completionPercentage || 0}
            powerupInventory={powerupInventory}
            sharedPowerupPool={sharedPowerupPool}
            isGlobalMode={isGlobalMode || false}
            onMove={handleMove}
        />
    );
};

export default PlayerPage;
