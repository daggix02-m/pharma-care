# PharmaCare Agent Guidelines

## Commands

All commands run from the repo root.

```bash
npm run dev              # Start Vite dev server
npm run build            # Production build
npm run lint             # ESLint check
npm run lint:fix         # ESLint auto-fix
npm run format           # Prettier format all files
npm run typecheck        # tsc --noEmit
npm test                 # Vitest (all tests)
npm run test:ui          # Vitest with UI
npm run test:coverage    # Vitest with coverage
npx vitest run <path>    # Run a single test file
```

Run quality checks in this order before committing: `lint:fix → format → typecheck`

## Architecture

**Path aliases** (vite.config.js + tsconfig.json):
- `@/` → `src/`
- `@convex/` → `convex/`

**Frontend entry**: `src/main.tsx` → `src/App.tsx` (React Router with lazy-loaded dashboard pages)

**Backend (Convex)**: `convex/` — file-based routing, organized by role:
- `convex/admin/`, `convex/manager/`, `convex/owner/`, `convex/pharmacist/`, `convex/cashier/` — role-scoped queries/mutations
- `convex/public/`, `convex/auth/`, `convex/users/`, `convex/notifications/`, `convex/subscription/`, `convex/lib/` — shared modules
- `convex/schema.ts` — database schema (20+ tables)
- `convex/_generated/` — auto-generated, never edit

**Roles**: admin, owner, manager, pharmacist, cashier. Each has dashboard pages under `src/pages/dashboard/<role>/`.

**Auth**: Custom `AuthContext` in `src/contexts/AuthContext.tsx` using `@convex-dev/auth`. Uses `ConvexProvider` (not `ConvexProviderWithAuth`).

**State**: Zustand stores in `src/store/` (`useSignupStore.ts`, `useThemeStore.ts`)

## Key Conventions

- **Components**: Named exports, `React.forwardRef` + `displayName` for UI primitives. Follow patterns in `src/components/ui/`.
- **No barrel files**: Import components directly by path (e.g., `@/components/shared/ErrorBoundary`), not from barrel index files. Barrel files prevent tree-shaking.
- **Styling**: Tailwind + `cn()` utility + `class-variance-authority` (cva). Custom colors via HSL CSS variables in `src/index.css`. Fonts: Outfit (display), DM Sans (body).
- **TypeScript**: Strict mode, `noUnusedLocals` + `noUnusedParameters`. Use `interface` for object shapes, `type` for unions. No `any` — use `unknown` or generics.
- **Formatting**: Prettier — single quotes, semi-colons, 2-space tabs, 100 char print width, ES5 trailing commas.
- **Linting**: ESLint config `react-app` + `react-app/jest` + `eslint-config-prettier` + `eslint-plugin-react-refresh`. Extends are inline in `package.json` (no `.eslintrc` file).
- **Tests**: Vitest + jsdom environment. Setup in `src/setupTests.ts` (ResizeObserver + matchMedia mocks). Use `@testing-library/react` + `@testing-library/user-event`.
- **Keep components under 300 lines** — split if larger.

## Directory Layout

```
src/components/       # UI components — import directly, no barrel files
  admin/             # Admin-specific (FlagAccountDialog, LockAccountDialog)
  ai/                # AI assistant (AIChatInterface, AIFloatingButton)
  dashboard/         # Shared dashboard components (LiveSalesDashboard, TopBar, etc.)
  manager/           # Manager-specific (StaffActivityTimeline, StockTransferModal)
  shared/            # Cross-cutting (ErrorBoundary, AuthLayout, StatusBadge, etc.)
  theme/             # ThemeProvider, ThemeToggle
  ui/                # Base UI primitives (Radix-based)

src/lib/             # Utilities — cn(), formatDateTime(), animations
src/services/        # External service clients (chapa, ai)
src/store/           # Zustand stores
convex/              # Backend functions, organized by role
```

## Convex

Read `convex/_generated/ai/guidelines.md` before working on Convex code.

Key rules from the guidelines:
- Always include argument validators on all functions
- Never use `.filter()` in queries — use `.withIndex()` instead
- Use `.take(n)` or paginate instead of `.collect()` for bounded results
- Never use `.collect().length` — maintain a denormalized counter instead
- Use `ctx.db.patch()` for partial updates, `ctx.db.replace()` for full replacements
- Actions needing Node.js built-ins: add `"use node";` at file top, in a separate file from queries/mutations
- `fetch()` is available in the default Convex runtime — no need for `"use node"` just for `fetch()`
- Auth identity: prefer `identity.tokenIdentifier` over `identity.subject`

## Environment

- Client-side env vars must start with `VITE_` (or `NEXT_PUBLIC_`, both supported via `envPrefix` in vite.config.js)
- `ADMIN_EMAIL` is a Convex environment variable — set it in the Convex Dashboard, not in `.env`
- Convex URL resolution chain: `VITE_CONVEX_URL` → `NEXT_PUBLIC_CONVEX_URL` → `CONVEX_URL` → `VITE_CONVEX_SITE_URL` → `NEXT_PUBLIC_CONVEX_SITE_URL` → build-time env → `CONVEX_DEPLOYMENT`
- `.convex.site` URLs are auto-normalized to `.convex.cloud` at both build-time and runtime

## Deployment (Vercel)

- Framework: Vite. Build command: `npm run build`. Output: `dist/`
- SPA routing: `vercel.json` rewrites all routes to `/index.html`
- Security headers configured in `vercel.json` (X-Content-Type-Options, X-Frame-Options DENY, etc.)
- Bundle chunking: vendor (react/router), ui (radix/lucide), charts (recharts), utils (clsx/date-fns/gsap)