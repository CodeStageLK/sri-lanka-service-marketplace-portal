# SERV HUB Provider Portal

Independent React, Vite and TypeScript operational application for customers
and service providers. This is the marketplace discovery and account portal.

## Setup

Requires Node.js 22 and pnpm 10.

```powershell
pnpm install
Copy-Item .env.example .env
pnpm dev
```

Set `VITE_API_BASE_URL` to the backend's versioned HTTP(S) API base. Vite
variables are public and must never contain secrets. The development server
uses port 5174. Ensure the backend allows its origin.

## Commands

- `pnpm dev` — development server
- `pnpm build` — type-check and create production build
- `pnpm preview` — preview the production build
- `pnpm lint`, `pnpm typecheck`, `pnpm test` — independent checks

The stack includes React Router, TanStack Query, Zustand, React Hook Form, Zod,
Tailwind CSS and shadcn/ui conventions. No sibling source imports or direct
database access are used.

## Portal responsibilities

- Sign-in and registration use the existing email/password backend. Google
  sign-in is not implemented.
- Public category and service discovery
- Public provider search and profiles
- Customer registration, login and account area
- Individual and business provider registration
- Role-separated provider and customer dashboards
- Accounts with both corresponding roles and profiles can switch between the
  customer and provider dashboards without signing out. Switching changes the
  view; backend authorization still applies.

The existing registration endpoints create separate users; they do not add a
customer or provider profile to an existing account.

The theme control is available on public, authentication and dashboard pages.
The light/dark choice is saved in this application's browser storage.

For an isolated development database only, set `VITE_DEMO_PORTAL_EMAIL` and
`VITE_DEMO_PORTAL_PASSWORD` in an ignored `.env.local` to show one-click
customer and provider login buttons in the development server. Both use the
same real account, which must already have both roles and profiles. These
values are exposed to the browser: never use production credentials or deploy
these settings. The buttons are not included in production builds.

The admin app and portal use the same backend refresh cookies. When testing
different accounts simultaneously, use separate browser profiles so the
sessions do not overwrite each other.
