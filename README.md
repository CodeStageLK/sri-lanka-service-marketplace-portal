# SERV HUB Provider Portal

Independent React, Vite and TypeScript application. Phase 1 contains routing,
authentication and dashboard layouts, and a sidebar foundation only.
**Authentication and authorization are not implemented. Do not deploy this
foundation as a protected provider application.**

## Setup

Requires Node.js 22 and pnpm 10.

```powershell
pnpm install
Copy-Item .env.example .env
pnpm dev
```

Set `VITE_API_BASE_URL` to the backend's versioned HTTP(S) API base. Vite
variables are public and must never contain secrets. The development server
uses port 5175. Ensure the backend allows its origin.

## Commands

- `pnpm dev` — development server
- `pnpm build` — type-check and create production build
- `pnpm preview` — preview the production build
- `pnpm lint`, `pnpm typecheck`, `pnpm test` — independent checks

The stack includes React Router, TanStack Query, Zustand, React Hook Form, Zod,
Tailwind CSS and shadcn/ui conventions. No sibling source imports or direct
database access are used.
