# Integration Strategy

AdSignal's analytical core is intentionally independent of vendor APIs. Connectors should only translate source data into normalized records.

## Priority order

1. Meta Marketing API — campaign/ad delivery and spend.
2. Google Ads API — search/performance data.
3. GA4 — post-click behavior and conversion context.
4. CRM — HubSpot/Pipedrive first, then generic webhook/import.
5. Commerce/payment — Shopify, WooCommerce, Stripe where relevant.

## Rule
No connector should contain business scoring logic. This avoids recreating three different products for three different platforms.

## Feedback-loop opportunity
A later version can send qualified or won outcomes back to supported ad platforms as conversion signals. This should only be implemented after attribution identity, consent, privacy and data quality are robust.
