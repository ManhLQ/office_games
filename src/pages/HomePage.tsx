import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CreateRoom, JoinRoom } from '../components/lobby';

type Mode = 'home' | 'create' | 'join';

/**
 * HomePage - Landing page with Create/Join options
 * Fun Office Party Theme: Vibrant colors, playful atmosphere
 */
export const HomePage = () => {
    const [searchParams] = useSearchParams();
    const initialMode = searchParams.get('mode') as Mode | null;
    const [mode, setMode] = useState<Mode>(initialMode || 'home');
    const navigate = useNavigate();

    const pendingRoomCode = sessionStorage.getItem('pendingRoomCode') || '';

    useEffect(() => {
        if (pendingRoomCode) {
            sessionStorage.removeItem('pendingRoomCode');
        }
    }, [pendingRoomCode]);

    const handleRoomCreated = (roomCode: string, adminId: string) => {
        sessionStorage.setItem('adminId', adminId);
        sessionStorage.setItem('isAdmin', 'true');
        navigate(`/admin/${roomCode}`);
    };

    const handleRoomJoined = (roomCode: string, playerId: string, playerName: string) => {
        sessionStorage.setItem('playerId', playerId);
        sessionStorage.setItem('playerName', playerName);
        sessionStorage.setItem('isAdmin', 'false');
        navigate(`/play/${roomCode}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-rose-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Vibrant background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                <div className="absolute top-20 left-20 w-64 h-64 bg-cyan-200 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-80 h-80 bg-rose-200 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-teal-200 rounded-full blur-3xl"></div>
            </div>

            {mode === 'home' && (
                <div className="text-center relative z-10">
                    <div className="mb-6">
                        <span className="text-6xl">🎮</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-cyan-600 via-teal-600 to-rose-600 bg-clip-text text-transparent mb-4">
                        Office Sudoku
                    </h1>

                    <p className="text-xl text-slate-700 font-semibold mb-8">
                        Fast-Paced • Competitive • Real-time
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <button
                            onClick={() => setMode('create')}
                            className="group relative px-10 py-5 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white font-bold text-xl rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                CREATE GAME
                            </span>
                        </button>

                        <button
                            onClick={() => setMode('join')}
                            className="group relative px-10 py-5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xl rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                JOIN GAME
                            </span>
                        </button>
                    </div>

                    <div className="mt-12 bg-white/90 backdrop-blur-sm rounded-xl px-8 py-4 inline-block border border-cyan-200 shadow-lg">
                        <p className="text-slate-700 font-semibold text-base">
                            2-4 Players • Real-time • Multiplayer
                        </p>
                    </div>
                </div>
            )}

            {mode === 'create' && (
                <div className="w-full max-w-md relative z-10">
                    <button
                        onClick={() => setMode('home')}
                        className="mb-4 text-slate-700 font-semibold text-lg hover:text-cyan-600 flex items-center gap-2 transition-colors"
                    >
                        ← Back to Party
                    </button>
                    <CreateRoom onRoomCreated={handleRoomCreated} />
                </div>
            )}

            {mode === 'join' && (
                <div className="w-full max-w-md relative z-10">
                    <button
                        onClick={() => setMode('home')}
                        className="mb-4 text-slate-700 font-semibold text-lg hover:text-cyan-600 flex items-center gap-2 transition-colors"
                    >
                        ← Back to Party
                    </button>
                    <JoinRoom
                        onRoomJoined={handleRoomJoined}
                        initialRoomCode={pendingRoomCode}
                    />
                </div>
            )}
        </div>
    );
};

export default HomePage;
