# Architecture Decisions

## ADR-001 — One product, three engines
AdSignal is one acquisition-intelligence product. Media, lead and creative analysis are domain modules rather than standalone products.

## ADR-002 — CSV-first commercialization
The product validates recurring diagnostic value before investing in vendor OAuth, API quotas, background sync and connector maintenance.

## ADR-003 — Deterministic core
Financial metrics, scoring inputs and evidence generation stay auditable. AI can later classify creative assets and improve explanation, but it should not fabricate the core performance facts.

## ADR-004 — Platform-agnostic domain
Meta, Google and CRM fields are normalized at the boundary. Domain modules must not depend on vendor field names.

## ADR-005 — Recommend before automate
V1 should help users decide. Automatic budget changes or campaign mutations require substantially more trust, safeguards and validation and are intentionally outside the initial scope.
