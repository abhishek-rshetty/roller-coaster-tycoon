# Browser Tycoon

Browser Tycoon is a browser-based, fully local amusement park strategy game inspired by RollerCoaster Tycoon. This project is a dashboard sim, not a construction simulator: you choose a market, plan rides, price tickets, manage debt, and run the park month by month.

The current implementation includes the v1.1 upgrade:

- India-based starting markets
- rupee formatting
- planned builds with cancel-before-month-end flow
- monthly history viewer
- improved monthly report layout
- ride-level performance summaries

## Tech Stack

- React
- TypeScript
- Vite
- localStorage for persistence

No backend, database, login, or environment variables are required.

## Setup

### Prerequisites

- Node.js 20+ recommended
- npm 10+ recommended

### Install

```bash
git clone https://github.com/abhishek-rshetty/roller-coaster-tycoon.git
cd roller-coaster-tycoon
npm install
```

### Run locally

```bash
npm run dev
```

Then open:

```txt
http://localhost:5173/
```

### Production build

```bash
npm run build
```

The production bundle is generated in `dist/`.

## Project Structure

```txt
src/
  App.tsx
  data/
    locations.ts
    rides.ts
  game/
    actions.ts
    constants.ts
    simulation.ts
    storage.ts
    types.ts
  components/
    BuiltRides.tsx
    Dashboard.tsx
    LoanPanel.tsx
    LocationSelect.tsx
    MonthlyReport.tsx
    PlannedBuilds.tsx
    PricingPanel.tsx
    RideCatalog.tsx
    StartScreen.tsx
    StatBar.tsx
  utils/
    format.ts
    math.ts
```

## Core Behavior

- New games and resume state are stored in the browser via `localStorage`
- Rides are planned first, then activated after the next month run
- Monthly reports are stored in history and can be viewed by month
- Simulation is driven by pure TypeScript modules in `src/game`

## Specs

Project docs included in the repo:

- `SPEC.md`
- `IMPLEMENTATION_PLAN.md`
- `V1.1_SPEC.md`
- `V1.1_IMPLEMENTATION_SPEC.md`

## Notes for Another Developer

- There is no backend setup
- There are no secrets or `.env` files
- Browser save state can be reset by clearing localStorage or using the in-app new run flow
- If an old saved game exists from a previous version, the app includes lightweight migration logic

## Troubleshooting

### Port already in use

Run Vite on another port:

```bash
npm run dev -- --port 4173
```

### Clean install

If dependencies get into a bad state:

```bash
rm -rf node_modules package-lock.json
npm install
```
