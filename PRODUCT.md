# AdSignal Intelligence — Product Definition

## Mission
Help paid-media teams understand whether their ad spend is producing efficient acquisition, qualified leads, and scalable creative performance.

## Core jobs to be done

### 1. Media efficiency
- Detect cost anomalies and deteriorating conversion economics.
- Separate pre-click, click, landing-page, and downstream funnel problems.
- Surface wasted-spend signals with supporting metrics.

### 2. Lead quality
- Measure lead quality beyond CPL.
- Track qualified lead rate, meeting rate, sale rate, CPQL and CAC.
- Compare campaigns by downstream value instead of raw lead volume.

### 3. Creative intelligence
- Group ads by hook, angle, format, offer and CTA.
- Detect fatigue and concentration risk.
- Identify winning concepts versus superficial variants.
- Recommend the next creative experiment.

## North-star outcome
The user should be able to open AdSignal and answer:

> What changed, why did it change, how much money is at risk, and what should I do next?

## Target customers
- performance marketing freelancers;
- boutique agencies;
- lead-generation businesses;
- ecommerce teams with modest ad spend;
- in-house growth teams underserved by enterprise analytics products.

## MVP data model
The initial version is CSV-first and accepts three datasets.

### Media dataset
Required dimensions/metrics should support:
- date;
- platform;
- account;
- campaign;
- ad set / ad group;
- ad;
- spend;
- impressions;
- clicks;
- landing-page views;
- leads;
- purchases or conversions;
- revenue.

### Lead dataset
- lead ID;
- campaign/ad attribution key where available;
- created date;
- status;
- qualified boolean/status;
- meeting booked;
- sale/won status;
- revenue;
- optional rejection reason.

### Creative dataset
- ad ID;
- creative name;
- hook;
- angle;
- format;
- offer;
- CTA;
- launch date.

## Core metrics

### Acquisition economics
- CPM
- CTR
- CPC
- CVR
- CPL
- CPQL
- cost per meeting
- CAC
- ROAS

### Lead funnel
- lead → qualified
- qualified → meeting
- meeting → sale
- lead → sale
- revenue per lead

### Creative
- spend share by concept
- CTR/CVR/CPQL/CAC by hook
- performance by angle
- performance by format
- age and spend concentration
- fatigue signals

## Initial scoring

### Efficiency Score — 0–100
Weighted combination of:
- cost trend stability;
- conversion efficiency;
- downstream economics;
- anomaly severity.

### Lead Quality Score — 0–100
Weighted combination of:
- qualification rate;
- meeting rate;
- close rate;
- revenue per lead;
- invalid/unresponsive rate when available.

### Creative Health Score — 0–100
Weighted combination of:
- performance versus account baseline;
- fatigue trend;
- concept diversity;
- spend concentration;
- downstream quality.

### AdSignal Score — 0–100
Composite executive score from Efficiency, Lead Quality and Creative Health.

The UI must always expose the components behind a score. No opaque AI score should be presented as fact.

## Recommendation model
Each recommendation must include:
- severity;
- observed evidence;
- likely interpretation;
- recommended action;
- confidence/limitations;
- estimated impact where enough data exists.

## Product principles
1. Action over dashboards.
2. Explainable metrics over black-box scoring.
3. Revenue quality over vanity conversions.
4. CSV-first validation before expensive integrations.
5. Multi-platform architecture from day one.
6. AI assists classification and explanation; deterministic calculations remain auditable.
