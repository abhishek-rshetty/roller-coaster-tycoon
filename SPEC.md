# Browser Tycoon MVP Spec

## Product Goal

Build a browser-based, fully local, single-player strategy MVP inspired by RollerCoaster Tycoon.

This MVP is a dashboard strategy game, not a construction simulator. The player chooses a market, builds rides, sets ticket price, manages cash and debt, and advances the simulation month by month.

Core question:

Can the player build a profitable amusement park by matching ride choices to market demand while managing cash, land, pricing, and debt?

## Platform Requirements

- Runs fully in browser
- No backend
- No login
- No external database
- Game state persists in `localStorage`
- Player can start a new game and resume an existing game
- Use simple UI components
- Prioritize transparent simulation feedback over visual polish

## Core Game Loop

One turn equals one month.

1. Player selects a location
2. Player starts with fixed cash, land, and no rides
3. Player builds rides
4. Player sets ticket price
5. Player optionally takes or repays loans
6. Player runs next month
7. Game calculates:
   - visitors
   - revenue
   - maintenance cost
   - loan interest
   - net profit
   - satisfaction
   - reputation
   - park value
8. Player reads the monthly report
9. Player adjusts strategy
10. Repeat

Success loop:

Better ride mix -> higher attractiveness -> more visitors -> more revenue -> more cash -> bigger rides -> stronger park

Failure loop:

Wrong ride mix -> low satisfaction -> weak reputation -> fewer visitors -> low revenue -> maintenance pressure -> debt spiral

## MVP Scope

### Include

- Location selection
- Two starting locations
- Hidden market variables
- Visible market ratings
- Ride catalogue
- Land capacity
- Ride construction
- Monthly simulation
- Ticket pricing
- Cash
- Loans
- Maintenance costs
- Satisfaction
- Reputation
- Park value
- Monthly report
- Save/load using `localStorage`

### Exclude

- Actual coaster building
- Pathfinding
- Staff hiring
- Shops as buildable entities
- Guest-level simulation
- Weather
- Terrain
- Ride breakdowns
- Visual park map
- Animations
- Competitor actions
- Multiplayer

## Starting Locations

### Oakville

Visible ratings:

- Competition: 1 / 5
- Visitor Spending: 2 / 5
- Tourism: 1 / 5

Description:

A growing town with few entertainment options. Visitors are easy to attract, but budgets are limited.

Hidden values:

```json
{
  "id": "oakville",
  "name": "Oakville",
  "population": 220000,
  "touristsPerMonth": 8000,
  "competitionStrength": 0.15,
  "spendingPower": 0.85,
  "growthRateMonthly": 0.012,
  "familyShare": 0.65,
  "thrillShare": 0.25,
  "touristShare": 0.10
}
```

### Coast City

Visible ratings:

- Competition: 4 / 5
- Visitor Spending: 4 / 5
- Tourism: 5 / 5

Description:

A bustling tourist hotspot. Visitors spend freely, but rival parks compete for their attention.

Hidden values:

```json
{
  "id": "coast_city",
  "name": "Coast City",
  "population": 520000,
  "touristsPerMonth": 130000,
  "competitionStrength": 0.55,
  "spendingPower": 1.35,
  "growthRateMonthly": 0.004,
  "familyShare": 0.35,
  "thrillShare": 0.40,
  "touristShare": 0.25
}
```

## Initial Game State

```json
{
  "month": 1,
  "cash": 500000,
  "debt": 0,
  "maxDebt": 1000000,
  "annualInterestRate": 0.08,
  "ticketPrice": 20,
  "landUsed": 0,
  "landCapacity": 30,
  "reputation": 0.5,
  "satisfaction": 0.7,
  "rides": [],
  "monthlyHistory": []
}
```

## Ride Catalogue

Each ride is a business asset with:

