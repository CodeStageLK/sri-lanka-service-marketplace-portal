---
name: marketplace-product-domain
description: "Defines the ubiquitous language, actors, core entities, relationships, and domain invariants of the Sri Lanka Service Marketplace, centered on the enquiry→quotation→booking→payment→review lifecycle. Use when naming entities or fields, modeling domain objects, writing user stories, resolving terminology disputes, or validating that a feature respects marketplace domain rules and the one-account multi-role model."
license: MIT
metadata:
  category: "project"
  scope: "project"
  project: "sri-lanka-service-marketplace"
  version: "1.0.0"
---

# Marketplace Product Domain

## Purpose

Establish a single, authoritative vocabulary and domain model for the Sri Lanka Service Marketplace ("Every Service. One Platform.") so that all code, APIs, database schemas, UI copy, and documentation across the four surfaces (public website, customer/provider web app, admin dashboard, Flutter mobile app) use the same terms with the same meanings. All business logic lives in the NestJS backend; this skill defines what that logic talks about.

## When to Use

- Naming entities, DTOs, database tables, API resources, or UI labels.
- Writing or reviewing user stories, acceptance criteria, or module boundaries.
- Deciding which actor may perform an action, or what state an entity may be in.
- Checking a new feature against domain invariants before implementation.
- Onboarding engineers or agents onto the project.

## Ubiquitous Language Glossary

| Term | Definition |
|---|---|
| **Customer** | A user acting in the CUSTOMER role: discovers services, posts Enquiries, compares Quotations, accepts one, pays, and reviews. |
| **Provider** | A user acting in the PROVIDER role: an individual, professional, or business offering services; maintains a Provider Profile, submits Quotations, fulfills Bookings. |
| **Admin** | Platform staff operating the web-only admin dashboard: verification review, dispute management, category/location management, analytics, configuration. |
| **Service** | A specific offering a Provider lists (e.g., "AC repair"), attached to a Category and coverage Locations. |
| **Category** | A hierarchical classification of services (e.g., Home Services → Plumbing). Managed by Admin. |
| **Location** | A node in Sri Lanka's administrative hierarchy: Province (9) → District (25) → DS Division. Used for search and enquiry targeting. |
| **Enquiry** | A Customer's request for a service: category + location + description + timing. The entry point of the transaction lifecycle. |
| **Quotation** | A Provider's priced offer (LKR) responding to one Enquiry. Multiple Providers may quote the same Enquiry. |
| **Booking** | The committed engagement created when a Customer accepts a Quotation. |
| **Payment** | Settlement for a Booking in LKR, from which the platform Commission is deducted. |
| **Commission** | The platform's share of a Booking payment (revenue stream). |
| **Review** | Customer feedback (rating + text) on a Provider after a completed Booking. |
| **Subscription** | A paid Provider package (tier) affecting listing/visibility benefits. |
| **Advertisement** | Paid promotional placement purchased by Providers or third parties. |
| **Verification** | Admin-reviewed process establishing a Provider's identity/legitimacy; gates provider capabilities and the verified badge. |
| **Dispute** | A formal disagreement raised on a Booking/Payment, managed by Admin. |
| **Lead** | A relevant Enquiry surfaced to a Provider; lead-generation fees are a revenue stream. |

## Actors and Role Model

- One **User account** may hold both CUSTOMER and PROVIDER roles; users switch experiences without separate accounts (in-app role switching on mobile; portal switching on web).
- ADMIN is a separate web-only role with sub-roles (see `marketplace-authentication-authorization`).
- A Provider is a User + a Provider Profile (business identity, verification status, services, coverage areas). Becoming a provider augments an account; it never creates a second account.
- ASSUMPTION: A user may review a provider only via a booking they made as a customer; a user cannot quote their own enquiry even if they hold both roles.

## Core Entity Relationships

