# Security and Data Handling

AdSignal may eventually process advertising and CRM datasets. The product should minimize risk from the beginning.

## MVP

- Do not require API keys for the CSV-first demo.
- Prefer local browser processing for imported CSV files.
- Avoid collecting names, emails, phone numbers or other lead PII when aggregate status data is sufficient.
- Never commit credentials, exported customer datasets or production tokens.

## Future SaaS

- encrypt secrets at rest;
- use scoped OAuth connections rather than long-lived user tokens where possible;
- separate workspace authorization from connector authorization;
- maintain audit logs for team/agency access;
- define retention and deletion controls;
- redact PII from logs and AI prompts;
- make AI enrichment opt-in when customer data would leave the primary application boundary.

## Reporting

Security issues should be reported privately to the repository owner rather than disclosed through a public issue containing customer data or credentials.
