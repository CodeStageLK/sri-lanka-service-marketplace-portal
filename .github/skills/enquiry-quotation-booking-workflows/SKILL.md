---
name: enquiry-quotation-booking-workflows
description: "The authoritative state machines for the Sri Lanka Service Marketplace's core transaction: Enquiry, Quotation, and Booking states, allowed transitions and their triggering actors, concurrency rules on acceptance, expiry/timeout policies, domain events emitted per transition, and the notification matrix. Use when implementing or reviewing any state transition, transition endpoint, expiry job, acceptance concurrency handling, or event/notification wiring for enquiries, quotations, or bookings."
license: MIT
metadata:
  category: "project"
  scope: "project"
  project: "sri-lanka-service-marketplace"
  version: "1.0.0"
---

# Enquiry, Quotation, and Booking Workflows

## Purpose

Define the single source of truth for the core transactional state machines. Every transition endpoint, background expiry job, domain event, and notification across all four surfaces must conform to these tables. The database stores the states (`marketplace-database-design`); endpoints expose transitions as verbs (`marketplace-api-design`); this skill defines legality. **All state sets, transition rules, and timeouts below are inferred from the core workflow and are ASSUMPTION until ratified by product**, except where the project context states them directly (multiple quotations per enquiry; customer accepts one; booking created on acceptance).

## When to Use

- Implementing any create/transition endpoint for enquiries, quotations, or bookings.
- Writing expiry/timeout background jobs.
- Handling acceptance races or duplicate transition requests.
- Emitting domain events or wiring notifications for lifecycle changes.
- Reviewing code that touches `status` columns on these tables.

## Enquiry State Machine (ASSUMPTION: full state set)

States: `DRAFT, OPEN, QUOTED, ACCEPTED, CLOSED, EXPIRED, CANCELLED`

| From | To | Trigger | Actor |
|---|---|---|---|
| — | DRAFT | create (save without publish) | Customer |
| DRAFT | OPEN | publish | Customer |
| — | OPEN | create-and-publish | Customer |
| OPEN | QUOTED | first quotation submitted | System (on provider action) |
| OPEN/QUOTED | ACCEPTED | a quotation is accepted | Customer |
| OPEN/QUOTED | CANCELLED | cancel (with reason) | Customer |
| OPEN/QUOTED | EXPIRED | expiry timeout reached | System (job) |
| OPEN/QUOTED | CLOSED | moderation close | Admin |
| ACCEPTED | CLOSED | booking reaches terminal state | System |

Rules: editing allowed only in `DRAFT`, or `OPEN` with zero quotations (ASSUMPTION). `ACCEPTED`, `CLOSED`, `EXPIRED`, `CANCELLED` accept no new quotations. `QUOTED` vs `OPEN` is a convenience distinction; both accept quotations.

## Quotation State Machine (ASSUMPTION: full state set)

States: `SUBMITTED, WITHDRAWN, ACCEPTED, REJECTED, EXPIRED`

| From | To | Trigger | Actor |
|---|---|---|---|
| — | SUBMITTED | submit on an OPEN/QUOTED enquiry | Provider (verified) |
| SUBMITTED | WITHDRAWN | withdraw | Provider |
| SUBMITTED | ACCEPTED | customer accepts | Customer |
| SUBMITTED | REJECTED | explicit rejection OR sibling accepted | Customer / System |
| SUBMITTED | EXPIRED | `valid_until` passed OR enquiry expired | System (job) |

Rules: one active (`SUBMITTED`) quotation per provider per enquiry; revision = withdraw + resubmit (ASSUMPTION). Terminal states: `WITHDRAWN, ACCEPTED, REJECTED, EXPIRED` — no transitions out. Acceptance requires quotation `SUBMITTED` and not past `valid_until`.

## Booking State Machine (ASSUMPTION: full state set)

States: `CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, DISPUTED`

| From | To | Trigger | Actor |
|---|---|---|---|
| — | CONFIRMED | quotation accepted (atomic with acceptance) | System |
| CONFIRMED | IN_PROGRESS | work started | Provider (ASSUMPTION) |
| IN_PROGRESS | COMPLETED | work done + confirmation | ASSUMPTION: provider marks done, customer confirms (two-step); fallback auto-confirm after N days |
| CONFIRMED | CANCELLED | cancel with reason | Customer or Provider (policy windows — ASSUMPTION) |
| IN_PROGRESS | CANCELLED | cancel with reason | Either, admin-reviewable (ASSUMPTION) |
| CONFIRMED/IN_PROGRESS/COMPLETED | DISPUTED | dispute raised | Customer (Provider too — ASSUMPTION) |
| DISPUTED | COMPLETED/CANCELLED | dispute resolved | Admin |

