# Project charter

Established 2 November 2026 from the existing repository and the founder's project-continuation instruction. This file was absent from the current tree and all available Git history; it is a reconstructed management baseline, not a claim of earlier signed approval. Authoritative detail remains in MVP_SCOPE.md, the phase requirements/architecture, implementation decisions and release findings. This charter does not replace them.

## Purpose and outcome

Deliver a tested, usable agency placement-to-start coordination workflow that a real buyer can evaluate, operate safely and pay for after release gates close. Target customer hypothesis: UAE permanent-placement agencies with an existing ATS and a recurring accepted-offer handoff problem. Customer demand, pricing and willingness to pay remain unvalidated; no interview/customer/payment evidence has been supplied.

R1 includes tenant/entity setup, scoped roles and modules, minimal client/candidate references, versioned placement checklists, client field/task participation, exceptions/waivers and human readiness/start, CSV import, fixed digest, central operational KPIs and protected PDF/CSV/XLSX reporting. Module-off retained access/export and reviewed commercial changes remain server-controlled. The Phase 7 extension adds proposed GHS pricing and isolated Paystack **test-only** checkout/payment observations; it does not enable live recurring billing or auto-grant entitlements.

Excluded: payroll/financial calculation/WPS/tax engine, government or immigration decisions, labor supply, candidate self-service, passport/medical/bank/permit-document uploads, full HRMS/HCM/ATS/CRM, public APIs/native ATS connectors and unimplemented paid modules. Later vision requires separate scope/customer/legal review.

## Technical and delivery constraints

Preserve the approved modular-monolith direction: Next.js/strict TypeScript, PostgreSQL/Prisma, Redis/BullMQ, tenant RLS plus current server policy, immutable business/audit history, private artifacts and external-provider adapters. Deployable schema is prisma/r1/schema.prisma; full-vision designs remain preserved. Never rewrite applied migrations or replace the implementation without a documented reason. Use bounded vertical slices, trace to requirement/story/design/code/test, run all required gates and record limits honestly.

Current repository branch: codex/classpulse-mvp-review. Source delivery to this review branch is distinct from main merge, public release or cloud-environment publication. Do not publish/deploy the environment, charge live cards, contact prospects or claim production/regulatory readiness without the required authorization/evidence. No product restart is authorized or needed.

## Success and governance

Milestone M8 is R1 release acceptance and operational evidence. Complete internal acceptance clauses and all high/critical controls, demonstrate deployed provider/restore/monitoring behavior, obtain independent security/privacy/legal/SRE signoffs and meet the existing discovery gate before real-customer launch. Actual collected recurring payment, activation/value and retained customers—not mock/test events—establish commercial progress. KPI formulas and first-ten experiments are in REVENUE_MODEL.md and LAUNCH_PLAN.md.

Founder: prioritization, buyer access, account/domain/secure credential bindings and final product/commercial acceptance. Engineering lead: implementation, regression tests, traceability and delivery evidence. Named security/privacy/legal/accountant/SRE/on-call approvers are not assigned; role labels are not approvals. Record decisions in DECISION_LOG.md, assumptions in ASSUMPTIONS_LOG.md and unresolved risk/evidence in RISK_REGISTER.md. Production remains **NO-GO** until the release checklist is actually satisfied.
