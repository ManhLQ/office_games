# Product & Technical Specification: Office Sudoku Sprint

## 1\. Project Overview

A real-time multiplayer Sudoku game designed for office engagement.

  * **Players (2-4):** Solve the **exact same** Sudoku puzzle on their own devices. They cannot see other players' progress to prevent copying.
  * **Admin (Spectator):** Manages the game and displays a **Central Dashboard** on a large screen (TV/Projector). This dashboard shows every player's board updating in **real-time** for the audience to watch.
  * **Goal:** First player to submit a correct board wins.

## 2\. Technical Stack

  * **Frontend:** React (Hooks + Functional Components) with Vite.
  * **Language:** TypeScript (Recommended) or JavaScript.
  * **Styling:** Tailwind CSS (for rapid grid layouts) or CSS Modules.
  * **Backend / Realtime:** **Firebase Realtime Database** (Free Tier).
      * *Why:* Extremely low latency, perfect for live board syncing, and "ephemeral" data (no need to keep history).
  * **Deployment:** Vercel.
  * **Logic:** Pure Client-Side (Board generation, validation, and scoring).
  * **Security:** Honesty Policy (No server-side validation). Use `.env` file to store credentials, DO NOT write directly in the code.

-----

## 3\. Data Architecture (Firebase Realtime DB)

The application relies on a single tree structure for active rooms.

```json
{
  "rooms": {
    "ROOM_CODE_1234": {
      "status": "waiting", // waiting | playing | finished
      "config": {
        "difficulty": "Hard",
        "puzzleString": "530070...", // The immutable starting clues (81 chars)
        "solutionString": "534678..." // The answer key (for client-side validation)
      },
      "winnerId": null, // Populated immediately when someone wins
      "players": {
        "PLAYER_UID_A": {
          "name": "Alice",
          "currentBoardString": "534070...", // The player's live inputs
          "finalScore": null, // Calculated after game ends
          "status": "playing" // playing | finished
        },
        "PLAYER_UID_B": {
          "name": "Bob",
          "currentBoardString": "532070...",
          "finalScore": null,
          "status": "playing"
        }
      }
    }
  }
}
```

-----

## 4\. User Flow & Mechanics

### Phase 1: The Lobby

1.  **Admin:** Creates a room. The client generates a random Sudoku board (using a library like `sudoku-gen`), uploads `puzzleString` and `solutionString` to Firebase.
2.  **Players:** Join using the Room Code and their Name.
3.  **Admin Screen:** Shows a list of joined players.

### Phase 2: The "War Room" (Gameplay)

1.  **Start:** Admin clicks "Start." Firebase `status` updates to `playing`.
2.  **Sync:** All Player clients download the `puzzleString` and `solutionString`.
3.  **Action:**
      * **Player View:** Players tap cells and enter numbers.
      * **Throttling:** On every input, the Player client updates their local state immediately, but **debounces** the upload to Firebase (e.g., waits 500ms after the last keystroke before sending `currentBoardString`).
4.  **Spectator View (Admin):**
      * Subscribes to the `players` node.
      * Renders a grid of "Mini Boards" (one for each player).
      * As players type, the Mini Boards update live (0.5s delay), allowing the audience to see exactly what "Alice" or "Bob" is doing.

### Phase 3: The Finish (Sudden Death)

1.  **Submission:** A player clicks "Submit."
      * **Validation:** Client compares `currentBoard` vs `solutionString`.
      * **If Wrong:** Show alert "Incorrect\!". Game continues.
      * **If Correct:**
        1.  Client writes to Firebase: `winnerId = MyID`, `status = finished`.
        2.  Client sets own status to `finished`.
2.  **The Freeze:**
      * All other clients detect `status === finished`.
      * **Auto-Calculation:** Losing clients immediately lock their interface and calculate their score:
          * `Score = (Correctly Filled Cells / Total Empty Cells) * 100`.
      * Losing clients write their `finalScore` to Firebase.
3.  **Result Screen:** Admin displays the Winner (Big text/Animation) and a ranked list of the other players.

-----

## 5\. Component Specifications

### A. `<PlayerBoard />` (The Controller)

  * **Props:** `puzzleString`, `initialBoard`.
  * **State:** `userGrid` (81-length array or string).
  * **Logic:**
      * **Input:** Only allows changing cells that were '0' in `puzzleString`.
      * **Network:** Uses a `useDebounce` hook to write `userGrid` to `players/ID/currentBoardString`.
      * **Submit:** Handles the win/loss logic locally.

### B. `<SpectatorDashboard />` (The TV Screen)

  * **Layout:** CSS Grid (`grid-cols-2` for 4 players).
  * **Sub-Component: `<MiniBoard />`**
      * Accepts `puzzle` and `liveInput`.
      * **Visuals:**
          * Starting clues = **Black**.
          * Live input = **Blue**.
          * *(Optional)* If `liveInput[i] !== solution[i]`, render **Red** (Audience can see mistakes, players cannot).
  * **Performance:** Use `React.memo` on `<MiniBoard />` to ensure only the specific player's board re-renders when their data changes.

-----

## 6\. Implementation Roadmap

1.  **Setup & Config:**
      * Initialize Vite + React project.
      * Setup Firebase Project and copy config keys to `.env`.
2.  **Sudoku Core:**
      * Install `sudoku-gen` (or similar lightweight lib).
      * Create helper functions: `generateBoard()`, `validateBoard()`, `getCompletionPercentage()`.
3.  **Lobby System:**
      * Create `CreateRoom.tsx` (Admin) and `JoinRoom.tsx` (Player).
      * Implement basic Firebase connection to write/read room data.
4.  **Game Board UI:**
      * Build the 9x9 Grid using CSS Grid.
      * Ensure mobile responsiveness (this is critical for players).
5.  **Real-time Sync (The Core Feature):**
      * Implement the **Debounce** logic for player inputs.
      * Build the Admin's "Multi-Board View."
6.  **Win/Loss Logic:**
      * Implement the "Submit" button validation.
      * Implement the "Game Over" state triggers.