## Summary
- Each game can include up to N powerups (N is configurable per game in Admin; default N = 3).
- There are three powerup types: Hint, Fog, Peep.
- A single powerup type may be selected at most twice in the set for a game.
- Powerups may be provisioned either globally for the game or per-player, using either random or fixed selection modes.

## Powerup setup modes (Admin)
Admin chooses one of four modes when configuring a game:
- Random (global): Select up to N powerups at random from the pool; selection applies to the whole game and is shared by players.
- Fixed (global): Admin chooses up to N specific powerups for the game; selection applies to the whole game and is shared by players.
- Random per player: For each player, randomly select up to N powerups independently from the pool.
- Fixed per player: For each player, admin chooses up to N powerups for that player.

Validation rule for all modes:

- For a given game (or a given player in per-player modes), a single powerup type cannot be included more than 2 times. Examples:
  - Valid: 2 Hint + 1 Fog
  - Invalid: 3 Hint or 2 Hint + 2 Fog (exceeds total N or per-type max)

## Powerup Types (behaviors)

- Hint
  - Effect: Grants a hint for the player's next move.
  - Duration/effect: Instant or persists until the next move is made (client to implement how the hint is shown).
  - Configurable fields: optional (e.g., hint strength), if needed later.
- Fog
  - Effect: Hides competitors’ boards for 5 seconds.
  - Duration: 5 seconds (client-side configurable; no admin UI field required). 
  - Scope: When used by a player, all competitor boards (i.e., boards of players that are opponents of the user) are obscured for the duration.
  - The player who used Fog keeps their own view unchanged.
- Peep
  - Effect: Shows competitors’ boards to the user for 5 seconds.
  - Duration: 5 seconds (client-side configurable; no admin UI field required).
  - Scope: When used, the user can view competitors’ boards for the duration; competitors keep their normal view.

## Rules and game logic

- Availability: A powerup can only be used if it is available to the player (i.e., allocated to that player or available in the global pool and not exhausted).
- Timing: Powerups may be used at any time during the game.
- Concurrency:
  - Only one powerup may be active per player at any time. Example: If Player A activates Fog, that Fog’s effect prevents Player A from using another powerup until Fog’s effect ends (5s).
  - Multiple players may have their own active powerups concurrently (e.g., Player A’s Fog and Player B’s Peep can both be active simultaneously). However, effects that target others must interact deterministically (see interactions below).
- Targeting & shared/global powerups:
  - For global mode (game-level selection), powerup instances are drawn from the shared pool. If one player consumes a Fog from the shared pool, that specific instance is no longer available for others.
  - For per-player mode, each player has their own inventory of the selected powerups.
- Interactions (conflicts and precedence):
  - If two concurrent effects conflict (e.g., Player A uses Fog to obscure Player B’s view while Player B uses Peep to view Player A), define explicit precedence:
    - Resolve simultaneous effects in chronological order of activation. Effects active earlier take precedence over later effects for the overlapping duration.
    - If an earlier effect blocks visibility (Fog) and a later effect seeks visibility (Peep), the later effect should not override the earlier blocker for the overlapping time window.
    - If you prefer, you can define a priority table (e.g., Fog > Peep) instead — decide and document it.
- Re-entrancy: A player who used a powerup cannot use another powerup while their powerup is active. After the effect ends, additional powerups may be used if available.
- Cancellation: There is no cancel action by default. If you want the ability to cancel an active effect (e.g., player revokes Fog early), define the rules and limit possible exploits.

## UI / UX requirements

- Placement and affordances:
  - Powerup button location: top of the board, next to the timer.
  - Button states:
    - Disabled when the player has no powerups available.
    - Highlighted (active visual treatment) when the player has one or more powerups.
Show an icon per powerup type (distinct and self-descriptive).
- Inventory and selection:
  - Clicking the powerup button opens a small popover or menu that lists available powerups (icon, name, short description, remaining count).
  - Hovering a powerup shows a tooltip with the full description (implemented on client-side).
- Effect feedback:
  - When a powerup is used, show an in-game effect:
    - Fog: overlay a fog visual on targets’ boards for the duration.
    - Peep: temporarily reveal target boards to the user and indicate that this is a timed reveal.
    - Hint: show hint UI (e.g., highlighted cell, suggestion panel).
  - Show the effect timer:
    - For the player who used the powerup, show the remaining effect time on the powerup button (e.g., radial countdown or numeric seconds).
    - Also show a subtle indicator on affected players’ boards (for example, a fog overlay with its own timer).
- Accessibility:
  - Provide text equivalents for icon-only UI.
  - Ensure color contrast and animate effects in an accessible way; provide a user setting to reduce animation for motion-sensitive users.
- Tooltips and help:
  - Store brief descriptions and tooltips on the client. Admin does not need to configure these.

## Data model suggestions (Firebase)
Store per-game configuration and per-player inventories. Example fields (JSON-like):
- Game-level config (games/{gameId}/powerupConfig):
  - mode: "random" | "fixed" | "random_per_player" | "fixed_per_player"
  - maxPowerupsPerEntity: integer (N, default 3) // entity = game or player depending on mode
  - perTypeMax: integer (2)
  - fixedList: array of powerup identifiers (if mode is fixed or fixed_per_player)
      - Example: ["hint","fog","hint"] // must follow perTypeMax
  - pool: array of powerup identifiers (optional, for random selection pool)
  - createdBy, createdAt
- Per-player inventory (games/{gameId}/players/{playerId}/powerups):
  - inventory: map of powerupId -> count
    - Example: { "hint": 1, "fog": 1 }
  - activePowerup: { id: "fog", startedAt: timestamp, durationMs: 5000 } or null
  - lastUsedAt: timestamp (optional for analytics / rate-limiting)
- Shared pool (for global modes) (games/{gameId}/sharedPowerups):
  - inventory: map of powerupId -> remainingCount
Rules enforced in server or trusted functions:
- When allocating (admin or random selection), enforce perTypeMax and maxPowerupsPerEntity.
- When a player attempts to use a powerup, validate availability and whether the player already has an active powerup.

## Validation checklist for Admin UI
- Enforce maxPowerupsPerEntity (N) when admin selects or randomizes.
- Enforce perTypeMax (2) when admin selects or randomizes.
- Show clear warnings if admin attempts invalid configuration.
- Confirm final selection with summary that lists counts per type.

## Example scenarios
- Global fixed mode, N=3: Admin chooses ["hint","hint","fog"]. Shared inventory: hint:2, fog:1. Players consume from this pool; once both hints are used, no hints remain.
- Per-player random mode, N=2: Each player receives two random powerups (independent draws). Two different players can each have 2 hints (subject to per-player limit 2).