# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Repository Structure

```
gate_react_vite/
├── myapp/           # React/Vite frontend application
└── infra-aws-cdk/   # AWS CDK infrastructure (S3 static website hosting)
```

---

## myapp — Frontend Application

### Commands

All commands run from `myapp/`:

```bash
pnpm dev          # Start dev server (auto-opens browser at localhost:5173)
pnpm build        # Production build
pnpm preview      # Preview production build

pnpm test         # Unit tests in watch mode
pnpm test:ci      # Unit tests (CI, single run)
pnpm test:e2e     # E2E tests with Playwright UI
pnpm test:e2e:ci  # E2E tests (CI, headless)

pnpm lint         # Run tsc + Biome check
pnpm format       # Format with Biome (write)
pnpm validate     # Full pipeline: lint + test:ci + test:e2e:ci
```

**Running a single test file:**
```bash
pnpm vitest src/utils/useMediaQuery.test.ts
```

**Coverage** is always enabled and enforced at 100% (excluding `src/main.tsx`).

---

### Architecture

#### Two distinct domains in one app

1. **Gate Board Game** (`/`) — `src/GateComponents/` — deck-building game UI with local `useState`, no server state

#### Provider stack (`src/main.tsx`)

```
StrictMode
  BrowserRouter
    App
```

Currently runs in all environments (a TODO marks it to be restricted to dev-only).

#### Routing (`src/App.tsx`)

```
/             → <GameBoard />       (eager)
```

---

### Game Components (`src/GateComponents/`)

```
GateComponents/
├── Boards/GameBoard.tsx      # Main game state (pDeck, pHand, hDeck) — root of all game state
├── Cards/
│   ├── XCard.tsx             # Card with fly-in animation (useLayoutEffect + CSS custom props)
│   └── XCard.css             # --slide-x / --slide-y animation keyframes
├── Rows/
│   ├── EnemyRow/             # 2 enemy card slots + enemy/hero decks
│   ├── VillageRow/           # 4 purchasable village cards
│   ├── PlayerBaseRow/        # 3 base/farm/gate cards + fear tracker
│   └── PlayerHand/           # Animated player hand display
└── Data/PlayerCards.ts       # iCitizenCard interface, CITIZEN_CARD_LIST, GET_CITIZEN_CARD()
```

**Animation pattern in XCard.tsx:** Uses `useLayoutEffect` to snapshot the deck position via `getBoundingClientRect()` and sets CSS custom properties (`--slide-x`, `--slide-y`) before the browser paints, so cards animate FROM the deck TO their hand position.

---

### Code Style (Biome enforced)

- Tabs, single quotes, no semicolons, no trailing commas
- No bracket spacing in objects
- Arrow parens only when needed
- Filenames: camelCase, PascalCase, or kebab-case
- Imports organized automatically

### TypeScript

Very strict — `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noUnusedLocals/Parameters`, `verbatimModuleSyntax` are all on. Use `import type` for type-only imports.

Path alias `@/` maps to `src/`.

### Testing

- **Unit:** Vitest 3 with `happy-dom`, globals enabled (no need to import `describe`/`it`/`expect`)
- **E2E:** Playwright 1.55 targeting Desktop Chrome + Mobile Chrome (Pixel 5), dev server auto-started
- Test utilities in `src/test-utils.tsx` (custom render wrapper with `BrowserRouter`)
- Bail at first failure (`bail: 1`)

---

## infra-aws-cdk — Infrastructure

AWS CDK project (TypeScript). Deploys `myapp` as an S3 static website (HTTP, cheapest option). The stack (`lib/cdk-temp-stack.ts`) defines an S3 bucket with public read access + `BucketDeployment` that uploads `../myapp/dist`.

Commands run from `infra-aws-cdk/`:
```bash
npx cdk deploy   # Deploy stack
npx cdk diff     # Compare with deployed
npx cdk synth    # Synthesize CloudFormation template
```

Tests use Jest (`jest.config.js`).

---

## Key Dependencies

| Package | Version | Purpose |
|---|---|---|
| react | 19.1.1 | UI framework |
| react-router | 7.8.2 | Routing |
| @awesome.me/webawesome | 3.0.0-beta.5 | Web components |
| tailwindcss | 4 | Styling |
| vite | 7 | Build tool |
| vitest | 3.2.4 | Unit testing |
| @playwright/test | 1.55.0 | E2E testing |
| @biomejs/biome | 2.2.2 | Lint + format |
| typescript | 5.9.2 | Type checking |
