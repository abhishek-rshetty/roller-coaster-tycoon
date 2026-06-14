# Browser Tycoon MVP Implementation Plan

## Summary

Build a browser-only React + TypeScript game that implements the spec exactly as a local, single-player dashboard sim. Prioritize correctness and transparency of the monthly simulation over styling. Keep all game logic in pure functions, persist the whole game state in `localStorage`, and use a small set of components to render the flow from start screen to playable dashboard.

## Architecture Decisions

- Use `Vite + React + TypeScript`
- Keep one centralized `GameState`
- Store all ride and location data as static TypeScript constants
- Implement simulation and game actions as pure functions in `src/game`
- Keep `localStorage` persistence isolated in a storage module
- Use simple component state at the app shell level instead of adding a state library
- Defer visual polish until the full game loop is playable

## Public Types and Interfaces

Core types:

- `Location`
- `RideDefinition`
- `BuiltRide`
- `MonthlyReport`
- `GameState`

Core functions:

- `createNewGame(locationId): GameState`
- `buildRide(gameState, rideId): GameState`
- `setTicketPrice(gameState, price): GameState`
- `takeLoan(gameState, amount): GameState`
- `repayLoan(gameState, amount): GameState`
- `simulateNextMonth(gameState): GameState`
- `saveGame(gameState): void`
- `loadGame(): GameState | null`
- `resetGame(): void`

Utility functions:

- `clamp`
- `formatMoney`
- `formatPercent`
- `generateId`

## Implementation Steps

### 1. App Scaffold

- Initialize a Vite React TypeScript app
- Add the `src` structure from the spec
- Keep CSS minimal and functional

### 2. Static Data and Constants

- Add `locations.ts` with both markets, visible ratings, and hidden variables
- Add `rides.ts` with the full ride catalogue
- Add `constants.ts` with:
  - initial money and land values
  - allowed ticket prices
  - loan increment
  - interest rate
  - save key

### 3. Core Game Types

- Define all spec types in `types.ts`
- Extend start state with `latestReport: null`
- Keep `selectedLocation` as a fully materialized location object in game state
- Treat built rides as full copies of `RideDefinition` plus `instanceId` and `builtMonth`

### 4. Simulation Engine

Implement `simulation.ts` as a pure module with helper functions for:

- market demand
- per-ride market fit
- duplicate penalty
- total attraction
- price modifier
- reputation modifier
- competition modifier
- visitor calculation
- revenue calculation
- maintenance and interest calculation
- satisfaction calculation
- reputation update
- market growth update
- park value calculation
- explanation message generation

Behavior rules:

- If no rides exist, visitors must be `0`
- If no rides exist, satisfaction must be `0.2`
- Visitor count must be capped by total ride capacity
- Duplicate copies must use `1.0`, `0.8`, `0.6`, then floor at `0.4`
- Market growth must update the selected location values stored in state
- `simulateNextMonth` must append one report, update derived values, then increment month

### 5. Action Layer

Implement `actions.ts` as pure state transitions:

- `createNewGame` builds initial state from selected location
- `buildRide` validates cash and land, clones the ride into a built instance, updates cash and land
- `setTicketPrice` only accepts the five allowed values
- `takeLoan` only accepts `50000`, respects `maxDebt`
- `repayLoan` only accepts `50000`, respects both current cash and debt
- `simulateNextMonth` delegates all math to the simulation module

Error handling:

- Return typed errors or throw predictable `Error` messages for invalid actions
- UI should convert action failures into readable inline messages

### 6. Persistence

Implement `storage.ts`:

- `saveGame` serializes full `GameState`
- `loadGame` parses and validates minimally
- `resetGame` removes the save key
- Save immediately after every successful state-changing action
- Show Resume only when a valid save exists

### 7. UI Flow

Implement the screens/components in this order:

1. `StartScreen`
2. `LocationSelect`
3. `Dashboard`
4. `StatBar`
5. `RideCatalog`
6. `BuiltRides`
7. `PricingPanel`
8. `LoanPanel`
9. `MonthlyReport`

Expected behavior:

- App boots to Start screen
- New Game opens location selection
- Resume loads saved state directly into dashboard
- Dashboard renders top stats and action panels
- Build buttons disable on cash/land constraints
- Price buttons show current selection clearly
- Loan buttons disable when action is invalid
- Run Next Month updates top stats and latest report in one transition

### 8. Explanation Messages

Generate 1 to 3 report messages from actual monthly outcomes.

Priority triggers:

- attraction improved after building
- satisfaction dropped from weak value at current price
- maintenance rose after expansion
- visitor count hit capacity cap
- competition pressure is hurting demand
- reputation improved due to strong satisfaction
- insolvency warning when cash is negative and debt is maxed

Messages should be deterministic from report inputs, not random flavor text.

## Test Plan

### Simulation correctness

- Oakville + family-heavy park + price `20` becomes usually profitable within early months
- Coast City + cheap family rides grows slowly due to competition
- High ticket prices reduce visitors compared with the same park at lower prices
- Weak attraction plus high ticket price lowers satisfaction
- Duplicate ride stacking produces diminishing returns
- No rides yields `0` visitors and `0.2` satisfaction
- High debt increases monthly interest and reduces profit
- Capacity cap prevents visitors from exceeding total ride throughput

### Action correctness

- Build succeeds only when both cash and land allow it
- Borrowing cannot exceed `maxDebt`
- Repayment cannot exceed debt or available cash
- Invalid ticket price is rejected
- Every successful action persists state

### UX flow

- Start screen shows Resume only when a save exists
- Refresh restores game from `localStorage`
- Monthly report updates after every simulated month
- Soft insolvency warning appears when cash is negative and debt is maxed

## Assumptions

- Implementation starts from an empty repo
- No dedicated test framework is required in the first pass, but simulation cases should be manually verifiable and easy to port into tests
- Styling remains intentionally lightweight for MVP
- No animation, map view, or guest-level simulation will be introduced
- `GameState` remains the single source of truth for both simulation and rendering
