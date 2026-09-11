# Why AdSignal is not “CSV + generic AI”

A one-off AI chat can summarize a CSV. That is not a defensible product by itself.

AdSignal is being designed around the parts that a one-off analysis does not own by default:

## 1. Persistent operating context
AdSignal stores the account’s targets, prior periods, accepted/rejected recommendations, experiments and outcomes. The unit of value is not a single report; it is accumulated operating knowledge.

## 2. Deterministic financial layer
CPL, CPQL, CAC, ROAS, qualification rates, target breaches and period deltas are calculated by auditable code. AI may explain or classify, but does not invent the financial facts.

## 3. Change detection
The system compares recurring periods and highlights what materially moved in the wrong or right direction. The user should not need to remember last week’s metrics or recreate prompts.

## 4. Business-specific targets
A metric is evaluated against the user’s economics, not a generic internet benchmark. A CAC can be acceptable for one account and destructive for another.

## 5. Decision memory
Recommendations become experiments. Experiments become winner / loser / learning states. The product measures whether the action actually improved the target metric.

## 6. Cross-layer diagnosis
Ad platform performance, CRM lead quality and creative concepts are evaluated together. Cheap leads can be exposed as expensive customers, and attractive creatives can be exposed as low-quality acquisition.

## 7. Continuous workflow
The target product is Observe → Diagnose → Decide → Learn. Direct integrations later remove the repetitive export/prompt/re-upload loop entirely.

## Product test
If AdSignal only produces a nicer one-time report than a generic AI chat, it has failed this strategy. Paid retention should come from history, detection, experiments, integrations and accumulated account-specific learning.
