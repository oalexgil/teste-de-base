# AdSignal Intelligence — Architecture

## Product shape

AdSignal is one product with three analytical engines sharing a common normalized dataset:

```text
Imports
  ├─ paid media
  ├─ CRM / leads
  └─ creative metadata
        ↓
Normalization layer
        ↓
Unified attribution keys
        ↓
┌───────────────────┬───────────────────┬────────────────────┐
│ Media Efficiency  │ Lead Quality      │ Creative Intelligence│
└───────────────────┴───────────────────┴────────────────────┘
        ↓
Scoring + evidence engine
        ↓
Recommendation engine
        ↓
Executive dashboard / report
```

## MVP implementation

The first implementation should run entirely in the browser and avoid backend infrastructure until validation requires accounts, history or integrations.

### Modules

- `src/domain/media.js`: media metrics and efficiency diagnostics.
- `src/domain/leads.js`: qualification funnel, CPQL and CAC diagnostics.
- `src/domain/creative.js`: creative grouping, health and fatigue diagnostics.
- `src/domain/scoring.js`: composite score calculations.
- `src/importers/csv.js`: parsing and validation.
- `src/recommendations/engine.js`: evidence-based action generation.
- `src/sample-data/`: realistic demo datasets.
- `src/ui/`: rendering and state.

## Data contracts

Normalized records should avoid platform-specific assumptions.

### MediaRecord
```js
{
  date,
  platform,
  accountId,
  campaignId,
  campaignName,
  adGroupId,
  adId,
  spend,
  impressions,
  clicks,
  landingPageViews,
  leads,
  conversions,
  revenue
}
```

### LeadRecord
```js
{
  leadId,
  createdAt,
  platform,
  campaignId,
  adId,
  status,
  qualified,
  meetingBooked,
  won,
  revenue,
  rejectionReason
}
```

### CreativeRecord
```js
{
  adId,
  creativeName,
  hook,
  angle,
  format,
  offer,
  cta,
  launchedAt
}
```

## Explainability

Every diagnosis must be generated from traceable evidence. A recommendation object should look like:

```js
{
  id,
  category: 'media' | 'lead' | 'creative',
  severity: 'info' | 'warning' | 'critical',
  title,
  evidence: [{ metric, current, baseline, delta }],
  interpretation,
  action,
  confidence
}
```

## Integrations roadmap

After CSV validation:

1. Meta Marketing API
2. Google Ads API
3. GA4 Data API
4. HubSpot / Pipedrive / generic webhook
5. Shopify / WooCommerce / Stripe

Integrations should feed the same normalized contracts so analytical engines remain platform-independent.

## SaaS roadmap

Backend becomes necessary when adding:
- authentication;
- persistent workspaces;
- scheduled sync;
- team access;
- billing;
- historical benchmarks;
- agency white-label reporting.

Recommended future stack can be selected after MVP validation; the domain layer should remain framework-agnostic.
