# Real Estate Command Center

Private real estate operations dashboard for transactions, clients, deadlines, documents, commissions, and daily workflows.

## Stack

- Next.js 15 (App Router, Turbopack)
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- TanStack Query
- Zod + React Hook Form

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — start development server with Turbopack
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — run ESLint

## Project Structure

```
src/
  app/           # App Router routes and layouts
  components/    # Shared UI, layout, and provider components
  features/      # Feature modules (domain-specific UI + logic)
  hooks/         # Shared React hooks
  lib/           # Core libraries and configuration
  services/      # API and external service integrations
  styles/        # Global styles and design tokens
  types/         # Shared TypeScript types
  utils/         # Pure utility helpers
```
