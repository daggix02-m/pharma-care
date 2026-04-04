# PharmaCare Agent Guidelines

This document provides guidelines for agentic coding assistants working on this project.

## Essential Commands

**All commands run from the `program/` directory** (not the repository root)

### Development & Build
```bash
cd program && npm run dev          # Start development server
npm run build                      # Create production build
npm run preview                     # Preview production build locally
```

### Code Quality
```bash
npm run lint                        # Check code for linting errors
npm run lint:fix                    # Auto-fix linting errors
npm run format                      # Format code with Prettier
npm run typecheck                   # TypeScript type checking
```

### Testing
```bash
npm test                            # Run all Vitest tests
npm run test:ui                     # Run tests with UI interface
npm run test:coverage               # Generate coverage report
npm run test -- <path/to/file.test.tsx>  # Run single test file
npx vitest run <pattern>            # Run tests matching pattern
```

## Project Structure

- Working directory: `program/` (root is just a deploy wrapper)
- Source code: `program/src/`
- Path alias: `@/` maps to `src/`
- Components: `components/ui/` (base), `components/dashboard/`, `components/shared/`
- Backend: `convex/` (Convex functions and schema)
- State: `store/` (Zustand stores)

## Code Style Guidelines

### Imports & Organization
- Named imports: `import { useState } from 'react'`
- React imports: `import * as React from 'react'` for forwardRef patterns
- Group imports: React → Third-party → Internal → Types
- Use `@/` alias for internal imports: `import { Button } from '@/components/ui/button'`
- Keep imports at file top, separated by blank line groups

### Formatting (Prettier)
- Semi-colons: required
- Tab width: 2 spaces
- Print width: 100 characters
- Single quotes: `'string'` (including JSX)
- Trailing commas: ES5 style
- JSX single quotes: enabled

### TypeScript
- Strict mode enabled - all types must be defined
- Use interfaces for object shapes: `interface Props { name: string }`
- Use type for unions/intersections: `type Status = 'active' | 'inactive'`
- Explicit return types for exported functions
- No `any` types - use `unknown` or generics when needed
- Path aliases: `@/*` → `src/*`

### Component Conventions
- Functional components with hooks only
- Props as interfaces extending HTML element props when appropriate
```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline'
}
```
- Use forwardRef for components receiving refs
```tsx
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ ...props }, ref) => {...})
Button.displayName = 'Button'
```
- Export components as named exports: `export function MyComponent()`
- Use cn() utility for conditional classes: `cn('base-class', isActive && 'active-class')`
- Use class-variance-authority (cva) for component variants

### Naming Conventions
- Components: PascalCase (e.g., `UserProfile`, `Button`)
- Hooks: camelCase with 'use' prefix (e.g., `useMobile`, `useAuth`)
- Functions/variables: camelCase (e.g., `handleSubmit`, `isLoading`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`, `MAX_RETRIES`)
- Files: kebab-case for services/pages, PascalCase for components (e.g., `user.service.ts`, `UserProfile.tsx`)

### Error Handling
- Use try-catch for async operations with user-friendly error messages
- Show toast notifications for errors: `toast.error('Action failed')`
- Include loading states: `const [loading, setLoading] = useState(false)`
- Validate inputs before API calls
- Return error objects for validation: `{ valid: false, error: 'Message' }`
- Use ErrorBoundary for component-level error catching

### State Management (Zustand)
- Create stores in `store/` directory with `use` prefix: `useSignupStore.ts`
- Initialize with clear state shape
- Provide setter functions for nested state updates
- Include reset functions to clear state
- Use TypeScript for state typing

### Styling with Tailwind
- Use utility classes via `cn()` function
- Component variants with cva for consistent styling
- Custom colors via HSL variables in index.css
- Responsive design with `md:`, `lg:` prefixes
- Use semantic spacing (`p-4`, `gap-2` vs arbitrary values)
- Dark mode support via `dark:` prefix

### Testing with Vitest
- Test files: `*.test.tsx` or `*.test.ts` in component directories
- Use `@testing-library/react` for component testing
- Mock external dependencies (Convex, auth/email providers) in setup or individual tests
- Test user interactions with `@testing-library/user-event`
- Global setup in `src/setupTests.ts` includes ResizeObserver and matchMedia mocks

## Backend (Convex)
- Functions organized by role: `convex/admin/`, `convex/manager/`, etc.
- Separation: `queries.ts` (read), `mutations.ts` (write)
- Types auto-generated in `convex/_generated/` - don't edit
- Schema defined in `convex/schema.ts`

## Environment Variables
- All client-side variables must start with `VITE_`
- Backend keys in `.env.development` (not committed)
- See README.md for required variables (Convex, API URLs)

## Important Notes
- Run `npm run lint:fix` and `npm run format` before committing
- Run `npm run typecheck` to catch type errors
- Components should be mobile-responsive by default
- Use Radix UI primitives for accessible components
- Follow existing component patterns in `components/ui/` when creating new ones
- Keep component files under 300 lines - split if larger

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->
