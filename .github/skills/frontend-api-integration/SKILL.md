---
name: frontend-api-integration
description: "Frontend API integration: TanStack Query keys/invalidation/mutations/optimistic updates, API client layer with auth token refresh, zod-validated typed contracts, error normalization, and loading/empty/error UI states. Use when wiring a frontend to a REST API, setting up TanStack Query, building a fetch/axios wrapper, handling 401 refresh flows, validating API responses, or implementing pagination/infinite scroll."
license: MIT
metadata:
  category: "frontend"
  scope: "universal"
  version: "1.0.0"
---

# Frontend API Integration

## Purpose

Rules for connecting a frontend to HTTP APIs: a single client layer, schema-validated contracts, TanStack Query for caching and mutations, normalized errors, and complete UI state handling. Eliminates ad-hoc fetch effects, silent contract drift, and half-handled error states.

## When to Use

- Setting up data fetching in a React app
- Writing queries, mutations, or optimistic updates
- Building/refactoring the API client (interceptors, auth refresh)
- Validating API responses or handling contract mismatches
- Implementing pagination or infinite scrolling
- Reviewing loading/empty/error state coverage

## API Client Layer

One client module wraps fetch/axios; nothing else in the app touches HTTP directly:

- Responsibilities: base URL from config, JSON (de)serialization, auth header injection, token refresh, error normalization, timeouts/aborts.
- Components and hooks never see raw `fetch`, raw `Response`, or axios errors — only typed functions (`api.getInvoices()`) and normalized errors.
- Non-2xx must become thrown typed errors (fetch does NOT throw on 404/500 — check `res.ok`).
- **401 refresh flow:** on 401, refresh once and retry the original request; queue concurrent requests behind a single in-flight refresh promise (no refresh stampede); if refresh fails, clear session and redirect to login. Never loop (one retry max; never retry the refresh endpoint itself).
- Pass `AbortSignal` through to fetch so the query layer can cancel (TanStack Query provides `signal` to `queryFn`).

## Typed Contracts: zod at the Boundary

- Define a zod schema per endpoint response; infer the type; `safeParse` in the API function:

```ts
const InvoiceList = z.object({
  items: z.array(Invoice),
  nextCursor: z.string().nullable(),
});

export async function getInvoices(cursor?: string, signal?: AbortSignal) {
  const json = await http.get("/invoices", { params: { cursor }, signal });
  const parsed = InvoiceList.safeParse(json);
  if (!parsed.success) throw new ApiError("contract", { cause: parsed.error });
  return parsed.data;
}
```