Payment linkage: payment flows attach to `COMPLETED` (or per gateway flow earlier — DECISION PENDING with payment design); a `DISPUTED` booking holds payout to provider (ASSUMPTION).

## Concurrency Rules on Acceptance

Acceptance is the critical section. In one database transaction:

1. Lock the enquiry row (`SELECT ... FOR UPDATE`).
2. Verify enquiry is `OPEN`/`QUOTED` and the target quotation is `SUBMITTED` and unexpired; otherwise abort → 409/422 with stable code (`QUOTATION_NOT_AVAILABLE`, `ENQUIRY_ALREADY_ACCEPTED`).
3. Set quotation → `ACCEPTED`; set all sibling `SUBMITTED` quotations → `REJECTED` (system-rejected, reason `SIBLING_ACCEPTED`); set enquiry → `ACCEPTED`; create booking `CONFIRMED` with amount snapshot.
4. Commit, then emit events (after-commit).

Safety nets: partial unique index (one `ACCEPTED` per enquiry) as the last line of defense; `Idempotency-Key` on the accept endpoint so retries replay the original result; a provider withdrawing concurrently with acceptance loses — whichever transaction commits first wins, the loser gets a clean conflict error.

## Expiry and Timeout Policies (all ASSUMPTION — make configurable)

- Enquiry expiry: configurable window (suggest default 14 days) from publish; warning notification ~48h before; job sets `EXPIRED` and expires child `SUBMITTED` quotations.
- Quotation validity: provider-set `valid_until` (suggest default 7 days, max capped); job sets `EXPIRED`.
- Completion auto-confirm: if provider marked done and customer idle N days (suggest 7), auto-`COMPLETED` with notification.
- Jobs must be idempotent, batch-safe, and respect Asia/Colombo-day semantics for user-facing deadlines while computing in UTC.

## Domain Events per Transition

After-commit events (names per `marketplace-system-architecture`): `enquiry.created|published|cancelled|expired|closed`, `quotation.submitted|withdrawn|accepted|rejected|expired`, `booking.created|started|completed|cancelled|disputed`. Payloads carry ids, actor, prior state, new state, timestamp. Consumers: Notifications, Analytics, Audit Logs, Commissions (on completion/payment). Handlers must be idempotent (event ids).

## Notification Matrix (channels: push=FCM mobile, in-app, email — ASSUMPTION on channel mix)

| Event | Customer | Provider(s) | Admin |
|---|---|---|---|
| enquiry.published | confirmation | matched providers: new lead (push+in-app) | — |
| quotation.submitted | new quotation (push+in-app+email) | submission receipt | — |
| quotation.withdrawn | quotation withdrawn | — | — |
| quotation.accepted | acceptance + booking details | winner: you won; siblings: not selected | — |
| enquiry.expiring/expired | warning, then expired notice | open quotes expiring | — |
| booking.started | work started | — | — |
| booking.completed | review prompt | completion + payout info | — |
| booking.cancelled | notice + reason | notice + reason | flag if repeated (ASSUMPTION) |
| booking.disputed | dispute receipt | dispute notice | dispute queue item |

## Assumptions and Open Questions

- ASSUMPTION: Every state set, transition table, and timeout above beyond the explicitly stated core flow; ratify with product before freezing enums.
- ASSUMPTION: Two-step completion (provider marks done, customer confirms) with auto-confirm fallback.
- ASSUMPTION: Sibling quotations auto-reject on acceptance (vs remaining open) — recommended for clarity.
- ASSUMPTION: Cancellation policy windows and penalties are undefined; record reasons now, enforce policy later.
- DECISION PENDING: where payment initiation sits relative to booking states (depends on gateway flow).
- REQUIRES VERIFICATION: any cooling-off/cancellation rights under Sri Lankan consumer regulations affecting cancellation windows.

## Checklist

- [ ] Transition implemented as a verb endpoint; legality checked against the tables above; illegal transitions return stable error codes.
- [ ] Actor authorization matches the "Actor" column plus ownership checks.
- [ ] Acceptance path uses row locking + sibling rejection + booking creation in one transaction, with idempotency key support.
- [ ] Partial unique indexes in place as invariant backstops.
- [ ] Expiry jobs idempotent, configurable, with pre-expiry warnings.
- [ ] After-commit events emitted with prior/new state; handlers idempotent.
- [ ] Notification matrix rows wired for every transition touched.
- [ ] Any new/changed state or timeout added here first and marked ASSUMPTION until ratified.
