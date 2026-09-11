# AdSignal Intelligence

**Paid-media decision engine for efficiency, lead quality, creative performance and experiment learning.**

AdSignal connects three problems that are usually analyzed in isolation:

1. **Media Efficiency** — where spend is becoming inefficient and why.
2. **Lead Quality** — whether campaigns produce qualified opportunities instead of cheap volume.
3. **Creative Intelligence** — which concepts are winning, saturating or consuming budget without downstream value.

It then adds the defensible layer: **time + targets + decision memory**.

The product is designed to answer:

> **What changed, why did it change, how much budget is exposed, what should I do next, and did the last decision work?**

## Why this is not CSV + generic AI

A one-off AI chat can summarize a CSV. AdSignal is designed to preserve business targets, compare recurring periods, detect deterioration, record experiments and measure whether decisions improved the target metric. Core financial calculations remain deterministic and auditable.

See `docs/WHY-NOT-GENERIC-AI.md`.

## Working V0.2

The current product branch includes:

- platform-agnostic normalized data contracts;
- media efficiency analysis;
- lead qualification and revenue funnel analysis;
- creative concept analysis by hook × angle × format;
- CPL, CPQL, cost per meeting and CAC;
- Efficiency Score, Lead Quality Score and Creative Health Score;
- composite AdSignal Score;
- evidence-based recommendation engine;
- current-period vs previous-period change radar;
- configurable business targets;
- directional 7-day budget-at-risk estimate with explicit methodology;
- experiment memory with winner / loser / learning states;
- realistic current + historical demo data;
- responsive commercial dashboard;
- CSV parser and normalization layer;
- automated tests and GitHub Actions CI.

## Demo

Serve the repository over HTTP and open `/adsignal/`.

```bash
python3 -m http.server 8000
# http://localhost:8000/adsignal/
```

## Validate

```bash
npm run ci
```

## Commercial direction

The validation phase remains deliberately CSV-first, but recurring imports now create historical value instead of isolated reports. Direct Meta, Google, GA4 and CRM connectors should be built after users demonstrate repeated use and willingness to pay for continuous decision support.

See `PRODUCT.md`, `ARCHITECTURE.md`, `docs/ROADMAP.md`, `docs/COMMERCIAL-PLAN-2026.md`, and `docs/WHY-NOT-GENERIC-AI.md`.