- A contract failure is a bug, not a user error: log/report it distinctly; show a generic failure to the user.
- Validate request payloads with schemas too (often shared with the form's schema).
- If the backend publishes OpenAPI, generate the client/types (`openapi-typescript`, orval) instead of hand-writing schemas — but still fail loudly on mismatch.

## Query Keys and Caching

- Keys are hierarchical arrays mirroring the resource: `["invoices"]`, `["invoices", "list", filters]`, `["invoices", "detail", id]`. Centralize in a key factory so invalidation can't typo:

```ts
export const invoiceKeys = {
  all: ["invoices"] as const,
  list: (filters: Filters) => [...invoiceKeys.all, "list", filters] as const,
  detail: (id: string) => [...invoiceKeys.all, "detail", id] as const,
};
```

- Every variable the `queryFn` uses must be in the key — that's what makes caching and refetch-on-change correct.
- Set a deliberate `staleTime` per resource (e.g., 30–60s default, higher for static reference data); default `0` causes aggressive refetching that teams then "fix" wrongly.
- `enabled: !!id` for dependent queries; never call hooks conditionally.
- Wrap queries in feature hooks (`useInvoices(filters)`) — components never write `useQuery` with inline keys/fns.

## Mutations, Invalidation, Optimistic Updates

- Mutations via `useMutation`; on success, invalidate the narrowest affected keys:

```ts
const qc = useQueryClient();
const createInvoice = useMutation({
  mutationFn: api.createInvoice,
  onSuccess: () => qc.invalidateQueries({ queryKey: invoiceKeys.all }),
});
```

- Prefer invalidation (refetch truth from server) over manual `setQueryData` surgery; use `setQueryData` to seed detail from a list or when refetch is genuinely too costly.
- Optimistic updates only for high-frequency, high-success interactions (toggles, likes, reorders) — full pattern or nothing: `onMutate` (cancel queries, snapshot, write optimistic) → `onError` (rollback snapshot) → `onSettled` (invalidate). Skipping rollback or final invalidation leaves the cache lying.
- Disable/indicate the trigger with `isPending`; guard double-submits.
- Side effects that must happen regardless of which screen is mounted (toasts, analytics) go in the mutation defaults, not in components.

## Error Normalization

Normalize all failures into one discriminated shape at the client layer:

```ts
type ApiError =
  | { kind: "network" }                               // offline, DNS, timeout
  | { kind: "http"; status: number; code?: string; message: string }
  | { kind: "validation"; fieldErrors: Record<string, string[]> } // 422
  | { kind: "auth" }                                  // 401 after failed refresh
  | { kind: "contract"; cause: unknown };             // zod mismatch
```

- UI switches on `kind`: network → retry prompt; validation → map to form fields (`setError`); auth → session expiry flow; http 5xx/contract → generic error + report.
- Retry policy: retry network/5xx (Query's default backoff is fine) but **never** retry 4xx — `retry: (count, err) => err.kind === "network" && count < 3`-style logic in query defaults.
- One global `QueryCache`/`MutationCache` `onError` for logging/toasting unexpected errors; per-call handlers only for specific UX.

## UI States: Loading / Empty / Error / Success

Every data view must handle all four explicitly — empty is not an error, and `undefined` data is not "no results":

```tsx
const { data, isPending, isError, error, refetch } = useInvoices(filters);
if (isPending) return <InvoiceListSkeleton />;
if (isError) return <ErrorState error={error} onRetry={refetch} />;
if (data.items.length === 0) return <EmptyState action={<CreateInvoiceButton />} />;
return <InvoiceTable items={data.items} />;
```

- Skeletons shaped like real content (not spinners) for primary views; avoid layout shift.
- Distinguish initial load (`isPending`) from background refresh (`isFetching`) — never blank out existing data for a refetch; show a subtle indicator instead.
- `keepPreviousData`/`placeholderData: keepPreviousData` for paginated/filterable lists so the old page stays visible while the next loads.
- Empty states carry a next action (create, clear filters), not just "No data".

## Pagination and Infinite Queries

- Paged UIs (tables): `useQuery` with page/filters in the key + `placeholderData: keepPreviousData`; prefetch the next page on hover/idle (`qc.prefetchQuery`).
- Feeds: `useInfiniteQuery` with cursor-based pagination — `getNextPageParam: (last) => last.nextCursor ?? undefined`; render `data.pages.flatMap(p => p.items)`; trigger `fetchNextPage` from an IntersectionObserver sentinel, guarded by `hasNextPage && !isFetchingNextPage`.
- Prefer cursors over offsets for feeds (offsets skip/duplicate under concurrent writes).
- After a mutation affecting a long infinite list, invalidate rather than hand-patching every page.

## Common Mistakes

- **`useEffect` + `useState` hand-rolled fetching** → TanStack Query; it owns caching, dedupe, retries, races.
- **Fetch without `res.ok` check "succeeding" on 500** → client layer throws typed errors on non-2xx.
- **`as ApiResponse` on `res.json()`** → zod `safeParse`; contract errors reported as bugs.
- **Inline ad-hoc query keys, missed invalidations** → key factory; keys include all queryFn inputs.
- **Refresh stampede: N requests → N refresh calls** → single shared refresh promise; one retry; logout on failure.
- **Optimistic update without rollback/final invalidate** → full onMutate/onError/onSettled pattern or drop optimism.
- **Retrying 4xx responses** → retry only network/5xx.
- **Spinner replacing existing list during refetch** → `isFetching` indicator + `keepPreviousData`.
- **Empty array rendered as blank screen** → explicit EmptyState with an action.
- **Components importing axios/fetch directly** → all HTTP through the client layer and feature hooks.

## Checklist

- [ ] Single API client module; no raw fetch/axios outside it
- [ ] Non-2xx throws; errors normalized into a discriminated ApiError
- [ ] 401 handling: one shared refresh, single retry, queued concurrents, logout on failure
- [ ] Every response zod-parsed; contract failures reported separately from user errors
- [ ] Query keys from a central factory; include all queryFn inputs; deliberate staleTime
- [ ] Queries/mutations wrapped in feature hooks
- [ ] Mutations invalidate narrowest keys; optimistic updates have snapshot/rollback/settle
- [ ] Retry policy excludes 4xx
- [ ] All views handle loading/error/empty/success; refetch doesn't blank existing data
- [ ] Pagination uses keepPreviousData; infinite feeds use cursors + guarded fetchNextPage
