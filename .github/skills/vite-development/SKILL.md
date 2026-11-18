---
name: vite-development
description: "Vite configuration and workflow: env variables, path aliases, dev server proxy, code splitting, build/chunking optimization, asset handling, and library mode. Use when configuring vite.config.ts, setting up VITE_ env vars or import.meta.env, adding an API proxy, fixing build size or chunking issues, handling static assets, or packaging a library with Vite."
license: MIT
metadata:
  category: "frontend"
  scope: "universal"
  version: "1.0.0"
---

# Vite Development

## Purpose

Practical rules for configuring and operating Vite projects: environment handling, aliases, dev proxying, production build tuning, and the app-vs-library distinction. Targets Vite 5+.

## When to Use

- Creating or modifying `vite.config.ts`
- Managing environment variables and build modes
- Configuring a dev proxy to a backend API
- Diagnosing large bundles or bad chunk splits
- Importing static assets, workers, or WASM
- Building a publishable library with Vite

## Base Config

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
```

- Always use `defineConfig` for typing; prefer `vite.config.ts` over `.js`.
- When aliasing, mirror the alias in `tsconfig.json` (`"paths": { "@/*": ["./src/*"] }`) — Vite and tsc resolve independently, both must agree. Or use `vite-tsconfig-paths` to derive aliases from tsconfig.
- Keep config declarative and small; use the function form `defineConfig(({ mode }) => ...)` only when config genuinely varies by mode.

## Environment Variables

- Only variables prefixed `VITE_` are exposed to client code via `import.meta.env.VITE_X`. Everything else stays server-side — never rename a secret to `VITE_*` to "make it work"; anything `VITE_` ships in the bundle, readable by every user.
- File precedence: `.env` < `.env.local` < `.env.[mode]` < `.env.[mode].local`. Commit `.env` / `.env.[mode]` defaults; gitignore `*.local`.
- `import.meta.env.MODE` is the mode (`development`/`production`/custom via `--mode staging`); `DEV`/`PROD` are booleans. Values are statically replaced at build — no dynamic key access (`import.meta.env[key]` fails).
- Type them in `src/vite-env.d.ts`:

```ts
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}
```

- Validate env at startup (zod) into one typed config module; import config, never `import.meta.env`, throughout the app.

## Dev Server Proxy

Avoid CORS in development by proxying API calls:

```ts
server: {
  proxy: {
    "/api": {
      target: "http://localhost:8000",
      changeOrigin: true,
      // rewrite: (p) => p.replace(/^\/api/, ""), // if backend has no /api prefix
    },
  },
},
```

- Client code calls relative `/api/...` paths; same code works in prod behind a reverse proxy.
- `changeOrigin: true` for virtual-host backends; `secure: false` only for local self-signed TLS.
- The proxy is dev-only (`vite dev` / `vite preview --config`); production routing is the deployment's job — document that assumption.

## Code Splitting and Dynamic Imports

- `import()` creates a chunk automatically. Split at route boundaries first (`React.lazy(() => import("./pages/Settings"))`), then at heavy below-the-fold widgets (charts, editors, maps).
- Dynamic import paths must be static strings or constrained globs — fully dynamic runtime paths can't be analyzed. Use `import.meta.glob("./modules/*.ts")` for pattern-based loading.
- Don't split tiny modules; each chunk costs a request. Target meaningful units (>20 kB pre-gzip as a rule of thumb).

## Build Optimization

- Measure before tuning: `npx vite-bundle-visualizer` or `rollup-plugin-visualizer` to see what's actually in the bundle.
- Manual chunks for stable vendor caching:

```ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        react: ["react", "react-dom", "react-router-dom"],
      },
    },
  },
},
```

- Keep `manualChunks` coarse (2–4 vendor groups). Over-splitting creates request waterfalls; circular chunk warnings mean your groups cut across import graphs — merge them.
- `build.target: "es2022"` (or your real browser floor) to avoid unnecessary transpilation; `build.sourcemap: true` for production debugging if your error tracker supports it.
- Watch `chunkSizeWarningLimit` warnings — fix by splitting/lazy-loading, not by raising the limit.
- `@vitejs/plugin-react` + default esbuild minify is correct for most apps; don't add Babel plugins without need.

## Asset Handling

- Import assets to get hashed URLs: `import logo from "./logo.svg"` → fingerprinted path, cache-safe. CSS `url()` and `<img src>` in templates processed the same way.
- `public/` is for files needed verbatim at root (`robots.txt`, `favicon.ico`, files referenced by absolute URL at runtime). Nothing in `public/` is hashed or tree-shaken — don't dump images there by default.
- Suffix queries: `?url` (URL string), `?raw` (file contents as string), `?worker` / `new Worker(new URL("./w.ts", import.meta.url), { type: "module" })` for workers.
- Small assets inline as base64 below `build.assetsInlineLimit` (default 4 kB) — fine; raise/lower only with evidence.

## App Mode vs Library Mode

- App (default): produces `index.html` + hashed assets; deps bundled.
- Library: set `build.lib` with `entry`, `formats: ["es"]`, and externalize peer deps:

```ts
build: {
  lib: { entry: "src/index.ts", formats: ["es"] },
  rollupOptions: { external: ["react", "react-dom", "react/jsx-runtime"] },
},
```

- Libraries must externalize `react`/framework peers or consumers get duplicate-React bugs. Generate types with `vite-plugin-dts` or a separate `tsc --emitDeclarationOnly` pass. Set `"sideEffects": false` in package.json if true, for consumer tree-shaking.

## Dev / Build / Preview Workflow

- `vite` (dev): native ESM, unbundled, esbuild-transformed — fast but NOT what ships.
- `vite build`: Rollup production bundle. `vite preview`: serves the built output locally — always smoke-test with preview before release; dev-only issues (proxy, env, import.meta.glob behavior) surface here.
- CI must run: `tsc --noEmit && vite build` — Vite does not type-check; esbuild strips types silently.

## Common Mistakes

- **Secret in a `VITE_` variable** → `VITE_` vars are public; keep secrets server-side, expose only public config.
- **Alias works in Vite but tsc errors (or vice versa)** → sync `resolve.alias` with tsconfig `paths` or use `vite-tsconfig-paths`.
- **`process.env.X` in client code** → use `import.meta.env.VITE_X`; `process` doesn't exist in the browser.
- **Fully dynamic `import(variable)` fails in build** → static paths or `import.meta.glob`.
- **CORS errors in dev** → configure `server.proxy`, don't disable CORS on the backend or use browser flags.
- **Raising `chunkSizeWarningLimit` to hide big bundles** → analyze and split instead.
- **Images in `public/` referenced by hardcoded paths** → import from `src/` for hashing and dead-asset detection.
- **Assuming `vite build` catches type errors** → add `tsc --noEmit` to CI.
- **Library bundling React** → externalize all peer dependencies in `rollupOptions.external`.

## Checklist

- [ ] `vite.config.ts` uses `defineConfig`; aliases synced with tsconfig paths
- [ ] All client env vars `VITE_`-prefixed, typed in `vite-env.d.ts`, validated at startup; no secrets
- [ ] `.env.local` / `.env.*.local` gitignored; shared defaults committed
- [ ] Dev API calls go through `server.proxy` with relative paths
- [ ] Routes and heavy widgets code-split via dynamic import
- [ ] Bundle analyzed with a visualizer before any `manualChunks` tuning
- [ ] Assets imported from `src/` (hashed); `public/` only for verbatim root files
- [ ] CI runs `tsc --noEmit` and `vite build`; release smoke-tested with `vite preview`
- [ ] Library builds externalize peers and ship `.d.ts` files
