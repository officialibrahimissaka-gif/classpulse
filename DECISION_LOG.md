# Decision log

2 November 2026. Newly created management index; no pre-existing file was found in tree/history. Preserve ARCHITECTURE_DECISION_RECORDS.md and docs/IMPLEMENTATION_DECISIONS.md as the original detailed records. Entries below summarize their current application and decisions made during authorized continuation; they are not retroactive approval certificates.

| ID | Decision / reason | Source / consequence |
|---|---|---|
| CONT-D001 | Continue existing bounded R1 instead of restarting/full-suite expansion | Current founder instruction; existing branch and architecture preserved |
| CONT-D002 | Select CONT-T001/P6-G01 as the highest-priority independently executable task | REQ-R002/R005 + roadmap P0; high external security/recovery/legal gates need access/review not present here. Do not mistake task selection for downgrading those blockers |
| CONT-D003 | Store immutable snapshot summary alongside existing immutable source projections; additive ninth migration, no historical backfill | src/domain/report-snapshots.ts + prisma migration 202611020002; historical aggregate/drill-down semantics are stored once, not recalculated from live rows |
| CONT-D004 | Separate new report permission fingerprint from ordinary data revision, and reauthorize every current source placement at view/generation/publish/download | Normal source edits should preserve frozen history; changed grants/owner/tenant/module policy/expiry/erasure must deny. Legacy snapshots keep original stricter download hash and cannot be reused |
| CONT-D005 | Freeze dashboard explicitly or on first export; refresh live explicitly; later formats bind snapshot ID | UI/API hold the same as-of/cohort/values. New capture creates a new identity; exports never extend original seven-day expiry |
| CONT-D006 | Reconstruct the five missing management files from evidence, marking unknowns and provenance | Requested files were absent from current tree and available history; no imaginary customer interviews, owners, approvals or payments |
| CONT-D007 | Preserve NO-GO and test-only Ghana Paystack/GHS path | Founder merchant/currency preference persists, but no cloud/secret/outbound identity is bound in the replacement environment and no production gates are closed by this work |

Original choices retained: modular monolith; deployable R1 schema separate from full vision; forced RLS/nonowner runtime; tenant write fence; central versioned KPIs; distinct maintenance/operator paths; no production payroll; AWS UAE proposed first cell; reviewed orders independent from test payment observations. See the original ADRs for trade-offs.
