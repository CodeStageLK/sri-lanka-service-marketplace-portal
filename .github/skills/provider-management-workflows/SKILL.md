---
name: provider-management-workflows
description: "Provider-side journeys for the Sri Lanka Service Marketplace: adding the PROVIDER role to an existing account, business profile setup, verification submission, service listing and coverage-area management, portfolio and availability, the enquiry inbox and matching, quotation composition/withdrawal, booking fulfillment, subscription tier effects, and performance analytics. Use when building or reviewing provider portal or mobile provider-mode features, provider endpoints, enquiry matching, or quotation flows."
license: MIT
metadata:
  category: "project"
  scope: "project"
  project: "sri-lanka-service-marketplace"
  version: "1.0.0"
---

# Provider Management Workflows

## Purpose

Define the provider's lifecycle and daily workflows — from upgrading an account with the PROVIDER role through winning and fulfilling work — so the provider portal (surface 2) and Flutter provider mode (surface 4) behave identically against the shared backend. Providers are individuals, professionals, or businesses offering services across Sri Lanka.

## When to Use

- Building provider onboarding, profile, service listing, portfolio, or availability features.
- Implementing the provider enquiry inbox or enquiry-provider matching.
- Building quotation composition, submission, or withdrawal.
- Wiring subscription tiers to provider-facing behavior.
- Building the provider analytics/performance view.

## Becoming a Provider (On an Existing Account)

- Any user (or new registrant) adds the PROVIDER role to their existing account — "Become a provider" flow. Never a separate account; the user can role-switch between customer and provider experiences afterwards (see `marketplace-authentication-authorization`).
- Flow: accept provider terms → create ProviderProfile (display/business name, provider type INDIVIDUAL/BUSINESS — ASSUMPTION, description, contact) → choose categories and coverage areas → optionally start verification immediately.
- Initial status: `UNVERIFIED`; the profile exists but capability gates apply (see below and `provider-verification`).
- ASSUMPTION: free listing tier is the default on signup; paid options offered during onboarding.

## Business Profile Setup

- Profile fields: business/display name, description, provider type, contact phone (+94), service categories, coverage areas (province/district/DS-division selections; selecting a district implies its DS divisions — ASSUMPTION), business hours, profile photo/logo.
- Public profile (surface 1, SEO-relevant) renders: name, verified badge, description, services, coverage, portfolio, rating/review aggregates. Sensitive/internal fields never leak to the public DTO.
- Profile completeness indicator encourages quality (ASSUMPTION: completeness affects ranking — mark as product decision).

## Verification Submission

- Provider submits identity/business documents from profile settings; full workflow, document types, statuses, and storage rules are owned by `provider-verification` — follow that skill.
- Provider-side UX: clear status banner (`UNVERIFIED`/`PENDING`/`VERIFIED`/`REJECTED` with reason), resubmission path, and explanation of what verification unlocks.

## Service Listing Management

- Providers create Service listings: category (from admin-managed tree), title, description, pricing approach (ASSUMPTION: `FIXED` price-from, `HOURLY` rate, or `QUOTE_BASED`), photos.
- Coverage areas can be set per provider and optionally refined per service (ASSUMPTION: launch with provider-level coverage only; per-service coverage is a later enhancement — DECISION PENDING).
- Lifecycle: draft → published → unpublished/archived (soft delete). ASSUMPTION: publishing requires VERIFIED status; drafts allowed while unverified.
- Category changes re-run matching eligibility for future enquiries only; existing quotations are unaffected.

## Portfolio and Availability

- Portfolio: photo galleries of past work (S3 upload via presigned URLs; camera capture on mobile), optional captions. Moderation hooks for reported content (ASSUMPTION).
- Availability: business hours plus ad-hoc unavailability ("away" dates). ASSUMPTION: availability is informational at launch (shown to customers and used to pause lead notifications), not a hard booking calendar — confirm with product.

## Enquiry Inbox and Matching

- The inbox lists open enquiries relevant to the provider — these are the platform's **leads**.
- RECOMMENDED matching rule (ASSUMPTION — ratify as product decision): enquiry matches a provider when (a) enquiry category equals or is a descendant of one of the provider's service categories AND (b) enquiry location falls within the provider's coverage areas (any hierarchy level matches its descendants). Only `OPEN` enquiries appear; providers with `SUSPENDED` status see nothing.
- Delivery: inbox endpoint (`/providers/me/enquiries` per `marketplace-api-design`) + push notification (FCM) on new matching enquiries; notification frequency capping is configurable (ASSUMPTION).
- Lead-generation fees: the revenue model includes lead fees; ASSUMPTION: whether fees apply per lead view, per quotation, or via subscription allowances is undecided — model lead access as a checked, auditable action so any fee model can attach later.
- Providers never see customer contact details pre-acceptance (ASSUMPTION, consistent with `customer-marketplace-workflows`).

