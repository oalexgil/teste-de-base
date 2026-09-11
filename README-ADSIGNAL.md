# AdSignal Intelligence

**Unified paid-media intelligence for efficiency, lead quality and creative performance.**

AdSignal connects three problems that are usually analyzed in isolation:

1. **Media Efficiency** — where spend is becoming inefficient and why.
2. **Lead Quality** — whether campaigns produce qualified opportunities instead of cheap volume.
3. **Creative Intelligence** — which concepts are winning, saturating or consuming budget without downstream value.

The product is designed to answer one executive question:

> **What changed, why did it change, how much money is at risk, and what should I do next?**

## Why one product

CPL alone can reward campaigns that generate low-quality leads. Creative CTR alone can reward ads that attract attention but fail downstream. ROAS alone can hide tracking and funnel problems. AdSignal combines the full acquisition chain before generating a recommendation.

## Working V0.1

The current product branch includes:

- platform-agnostic normalized data contracts;
- media efficiency analysis;
- lead qualification and revenue funnel analysis;
- creative concept analysis by hook × angle × format;
- CPL, CPQL, cost per meeting and CAC;
- Efficiency Score, Lead Quality Score and Creative Health Score;
- composite AdSignal Score;
- evidence-based recommendation engine;
- realistic demo dataset;
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

The MVP is deliberately CSV-first. This allows validation without paying for or maintaining multiple ad-platform integrations before customers prove they value the analysis.

See `PRODUCT.md`, `ARCHITECTURE.md`, `docs/PRICING.md`, and `docs/ROADMAP.md`.
