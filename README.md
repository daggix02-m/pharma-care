# PharmaCare - Pharmacy Management System

A comprehensive pharmacy management system built with React, Vite, Convex, and Tailwind CSS.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Commands

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

## Environment Variables

Copy `.env.example` to `.env.local` and fill in values:

```
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

- Client-side vars must start with `VITE_`
- `ADMIN_EMAIL` is set in the **Convex Dashboard** (Settings → Environment Variables), not in `.env`
- Convex URL resolution: `VITE_CONVEX_URL` → `NEXT_PUBLIC_CONVEX_URL` → `CONVEX_URL` → build-time env → `CONVEX_DEPLOYMENT`
- `.convex.site` URLs are auto-normalized to `.convex.cloud`

## Project Structure

```
src/
  components/
    admin/           # Admin-specific components
    ai/              # AI assistant components
    dashboard/       # Shared dashboard components
    manager/         # Manager-specific components
    shared/          # Cross-cutting components (auth, messaging, etc.)
    theme/           # ThemeProvider, ThemeToggle
    ui/              # Base UI primitives (Radix-based)
  constants/         # App-wide constants (roles, status, timeouts)
  contexts/          # React contexts (AuthContext)
  hooks/             # Custom hooks
  layouts/           # Page layout components
  lib/               # Utility functions (cn, formatDateTime, animations)
  pages/
    auth/            # Login, signup, password reset, etc.
    dashboard/
      admin/         # Admin dashboard & sub-pages
      cashier/       # Cashier pages
      manager/       # Manager dashboard
      owner/         # Owner dashboard & sub-pages
      pharmacist/    # Pharmacist dashboard & sale creation
    landing/         # Public landing page sections
    subscription/    # Payment flow
  services/          # External service clients (chapa, ai)
  store/             # Zustand stores (useSignupStore, useThemeStore)
  types/             # Type declarations

convex/
  _generated/        # Auto-generated — never edit
  admin/             # Admin queries/mutations
  auth/              # Auth queries/mutations
  cashier/           # Cashier queries/mutations
  lib/               # Shared helpers (auth, email, permissions, utils)
  manager/           # Manager queries/mutations
  notifications/     # Notification queries/mutations
  owner/             # Owner queries/mutations
  pharmacist/        # Pharmacist queries/mutations
  public/            # Public (unauthenticated) queries
  subscription/      # Subscription queries/mutations
  users/             # User management queries/mutations
  schema.ts          # Database schema (20+ tables)
  seed.ts            # Seed data
  crons.ts / cron.ts # Scheduled jobs
  stockTransfers.ts  # Stock transfer logic
```

## Roles

| Role       | Scope                                     |
| ---------- | ----------------------------------------- |
| Admin      | Platform-wide management, user oversight  |
| Owner      | Pharmacy management, branch setup         |
| Manager    | Branch operations, staff, inventory       |
| Pharmacist | Prescriptions, inventory, stock receiving |
| Cashier    | POS transactions, receipts, sessions      |

## Deployment (Vercel)

- **Framework**: Vite
- **Build command**: `npm run build`
- **Output directory**: `dist/`
- **Root directory**: `./` (repo root — not `program/`)
- SPA rewrite and security headers are in `vercel.json`

## Tech Stack

- React 18, Vite 6, React Router 7, Tailwind CSS 3, Radix UI
- Convex (backend + auth), Zustand (state), React Query (server state)
- Lucide (icons), Recharts (charts), GSAP (animations), Sonner (toasts)
- ESLint, Prettier, Vitest + Testing Library
