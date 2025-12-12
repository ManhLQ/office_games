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
        <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-300 rounded-full opacity-20 animate-bounce" style={{ animationDuration: '3s' }}></div>
                <div className="absolute bottom-20 right-20 w-40 h-40 bg-cyan-300 rounded-full opacity-20 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 right-10 w-24 h-24 bg-lime-300 rounded-full opacity-20 animate-bounce" style={{ animationDuration: '5s', animationDelay: '2s' }}></div>
            </div>

            {mode === 'home' && (
                <div className="text-center relative z-10">
                    <div className="mb-6 animate-pulse">
                        <span className="text-7xl">🎉</span>
                        <span className="text-7xl">🎮</span>
                        <span className="text-7xl">🎊</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black text-white mb-4 drop-shadow-2xl" style={{
                        textShadow: '4px 4px 0px rgba(0,0,0,0.3), 8px 8px 0px rgba(255,255,255,0.1)'
                    }}>
                        Office Sudoku
                        <br />
                        <span className="text-yellow-300">PARTY! 🎈</span>
                    </h1>

                    <p className="text-2xl text-white font-bold mb-8 drop-shadow-lg">
                        ⚡ Fast-Paced • 🏆 Winner Takes All • 🎪 Epic Fun!
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <button
                            onClick={() => setMode('create')}
                            className="group relative px-10 py-5 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-300 hover:via-orange-400 hover:to-red-400 text-white font-black text-2xl rounded-2xl shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 transform hover:scale-110 hover:-rotate-2"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                <span className="text-3xl">🎯</span>
                                CREATE GAME
                                <span className="text-3xl">✨</span>
                            </span>
                        </button>

                        <button
                            onClick={() => setMode('join')}
                            className="group relative px-10 py-5 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 hover:from-cyan-300 hover:via-blue-400 hover:to-purple-500 text-white font-black text-2xl rounded-2xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-110 hover:rotate-2"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                <span className="text-3xl">🚀</span>
                                JOIN PARTY
                                <span className="text-3xl">🎊</span>
                            </span>
                        </button>
                    </div>

                    <div className="mt-12 bg-white/20 backdrop-blur-sm rounded-2xl px-8 py-4 inline-block border-4 border-white/40">
                        <p className="text-white font-bold text-lg">
                            👥 2-4 Players • ⚡ Real-time Action • 📺 Big Screen Fun!
                        </p>
                    </div>
                </div>
            )}

            {mode === 'create' && (
                <div className="w-full max-w-md relative z-10">
                    <button
                        onClick={() => setMode('home')}
                        className="mb-4 text-white font-bold text-lg hover:text-yellow-300 flex items-center gap-2 transition-colors drop-shadow-lg"
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
                        className="mb-4 text-white font-bold text-lg hover:text-yellow-300 flex items-center gap-2 transition-colors drop-shadow-lg"
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