```
User 1——0..1 ProviderProfile ——* Service ——1 Category (tree)
                     |                 \——* CoverageLocation
                     *——* VerificationSubmission
Customer(User) 1——* Enquiry ——1 Category, ——1 Location
Enquiry 1——* Quotation (each from one ProviderProfile)
Quotation(accepted) 1——1 Booking ——1 Payment ——1 Commission record
Booking 1——0..1 Review     Booking 1——0..* Dispute
ProviderProfile 1——* Subscription (one active at a time — ASSUMPTION)
```

## The Domain Backbone: Enquiry → Quotation → Booking → Payment → Review

1. Customer posts an **Enquiry** (service category + location + description + timing).
2. Relevant Providers see the Enquiry and submit **Quotations** (multiple per enquiry).
3. Customer **compares** quotations (price, provider rating, verification badge).
4. Customer **accepts one** quotation → a **Booking** is created.
5. Provider performs the work; booking moves to completion.
6. **Payment** settles in LKR with the platform **Commission** deducted.
7. Customer leaves a **Review**.

Every module, notification, and analytics event should be locatable on this backbone. Detailed state machines live in `enquiry-quotation-booking-workflows`.

## Revenue Model Summary

1. Free and paid provider listings.
2. Provider subscription packages (tiers).
3. Booking commissions (percentage of payment — exact rates are business configuration, not code constants).
4. Lead-generation fees.
5. Advertisements.

ASSUMPTION: Commission rates and subscription prices are admin-configurable per category/tier rather than hardcoded.

## Domain Invariants

- A Quotation belongs to exactly one Enquiry and one Provider Profile.
- A Booking arises from exactly one accepted Quotation (ASSUMPTION: inferred from "customer accepts one").
- At most one Quotation per Enquiry may be in the accepted state (ASSUMPTION).
- ASSUMPTION: A Provider submits at most one active Quotation per Enquiry (may revise/withdraw and resubmit).
- A Review requires a completed Booking by that Customer with that Provider (ASSUMPTION: one review per booking).
- A Payment belongs to exactly one Booking; commission is computed from that payment.
- An Enquiry targets exactly one Category and one Location (ASSUMPTION: single primary location; multi-location enquiries not supported at launch).
- Provider capabilities (quoting, listing visibility) are gated by verification status per `provider-verification`.
- Money is always LKR; phone numbers are +94 format; times display in Asia/Colombo (see localization conventions).

## Assumptions and Open Questions

- ASSUMPTION: Bookings map 1:1 to accepted quotations; no multi-visit or recurring bookings at launch.
- ASSUMPTION: One active subscription per provider at a time.
- ASSUMPTION: Enquiries are customer-initiated only; providers cannot create enquiries on behalf of customers.
- ASSUMPTION: Unverified providers may register and build profiles but have restricted quoting/visibility (exact gates in `provider-verification`).
- ASSUMPTION: Reviews are one-directional (customer→provider) at launch; provider responses to reviews are a possible later feature.
- REQUIRES VERIFICATION: Any legal classification of providers (individual vs registered business) and consumer-protection obligations in Sri Lanka.
- REQUIRES VERIFICATION: Tax treatment (e.g., VAT) of commissions, subscriptions, and advertisements in Sri Lanka.
- Open question: whether direct bookings (bypassing the enquiry/quotation flow) will ever be supported; current model assumes not.

## Checklist

- [ ] New entity/field names match the glossary exactly (no synonyms like "job", "request", "bid" unless added here first).
- [ ] Feature is placed on the enquiry→quotation→booking→payment→review backbone or explicitly justified as off-backbone.
- [ ] Actor permissions align with the one-account, multi-role model (no separate customer/provider accounts).
- [ ] All invariants above are preserved; any new invariant is added here.
- [ ] Money fields are LKR; locations reference the province/district/DS-division hierarchy.
- [ ] New business rules not in project context are marked ASSUMPTION; legal items marked REQUIRES VERIFICATION.
- [ ] Cross-references: state machines → `enquiry-quotation-booking-workflows`; auth → `marketplace-authentication-authorization`; verification → `provider-verification`.
