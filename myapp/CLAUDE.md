# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

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

**Coverage** is always enabled and enforced at 100% (excluding `src/main.tsx` and `src/mocks/browser.ts`).

## Architecture

### Two distinct domains in one app

The app serves two unrelated purposes on the same routing tree:

1. **Gate Board Game** (`/`) — `src/GateComponents/` — game UI with local `useState`, no server state
2. **Fruit Gallery** (`/gallery`, `/:fruitName`) — `src/pages/` — data fetched from `/fruits` API via React Query

### Provider stack (`src/main.tsx`)

```
StrictMode
  QueryClientProvider      ← React Query client
    ReactQueryDevtools
    BrowserRouter
      App
```

MSW is started before React renders. Currently runs in all environments (a TODO in `main.tsx` marks it to be restricted to dev-only).

### Routing (`src/App.tsx`)

```
/             → <GameBoard />          (eager)
/gallery      → <Gallery />            (eager)
/:fruitName   → <Details />            (lazy, code-split)
```

Global `ErrorBoundary` + `Suspense` wrap all routes. `<LoadingOrError>` handles both states.

### Data fetching pattern

All API calls follow this pattern (see `src/api/fruits.ts`):
1. Define a Valibot schema
2. Export the inferred TypeScript type via `v.InferOutput<typeof Schema>`
3. Fetch with `fetch()`, throw on non-ok, then `v.parse(Schema, await res.json())`
4. Consume with `useSuspenseQuery` in components — no loading/error states needed in the component

MSW intercepts `/fruits` in development (handler in `src/mocks/handlers.ts`, static data in `src/mocks/data/fruits.json`).

### Code style (Biome enforced)

- Tabs, single quotes, no semicolons, no trailing commas
- No bracket spacing in objects
- Arrow parens only when needed
- Filenames: camelCase, PascalCase, or kebab-case
- Imports organized automatically

### TypeScript

Very strict — `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noUnusedLocals/Parameters`, `verbatimModuleSyntax` are all on. Use `import type` for type-only imports.

Path alias `@/` maps to `src/`.

### Testing

- **Unit:** Vitest with `happy-dom`, globals enabled (no need to import `describe`/`it`/`expect`)
- **E2E:** Playwright targeting Desktop Chrome + Mobile Chrome (Pixel 5), dev server auto-started
- MSW server lifecycle managed in `src/test-setup.ts`
- Test utilities in `src/test-utils.tsx` (custom render wrapper)
