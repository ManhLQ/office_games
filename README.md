# 🎮 Office Sudoku Sprint

A real-time multiplayer Sudoku game designed for office engagement. Players (2-4) solve the exact same Sudoku puzzle on their own devices while an admin displays a live spectator dashboard on a large screen for the audience.

## 🎯 Game Concept

- **Players (2-4):** Solve the same Sudoku puzzle on their own devices. They cannot see other players' progress to prevent copying.
- **Admin (Spectator):** Manages the game and displays a Central Dashboard on a TV/Projector showing every player's board updating in real-time.
- **Goal:** First player to submit a correct solution wins!

## 🏗️ Architecture

This project uses a **plugin-based multi-game architecture** that allows easy addition of new games beyond Sudoku.

📖 **[Read the Architecture Documentation →](architecture.md)**

Key features:
- **Game Plugin System** - Add new games by implementing standard interfaces
- **Separation of Concerns** - Clear boundaries between framework and game logic
- **Extensible Design** - Support for Chess, Tic-Tac-Toe, Word Games, and more

For detailed information on architecture, design patterns, and how to add a new game, see [architecture.md](architecture.md).

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React** | Frontend UI with Hooks + Functional Components |
| **TypeScript** | Type-safe development |
| **Vite** | Fast build tool and dev server |
| **Tailwind CSS** | Utility-first styling for rapid development |
| **Firebase Realtime Database** | Real-time data sync between players |
| **sudoku-gen** | Puzzle generation library |

## 📁 Project Structure

```
office_sudoku/
├── public/                     # Static assets
├── src/
│   ├── components/             # React components
│   │   ├── game/               # Game-related components
│   │   │   ├── PlayerBoard.tsx     # Main player Sudoku grid controller
│   │   │   ├── MiniBoard.tsx       # Compact board for spectator view
│   │   │   ├── SpectatorDashboard.tsx  # Admin TV screen with all boards
│   │   │   └── index.ts
│   │   ├── lobby/              # Lobby/room management components
│   │   │   ├── CreateRoom.tsx     # Admin creates new game
│   │   │   ├── JoinRoom.tsx       # Player joins with room code
│   │   │   ├── WaitingRoom.tsx    # Pre-game player list
│   │   │   └── index.ts
│   │   └── index.ts            # Barrel exports
│   │
│   ├── config/                 # Configuration files
│   │   └── firebase.ts         # Firebase initialization
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useDebounce.ts      # Debounce value/callback for Firebase throttling
│   │   ├── useRoom.ts          # Real-time room subscription
│   │   └── index.ts
│   │
│   ├── pages/                  # Route page components
│   │   ├── HomePage.tsx        # Landing page with Create/Join
│   │   ├── AdminPage.tsx       # Admin spectator dashboard
│   │   ├── PlayerPage.tsx      # Player game board
│   │   └── index.ts
│   │
│   ├── services/               # External service integrations
│   │   ├── roomService.ts      # Firebase CRUD operations
│   │   └── index.ts
│   │
│   ├── types/                  # TypeScript type definitions
│   │   └── index.ts            # Room, Player, Config types
│   │
│   ├── utils/                  # Helper functions
│   │   ├── sudoku.ts           # Board generation, validation, scoring
│   │   ├── room.ts             # Room code & player ID generation
│   │   └── index.ts
│   │
│   ├── App.tsx                 # Root app with React Router
│   ├── main.tsx                # React entry point
│   ├── index.css               # Tailwind CSS entry
│   └── vite-env.d.ts           # Vite/env type definitions
│
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
├── eslint.config.js            # ESLint configuration
├── index.html                  # HTML entry point
├── package.json                # Dependencies and scripts
├── spec.md                     # Product specification
├── tsconfig.json               # TypeScript configuration
├── tsconfig.app.json           # App-specific TS config
├── tsconfig.node.json          # Node-specific TS config
└── vite.config.ts              # Vite configuration with Tailwind
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20.19.0+ or 22.12.0+
- npm or yarn
- Firebase account with Realtime Database enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd office_sudoku
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   
   Copy the environment template and fill in your Firebase credentials:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your Firebase config:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   
   Visit `http://localhost:5173`

