import { useParams, useNavigate } from 'react-router-dom';
import { useRoom } from '../hooks/useRoom';
import { WaitingRoom } from '../components/lobby';
import { SpectatorDashboard } from '../components/game';

/**
 * AdminPage - Admin/Spectator view for managing and watching the game
 */
export const AdminPage = () => {
    const { roomCode } = useParams<{ roomCode: string }>();
    const navigate = useNavigate();
    const { room, loading, error } = useRoom(roomCode || null);

    // Check if user is admin
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';

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
                    <button
                        onClick={() => navigate('/')}
                        className="mb-4 text-purple-300 hover:text-white flex items-center gap-2 transition-colors"
                    >
                        ← Leave Room
                    </button>
                    <WaitingRoom
                        roomCode={roomCode}
                        players={room.players || {}}
                        isAdmin={isAdmin}
                        playerId={sessionStorage.getItem('playerId') || undefined}
                    />
                </div>
            </div>
        );
    }

    // Playing or finished - show spectator dashboard
    // Use legacy fields with fallbacks for backwards compatibility
    const puzzleString = room.config.puzzleString || '';
    const solutionString = room.config.solutionString || '';

    return (
        <SpectatorDashboard
            players={room.players || {}}
            puzzleString={puzzleString}
            solutionString={solutionString}
            winnerId={room.winnerId}
            gameStatus={room.status}
            startTime={room.startTime}
            isAdmin={isAdmin}
            roomCode={roomCode}
            timeLimit={room.config.timeLimit}
            gameId={room.config.gameId}
        />
    );
};

export default AdminPage;
