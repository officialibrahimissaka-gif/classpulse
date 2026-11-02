# Post-launch roadmap

2 November 2026. Conditional priorities, not dates or contracted feature promises. “Post-launch” work begins only after the current NO-GO is closed; prerequisites below precede first customer activation.

| Priority / stage | Outcome | Evidence and dependencies | Decision owner |
|---|---|---|---|
| P0 before launch | Close R1 same-snapshot exports, imported provenance/correction, read-only UX/expiry/freshness and classification review | P6-G01–G04 acceptance; avoid changing immutable history without reviewed migration | Product/backend/UX/data governance |
| P0 before launch | Real tenant-safe production identity, network/provider confinement, operator approval/audit and privacy/retention completeness | P6-B01/B02/B04/B05 independent reviews, actual provider negative tests | Security/platform/legal |
| P0 before launch | Verified restore/tombstones, monitoring/on-call and sustained multi-tenant load | B03/G05 deployed evidence; clear regional-disaster boundary | SRE/privacy |
| P0 before recurring collection | Approved Ghana/GHS merchant and tax/invoice/order scope; live recurring lifecycle with signed webhook inbox, dedup/out-of-order recovery, invoice/settlement/dunning/dispute reconciliation | Paystack test account contract tests then separately approved live controlled test; no automatic entitlement from browser callbacks | Billing/security/legal/accountant |
| P0 before launch | Resolve/review moderate development lint-chain advisories and pin scanned images/actions/base digests | P6-G06; clean or explicitly accepted time-bounded residual with full retest | Build/security |
| First approved cohorts | Observe activation/time-to-value/support effort; remove proven handoff friction | Actual customer consent and evidence, at least one complete cohort | Product/CS |
| After first ten paid + renewal evidence | Improve onboarding templates/import UX, operational reliability and one repeatable acquisition channel | Reconciled cash/retention/cost and customer-request prioritization; avoid vanity lead totals | Founder/product |
| Later integration experiment | One native ATS connector or approved public API | Named shared customers, vendor permission/contract/API access, tenant/privacy and operational review; no fake connector | Integrations/security |
| Later adjacent wedge | Employee master/leave or payroll-input exceptions | Separate segment/buyer discovery, schema/classification/jurisdiction review and revised MVP approval | Product/legal |
| Separate future release | Payroll/financial calculation or country compliance pack | Verified current legal rules and independently validated engine/examples/reversals/rounding/history and certification where applicable | Payroll/legal/security |

Review fortnightly during pilots using observed severity, recurrence, customer value, cost and architectural risk. Publish changes to existing requirement/story/design/test traceability, add versioned migration/API contracts where relevant, rerun affected gates and maintain independent release signoffs. No future entitlement becomes available because a parent module or a paid plan is active.

## Continuation update — 2 November 2026

The same-snapshot dashboard/export portion of P6-G01 is locally remediated under CONT-T001; remaining provenance/correction, UI/manual accessibility, classification and external release work is unchanged. [Current management roadmap](PRODUCT_ROADMAP.md) and [executed evidence](docs/quality/continuation-2026-11-02/RESULTS.md) carry the latest slice disposition. This roadmap is not a release approval.