## 📦 Key Components

### Game Components (`src/components/game/`)

| Component | Description |
|-----------|-------------|
| `PlayerBoard` | The main 9x9 Sudoku grid for players. Handles cell input, debounces Firebase updates (500ms), and validates submissions. |
| `MiniBoard` | Compact board view for spectator dashboard. Shows clues in black, player input in blue, and errors in red. |
| `SpectatorDashboard` | Full-screen TV view showing all player boards in real-time with winner announcement and leaderboard. |

### Lobby Components (`src/components/lobby/`)

| Component | Description |
|-----------|-------------|
| `CreateRoom` | Admin interface to create a new game room with difficulty selection. |
| `JoinRoom` | Player interface to join an existing room with room code and name. |
| `WaitingRoom` | Pre-game lobby showing joined players and start button (admin only). |

### Hooks (`src/hooks/`)

| Hook | Description |
|------|-------------|
| `useDebounce` | Debounces a value with configurable delay. |
| `useDebouncedCallback` | Debounces a callback function for throttled Firebase uploads. |
| `useRoom` | Subscribes to real-time room data from Firebase. |

### Services (`src/services/`)

| Function | Description |
|----------|-------------|
| `createRoom` | Creates a new room with generated puzzle. |
| `joinRoom` | Adds a player to an existing room. |
| `updateRoomStatus` | Changes room status (waiting/playing/finished). |
| `updatePlayerBoard` | Updates player's current board in Firebase. |
| `submitAnswer` | Handles win/loss submission and score calculation. |

### Utilities (`src/utils/`)

| Function | Description |
|----------|-------------|
| `generateBoard` | Creates a new puzzle using sudoku-gen library. |
| `validateBoard` | Checks if player's board matches solution. |
| `getCompletionPercentage` | Calculates score for losing players. |
| `stringToGrid` / `gridToString` | Converts between string and 2D array formats. |
| `generateRoomCode` | Creates random 6-character room codes. |
| `generatePlayerId` | Creates unique player identifiers. |

## 🔥 Firebase Data Structure

```json
{
  "rooms": {
    "ROOM_CODE": {
      "status": "waiting | playing | finished",
      "config": {
        "difficulty": "easy | medium | hard | expert",
        "puzzleString": "530070...",
        "solutionString": "534678..."
      },
      "winnerId": null,
      "players": {
        "PLAYER_ID": {
          "name": "Player Name",
          "currentBoardString": "534070...",
          "finalScore": null,
          "status": "playing | finished"
        }
      }
    }
  }
}
```

## 🎮 Game Flow

### Phase 1: Lobby
1. Admin creates a room (generates puzzle)
2. Players join using room code
3. Admin sees player list on their screen

### Phase 2: Gameplay
1. Admin clicks "Start" → status changes to `playing`
2. All players see the same puzzle
3. Players fill in cells (debounced upload every 500ms)
4. Spectator dashboard shows all boards updating live

### Phase 3: Finish
1. Player clicks "Submit"
2. If correct: Player wins, game ends
3. If incorrect: Alert shown, game continues
4. Losers' scores calculated automatically
5. Results screen shows winner and rankings

## 📱 Responsive Design

- **Desktop:** Full-size boards with keyboard input
- **Mobile:** Touch-friendly number pad for input
- **TV/Projector:** Large spectator dashboard optimized for viewing

## 🔒 Security Note

This game uses an **Honesty Policy** with client-side validation only. The solution is stored client-side for instant validation. For competitive environments, consider implementing server-side validation.

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 🚀 Deployment

This project is configured for deployment to **Vercel**:

```bash
npm run build
# Deploy the `dist` folder to Vercel
```

## 📄 License

MIT License - Feel free to use this for your office game nights!
