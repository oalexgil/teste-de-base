# AdSignal Data Contract

The commercial MVP uses three normalized inputs. Source-specific adapters should map into these fields instead of leaking Meta/Google/CRM naming into the domain layer.

## Media CSV

Recommended columns:

```csv
date,platform,campaignId,campaignName,adGroupId,adId,spend,impressions,clicks,landingPageViews,leads,conversions,revenue
```

## Lead CSV

```csv
leadId,createdAt,platform,campaignId,adId,status,qualified,meetingBooked,won,revenue,rejectionReason
```

## Creative CSV

```csv
adId,creativeName,hook,angle,format,offer,cta,launchedAt
```

## Attribution expectation

For the strongest analysis, `campaignId` and `adId` should be preserved from acquisition through CRM records. When only campaign-level attribution is available, AdSignal should degrade gracefully and clearly mark lower attribution confidence.

## Privacy direction

The CSV-first browser MVP should process data locally whenever practical. A future SaaS backend must minimize stored personal data and should prefer aggregate lead outcomes over unnecessary lead PII.