- `id`
- `name`
- `category`
- `buildCost`
- `footprint`
- `monthlyMaintenance`
- `monthlyCapacity`
- `familyAppeal`
- `thrillAppeal`
- `touristAppeal`
- `excitement`
- `baseAttraction`

Ride set:

- Carousel
- Mini Train
- Ferris Wheel
- Swing Ride
- Drop Tower
- Roller Coaster
- Water Ride
- Mega Coaster

## Player Actions

### Build Ride

- Allowed only if `cash >= buildCost`
- Allowed only if `landUsed + footprint <= landCapacity`
- Immediately subtracts build cost from cash
- Immediately increases land used
- Multiple copies allowed
- Duplicate rides have diminishing attraction value

Errors:

- Insufficient cash
- Insufficient land

### Set Ticket Price

Allowed values:

```json
[10, 20, 30, 40, 50]
```

- Can change any time before running next month
- Affects visitor demand and satisfaction

### Take Loan

- Borrow in increments of `50000`
- Total debt cannot exceed `maxDebt`
- Borrowed amount immediately increases cash and debt

### Repay Loan

- Repay in increments of `50000`
- Cannot repay more than current cash
- Cannot repay more than current debt

### Run Next Month

- Runs the simulation
- Updates cash, satisfaction, reputation, market growth, and monthly history
- Increments month

## Simulation Formulas

### Market Demand

```js
localDemand = population * 0.015;
touristDemand = touristsPerMonth * 0.12;
rawMarketDemand = localDemand + touristDemand;
```

### Park Attraction

```js
marketFit =
  (ride.familyAppeal * location.familyShare) +
  (ride.thrillAppeal * location.thrillShare) +
  (ride.touristAppeal * location.touristShare);
```

```js
rideAttraction = ride.baseAttraction * (marketFit / 5);
```

Duplicate penalty:

```js
duplicateMultiplier = Math.max(0.4, 1 - duplicateIndex * 0.2);
```

```js
totalAttraction = sum(rideAttraction * duplicateMultiplier);
```

### Reputation Modifier

```js
reputationModifier = 0.5 + reputation;
```

Range:

```js
0.1 to 2.0
```

### Competition Modifier

```js
competitionModifier = 1 - location.competitionStrength;
```

### Ticket Price Modifier

Baseline price is `20`.

```js
priceModifier = Math.max(0.35, 1 - ((ticketPrice - 20) * 0.025));
```

Examples:

- `$10` -> `1.25`
- `$20` -> `1.00`
- `$30` -> `0.75`
- `$40` -> `0.50`
- `$50` -> `0.35`

### Visitor Demand Captured

```js
attractionModifier = Math.min(1.5, totalAttraction / 100);
```

```js
visitorsBeforeCapacity =
  rawMarketDemand *
  attractionModifier *
  reputationModifier *
  competitionModifier *
  priceModifier;
```

### Ride Capacity

```js
totalRideCapacity = sum(ride.monthlyCapacity);
visitors = Math.floor(Math.min(visitorsBeforeCapacity, totalRideCapacity));
```

If no rides exist:

```js
visitors = 0;
```

### Revenue

```js
ticketRevenue = visitors * ticketPrice;
baseSpend = 8;
averageSpend = baseSpend * location.spendingPower * satisfaction;
inParkRevenue = visitors * averageSpend;
totalRevenue = ticketRevenue + inParkRevenue;
```

### Costs

```js
maintenanceCost = sum(ride.monthlyMaintenance);
monthlyInterest = debt * (annualInterestRate / 12);
totalCosts = maintenanceCost + monthlyInterest;
netProfit = totalRevenue - totalCosts;
cash = cash + netProfit;
```

### Satisfaction

```js
parkValueForGuests = totalAttraction / ticketPrice;
valueScore = clamp(parkValueForGuests / 5, 0.2, 1.2);

capacityUtilization = visitors / totalRideCapacity;
crowdingScore = clamp(1.2 - capacityUtilization, 0.4, 1.0);

averageMarketFit = average(marketFit / 5 across rides);
marketFitScore = clamp(averageMarketFit, 0.4, 1.0);

satisfaction = clamp(
  (valueScore * 0.45) +
  (crowdingScore * 0.25) +
  (marketFitScore * 0.30),
  0.1,
  1.0
);
```