## Quotation Composition, Submission, Withdrawal

- Compose: amount (LKR, positive, NUMERIC-safe), scope/notes, validity period (`valid_until` — ASSUMPTION: default configurable, e.g., 7 days).
- Gates: must be VERIFIED (ASSUMPTION per verification gates); enquiry must be `OPEN`/`QUOTED`; one active quotation per provider per enquiry — revise by withdrawing and resubmitting (ASSUMPTION).
- Withdrawal allowed while not accepted; after acceptance, changes go through booking amendment/dispute paths, not quotation edits.
- Outcomes: accepted → booking created, provider notified "you won"; sibling quotations auto-rejected with notification. Full state machine in `enquiry-quotation-booking-workflows`.

## Booking Fulfillment

- Provider sees bookings with customer contact (post-acceptance), agreed amount snapshot, schedule.
- Provider actions: confirm start (`IN_PROGRESS`), mark work done; completion confirmation side (provider vs customer vs both) is an ASSUMPTION — see state machine skill. Cancellation by provider is allowed pre-completion with reason and is tracked as a performance signal (ASSUMPTION).
- Payment and commission deduction follow `marketplace-payments-commissions`; provider sees net amount (after commission) per booking.

## Subscription Tiers and Analytics

- Subscription packages affect provider benefits. ASSUMPTION (all specifics pending product definition): tiers may influence search ranking boost, number of leads/quotations per period, portfolio limits, badge/placement, and reduced commission or lead fees. Implement tier effects as capability flags resolved server-side from the active subscription — never hardcode tier names in feature logic.
- Performance analytics view (read-only, backend-aggregated): profile views, leads received, quotations sent, win rate, bookings completed, earnings (gross/net LKR), rating trend. ASSUMPTION: exact metric set; align with Analytics module.

## Journey-to-State Mapping Summary

| Provider step | Entity + state effect | Endpoint (per `marketplace-api-design`) |
|---|---|---|
| Become provider | PROVIDER role grant + ProviderProfile (UNVERIFIED) | `POST /providers` |
| Submit verification | VerificationSubmission → PENDING | `POST /providers/me/verification` |
| Publish service | Service draft → published | `POST /services/{id}/publish` (VERIFIED gate) |
| View lead inbox | matched OPEN enquiries | `GET /providers/me/enquiries` |
| Submit quotation | Quotation → SUBMITTED | `POST /enquiries/{id}/quotations` |
| Withdraw quotation | Quotation → WITHDRAWN | `POST /quotations/{id}/withdraw` |
| Start work | Booking → IN_PROGRESS | `POST /bookings/{id}/start` |
| Mark done | Booking completion step | `POST /bookings/{id}/mark-done` (ASSUMPTION: two-step completion) |
| Subscribe | ProviderSubscription ACTIVE | `POST /subscriptions` |

## Notification Touchpoints (Provider Side)

- New matching enquiry (lead): push (FCM) + in-app; capped frequency per provider settings.
- Quotation outcome: accepted ("you won", with booking details) or system-rejected ("not selected").
- Quotation/enquiry expiring: reminder before `valid_until` or enquiry expiry.
- Verification decision: approved/rejected with reason; suspension notices.
- Booking lifecycle: customer confirmation, cancellation, dispute raised, payment/payout status.
- Subscription: renewal reminders, payment failures, tier changes.

## Assumptions and Open Questions

- ASSUMPTION: Matching = category (incl. descendants) + coverage area; ratify before building ranking on top.
- ASSUMPTION: Publishing services and submitting quotations require VERIFIED status.
- ASSUMPTION: One active quotation per provider per enquiry; revisions via withdraw+resubmit.
- ASSUMPTION: Availability is informational at launch; no hard calendar.
- ASSUMPTION: Subscription benefit specifics and lead-fee charging model are undefined — build behind server-side capability flags.
- REQUIRES VERIFICATION: Business registration document requirements for BUSINESS-type providers in Sri Lanka (owned by `provider-verification`).
- REQUIRES VERIFICATION: Tax/invoicing obligations for provider earnings and platform fees.

## Checklist

- [ ] Provider features work identically in the web portal and Flutter provider mode; role switching preserved.
- [ ] Capability gates (verification status, subscription flags) enforced server-side via guards, not UI hiding.
- [ ] Matching uses category-descendant + coverage-area rules; inbox shows only OPEN enquiries.
- [ ] Quotation operations respect the one-active-per-enquiry rule and the shared state machine.
- [ ] Lead access is logged/auditable to support any future fee model.
- [ ] Subscription effects implemented as capability flags, not tier-name conditionals.
- [ ] Customer contact details withheld until acceptance.
- [ ] New business-rule guesses marked ASSUMPTION; legal/document matters deferred to REQUIRES VERIFICATION items.
