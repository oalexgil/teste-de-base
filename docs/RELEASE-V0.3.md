# AdSignal Intelligence V0.3 — Commercial Beta Status

## Status

V0.3 is a sellable CSV-first commercial beta. It is no longer only a demo dashboard.

A user can:

- import a paid-media CSV;
- import a CRM/leads CSV;
- optionally import creative metadata;
- use automatic Portuguese/English column recognition;
- correct mappings in the UI;
- define CPL, CPQL, CAC, ROAS and lead-quality targets;
- automatically split a dated export into previous/current comparison periods;
- calculate media efficiency, lead quality and creative health;
- compare campaigns by CPL, CPQL, CAC, qualification and sales;
- connect creative hook/angle/format to downstream lead quality and CAC;
- register experiments and classify them as winner/loser/learning;
- estimate directional 7-day budget at risk;
- save and reopen workspaces in browser storage;
- generate a printable executive performance report.

## What is deliberately local-first

The beta processes CSV data inside the browser and stores saved workspaces in browser localStorage. This minimizes infrastructure cost and avoids uploading customer advertising/CRM data before the product has production auth, storage and compliance controls.

This mode is suitable for design partners, freelancers, small agencies and early paid users who are comfortable exporting data periodically.

## Not a blocker for selling the beta

- Meta direct OAuth connection;
- Google Ads direct OAuth connection;
- HubSpot/Pipedrive direct OAuth connection;
- automatic background sync;
- team accounts;
- cloud workspace sync;
- subscription billing inside the product.

These improve convenience and scale, but the core product outcome works without them.

## External blockers before a fully connected SaaS launch

### 1. Dedicated repository

AdSignal was developed on branch `product/adsignal-unified-v1` inside `oalexgil/teste-de-base`. The default branch of that repository is a separate computer-vision makeup product. Do not merge AdSignal into that `main` branch.

A dedicated repository such as `oalexgil/adsignal-intelligence` must be created and the branch migrated there. The connected GitHub tool used during this build does not expose repository creation, so this account-side action cannot be completed programmatically from the current session.

### 2. Meta production access

Direct customer-account access requires a Meta developer/business app, OAuth/login configuration, appropriate Marketing API permissions and production review/access tier. These are account ownership and platform-review steps, not missing source code.

### 3. Google Ads production access

Direct customer-account access requires a Google Cloud project, OAuth app configuration/verification and a Google Ads API production access level. These are platform/account approval steps.

### 4. Cloud identity/storage for multi-device SaaS

The beta intentionally stores workspaces locally. A multi-user SaaS needs an auth provider, database, secure token storage, encrypted secrets and tenant isolation. This is an infrastructure choice rather than a blocker to CSV-first commercial validation.

## Release gate

V0.3 is ready for user testing when GitHub Actions `AdSignal CI` is green. The workflow covers syntax, domain logic, self-service import/mapping, period splitting, workspace persistence, report generation and a static UI contract smoke test.

## Recommended commercialization sequence

1. Move V0.3 into its own repository.
2. Publish the static beta on a dedicated HTTPS domain.
3. Recruit 5–10 design partners using CSV mode.
4. Measure repeat use and whether recommendations influence decisions.
5. Charge for saved recurring analysis/reporting.
6. Register Meta/Google developer apps in parallel.
7. Add direct connectors only after users prove recurring value.
