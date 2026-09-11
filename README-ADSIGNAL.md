# AdSignal Intelligence

**Paid-media decision engine for efficiency, lead quality, creative performance and experiment learning.**

AdSignal connects three problems that are usually analyzed in isolation:

1. **Media Efficiency** — where spend is becoming inefficient and why.
2. **Lead Quality** — whether campaigns produce qualified opportunities instead of cheap volume.
3. **Creative Intelligence** — which hooks, angles and formats produce commercially useful leads and customers.

It adds the defensible layer: **time + targets + decision memory**.

> **What changed, why did it change, how much budget is exposed, what should I do next, and did the last decision work?**

## V0.3 — self-service commercial beta

The current branch is usable by a non-developer through the browser. It includes:

- real CSV upload for paid media, CRM/leads and creative metadata;
- automatic Portuguese/English column recognition;
- manual mapping correction in the UI;
- localized numeric parsing for Brazilian and international exports;
- automatic split of dated exports into previous/current periods;
- editable CPL, CPQL, CAC, ROAS and quality targets;
- campaign economics comparing CPL × CPQL × CAC × qualification × sales;
- creative intelligence connected to CRM quality and CAC, not only CTR/ROAS;
- current-period vs previous-period change radar;
- directional 7-day budget-at-risk estimate with explicit methodology;
- experiment memory with winner / loser / learning states;
- local browser workspaces for recurring use;
- printable executive performance report;
- responsive onboarding + dashboard;
- deterministic/auditable financial calculations;
- automated domain, import, persistence, report and UI-contract tests;
- GitHub Actions CI;
- downloadable ZIP artifact produced by the package workflow.

## Why this is not CSV + generic AI

A one-off AI chat can summarize one export. AdSignal keeps business targets, normalizes recurring data, compares periods, connects ad spend to CRM outcomes, remembers experiments and measures whether a decision improved the intended metric. The accumulated operating history is the product value.

See `docs/WHY-NOT-GENERIC-AI.md`.

## Run locally

Serve the repository over HTTP and open `/adsignal/`:

```bash
python3 -m http.server 8000
# http://localhost:8000/adsignal/
```

Or use any static web server.

## Validate

```bash
npm run ci
```

## Data flow

```text
Paid-media CSV ─┐
CRM/leads CSV ──┼─> mapping -> normalization -> previous/current split
Creative CSV ───┘                         |
                                           v
                           Media + Lead + Creative engines
                                           |
                   Targets + Change + Experiments + Budget Risk
                                           |
                              Decision dashboard + report
```

## Privacy model in V0.3

The commercial beta is local-first. CSVs are processed in the browser and saved workspaces use browser localStorage. No AdSignal backend is required for the core workflow. This keeps early infrastructure cost low and avoids transmitting client ad/CRM data before production identity, storage and compliance controls exist.

## Direct API connections

Meta, Google Ads and CRM OAuth connectors are not required to use V0.3. They are convenience/scale features and require external developer-app credentials and platform approvals. See `docs/INTEGRATIONS.md` and `docs/RELEASE-V0.3.md`.

## Repository warning

This product was prototyped on branch `product/adsignal-unified-v1` inside `oalexgil/teste-de-base`. The default branch of that repository belongs to a separate computer-vision makeup project. **Do not merge AdSignal into that main branch.** Move this branch into a dedicated `adsignal-intelligence` repository before public launch.

## Commercial direction

V0.3 can be used with design partners and early paid CSV-first customers. The next technical investments should be driven by recurring usage: dedicated hosting/domain, authentication/cloud workspaces when needed, then production OAuth connectors.

See `PRODUCT.md`, `ARCHITECTURE.md`, `docs/ROADMAP.md`, `docs/COMMERCIAL-PLAN-2026.md`, `docs/RELEASE-V0.3.md`, and `docs/WHY-NOT-GENERIC-AI.md`.
