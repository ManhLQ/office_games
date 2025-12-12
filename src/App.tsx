import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage, AdminPage, PlayerPage } from './pages';
import './index.css';

/**
 * Office Sudoku Sprint - Main Application
 * 
 * Routes:
 * - / : Home page with Create/Join options
 * - /admin/:roomCode : Admin spectator dashboard
 * - /play/:roomCode : Player game board
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin/:roomCode" element={<AdminPage />} />
        <Route path="/play/:roomCode" element={<PlayerPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
