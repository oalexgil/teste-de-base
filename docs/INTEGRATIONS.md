# Integration Strategy

AdSignal's analytical core is intentionally independent of vendor APIs. Connectors translate source data into normalized records; scoring and recommendations stay vendor-neutral.

## Working today

The commercial beta is fully usable without API credentials:

1. import paid-media CSV;
2. import CRM/leads CSV;
3. optionally import creative metadata CSV;
4. confirm automatic column mapping;
5. define business targets;
6. analyze current vs previous period;
7. save the workspace locally and export an executive report.

CSV import is a supported product mode, not a temporary developer workaround.

## Direct connector priority

1. Meta Marketing API — campaign/ad delivery and spend.
2. Google Ads API — search/performance data.
3. HubSpot / Pipedrive — lead status, opportunity and revenue.
4. GA4 — post-click context.
5. Shopify / WooCommerce / Stripe where relevant.

## External gates: Meta

A real multi-customer SaaS connection requires a Meta developer app, Facebook Login/OAuth configuration and the appropriate Marketing API permissions. Reading customer ad-account performance normally requires `ads_read` with the production access level applicable to external businesses. Meta also uses a Marketing API Access Tier (renamed in 2026 from Ads Management Standard Access) with separate qualification/review requirements. These approvals must be performed from the business/developer account that will own AdSignal and cannot be completed from source code alone.

Until approval is obtained, the CSV connector provides the same normalized input to the decision engine.

## External gates: Google Ads

A production connector requires a Google Cloud project, Google Ads API enabled, OAuth credentials/consent configuration and an API access level that permits production accounts. Google changed API access management in September 2026 so access levels are increasingly tied to Google Cloud projects rather than relying only on the legacy developer-token model. OAuth verification/brand verification and production API access are account-side approval steps.

Until approval is obtained, Google Ads exports work through the CSV connector.

## CRM connectors

HubSpot and Pipedrive integrations require app registrations and OAuth credentials for a public multi-customer integration. These do not block product use because CRM CSVs can already provide the downstream fields required for CPQL, CAC and lead-quality analysis.

## Architecture rule

No connector may contain business scoring logic. The connector boundary ends at normalized records. This prevents Meta, Google and CRM integrations from becoming separate products and keeps recommendations auditable.

## Feedback-loop opportunity

A later version may send qualified or won outcomes back to supported ad platforms as conversion signals. This requires strong attribution identity, consent, privacy controls, token security and explicit safeguards before production use.