If no rides exist:

```js
satisfaction = 0.2;
```

### Reputation

```js
reputationChange = (satisfaction - 0.7) * 0.15;
reputation = clamp(reputation + reputationChange, 0.1, 2.0);
```

### Market Growth

```js
population = population * (1 + growthRateMonthly);
touristsPerMonth = touristsPerMonth * (1 + growthRateMonthly);
```

### Park Value

```js
rideAssetValue = sum(ride.buildCost * 0.7);
profitValue = Math.max(0, netProfit * 24);
parkValue = cash + rideAssetValue + profitValue - debt;
```

## Monthly Report

Show after each month:

- Month number
- Visitors
- Ticket revenue
- In-park revenue
- Total revenue
- Maintenance cost
- Loan interest
- Net profit
- Cash
- Debt
- Satisfaction
- Reputation
- Park value

Also show 1 to 3 explanation messages.

Examples:

- Visitors increased because your new rides improved total park attraction
- Satisfaction fell because ticket price is high compared to park attraction
- Profit fell because maintenance costs increased after expansion
- Visitor count was capped by ride capacity
- Your park is struggling against strong competition in this market
- Reputation improved because satisfaction was above 70%

## UI Screens

### Start Screen

- Game title
- New Game button
- Resume Game button if save exists

### Location Selection Screen

Each location card shows:

- Name
- Description
- Competition rating
- Visitor Spending rating
- Tourism rating
- Start Game button

Hidden values are not shown.

### Main Dashboard

Top stats:

- Month
- Cash
- Monthly profit
- Visitors
- Satisfaction
- Reputation
- Park value
- Debt
- Land used / land capacity

Main sections:

1. Ride Catalogue
2. Built Rides
3. Pricing
4. Loans
5. Monthly Report
6. Run Next Month button

### Ride Catalogue

Each card shows:

- Name
- Category
- Build cost
- Footprint
- Monthly maintenance
- Capacity
- Family appeal
- Thrill appeal
- Tourist appeal
- Build button

Build button disabled if:

- insufficient cash
- insufficient land

### Built Rides

Each row shows:

- Ride name
- Category
- Footprint
- Maintenance
- Capacity

### Pricing Panel

- Current ticket price
- Buttons for `$10`, `$20`, `$30`, `$40`, `$50`

### Loan Panel

- Current debt
- Maximum debt
- Annual interest rate
- Borrow `$50,000`
- Repay `$50,000`

### Monthly Report Panel

- Latest report
- Explanation messages

## State Shape

```ts
type Location = {
  id: string;
  name: string;
  description: string;
  visibleRatings: {
    competition: number;
    visitorSpending: number;
    tourism: number;
  };
  population: number;
  touristsPerMonth: number;
  competitionStrength: number;
  spendingPower: number;
  growthRateMonthly: number;
  familyShare: number;
  thrillShare: number;
  touristShare: number;
};

type RideDefinition = {
  id: string;
  name: string;
  category: "family" | "thrill" | "balanced" | "premium";
  buildCost: number;
  footprint: number;
  monthlyMaintenance: number;
  monthlyCapacity: number;
  familyAppeal: number;
  thrillAppeal: number;
  touristAppeal: number;
  excitement: number;
  baseAttraction: number;
};

type BuiltRide = RideDefinition & {
  instanceId: string;
  builtMonth: number;
};

type MonthlyReport = {
  month: number;
  visitors: number;
  ticketRevenue: number;
  inParkRevenue: number;
  totalRevenue: number;
  maintenanceCost: number;
  loanInterest: number;
  netProfit: number;
  cash: number;
  debt: number;
  satisfaction: number;
  reputation: number;
  parkValue: number;
  landUsed: number;
  landCapacity: number;
  messages: string[];
};

type GameState = {
  selectedLocation: Location;
  month: number;
  cash: number;
  debt: number;
  maxDebt: number;
  annualInterestRate: number;
  ticketPrice: number;
  landUsed: number;
  landCapacity: number;
  reputation: number;
  satisfaction: number;
  rides: BuiltRide[];
  latestReport: MonthlyReport | null;
  monthlyHistory: MonthlyReport[];
};
```

## Required Functions

- `createNewGame(locationId)`
- `buildRide(gameState, rideId)`
- `setTicketPrice(gameState, price)`
- `takeLoan(gameState, amount)`
- `repayLoan(gameState, amount)`
- `simulateNextMonth(gameState)`
- `saveGame(gameState)`
- `loadGame()`
- `resetGame()`

## Utility Functions

```ts
clamp(value: number, min: number, max: number): number
formatMoney(value: number): string
formatPercent(value: number): string
generateId(): string
```

## Acceptance Criteria

### Game Start

- User can start a new game
- User can select Oakville or Coast City
- Hidden location values are not displayed
- Visible ratings are displayed

### Ride Building

- User can build rides when cash and land are sufficient
- Cash decreases by build cost
- Land used increases by footprint
- User cannot build when cash is insufficient
- User cannot build when land is insufficient

### Pricing

- User can set ticket price to one of five values
- Selected price is clearly visible
- Price affects visitors and satisfaction after simulation

### Loans

- User can borrow in `50000` increments
- User cannot exceed max debt
- User can repay in `50000` increments
- User cannot repay more than available cash or current debt
- Loan interest affects monthly costs

### Monthly Simulation

- Running next month produces a report
- Visitors, revenue, costs, profit, satisfaction, reputation, and park value update
- Monthly history stores each report
- Month increments by one
- State persists after refresh

### Strategy Differences

- Oakville should favor family-heavy, lower-price strategies
- Coast City should favor premium/thrill-heavy strategies
- Duplicate ride spam should be weaker than balanced variety
- High ticket prices should reduce visitors
- High ticket prices should reduce satisfaction when attraction is weak

## Suggested File Structure

```txt
src/
  App.tsx
  data/
    locations.ts
    rides.ts
  game/
    types.ts
    constants.ts
    simulation.ts
    actions.ts
    storage.ts
  components/
    StartScreen.tsx
    LocationSelect.tsx
    Dashboard.tsx
    StatBar.tsx
    RideCatalog.tsx
    BuiltRides.tsx
    PricingPanel.tsx
    LoanPanel.tsx
    MonthlyReport.tsx
  utils/
    format.ts
    math.ts
```

## Balance Targets

After 12 simulated months:

### Oakville

- Family rides with ticket price `20` should usually be profitable
- Premium thrill-only strategies should struggle early

### Coast City

- Cheap family rides should grow slowly due to competition
- Premium rides with ticket price `30` or `40` should outperform if debt is managed well

### General

- Player should not be able to build the biggest ride immediately without taking debt
- Maintenance should matter
- Debt should be useful but risky
- A park with no new investment should plateau
- Duplicate ride spam should underperform a balanced mix

## Win and Lose Conditions

No hard stop in MVP.

Soft goals:

- Reach park value of `$5,000,000`
- Reach monthly profit of `$250,000`
- Survive `24` months
- Keep satisfaction above `75%`

Soft failure indicators:

- Cash below `0`
- Debt near maximum
- Satisfaction below `50%`
- Reputation below `0.5`

If cash is negative and debt is maxed, show:

> Your park is insolvent. You can continue playing, but you cannot build new rides until cash becomes positive.

## Design Principle

Every month should teach the player something.

The monthly report should explain why numbers changed. The simulation should never feel like a black box.

The desired player reaction is:

> I know why this happened, and I have a plan for next month.
