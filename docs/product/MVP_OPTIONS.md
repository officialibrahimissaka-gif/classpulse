# Three MVP directions and decision scorecards

2 November 2026. **None is commercially validated or newly approved for implementation.** Existing agency code is a reusable research asset, not evidence that its market wins. [Facts and unknowns](MARKET_RESEARCH.md) and [competitors](COMPETITOR_ANALYSIS.md) inform what to test, not fabricated demand scores.

## Ranked discovery options

Scores [J/H], 1–5, higher favorable: commercial potential 40%, implementation ease 30%, speed to first revenue 30%. They are provisional strategy judgments with low confidence, not measured market outcomes or engineering commitments. “Speed” is relative **after** shared legal/security/operational/buyer gates; actual days to revenue are unknown. Effort considers a bounded greenfield workflow so the existing prototype cannot dominate solely by sunk cost. Adaptation/release effort must be re-estimated after selection.

| Rank / direction | Commercial potential | Implementation ease | Speed to revenue | Weighted judgment | Main reason / decisive uncertainty |
|---|---:|---:|---:|---:|---|
| 1. A — agency accepted-placement coordination | 3 | 4 | 4 | **3.60/5** | Narrow job beside ATS, potentially near a fee event; standalone budget and native ATS gap unproven |
| 2. B — multi-site payroll-input exception coordination | 4 | 2 | 2 | **2.80/5** | Potentially consequential repeated close process, but integration/manager/provider accuracy and purchase complexity |
| 3. C — international-hiring task/readiness coordination | 3 | 3 | 2 | **2.70/5** | Cross-party handoffs possible, but provider substitution, responsibility/data and recurring budget uncertain |

Example sensitivity: A commercial score 3→1 lowers total to 2.80, tied with B; a repeatable B data path raising ease and speed 2→4 gives B 4.00. These are hypothetical calculations. If an incumbent already solves the job, there is no buyer or lawful data path, or critical safety/legal requirements cannot be met, the option fails regardless of weighted score.

### A — Agency accepted offer to first day

- **Target/buyer [H]:** permanent-placement agency with recurring accepted offers and existing ATS; owner/ops pays, recruiters/account managers and authorized client contacts use it. Temporary staffing is a separate comparison.
- **Problem:** P1; ownership, exceptions and human readiness across parties may be fragmented.
- **Minimum complete workflow:** minimal client/candidate references → owned dated checklist → scoped client task participation → exception resolution → human readiness/actual-start confirmation → source-linked report/export. CSV entry only if lawful and repeatable.
- **Exclude:** sourcing/ATS replacement, temporary-worker payroll/invoicing, identity-file collection, EOR/immigration decisions and broad HRMS.
- **Commercial model to test:** organization fee with an understood active-placement band; compare seat model and actual buyer budget. Do not infer willingness from existing prototype pricing.
- **Effort/time dependencies:** client participation and data access without duplicate work; native ATS alternative, safe tenant/scoped handling and remaining existing release gaps. Existing implementation is locally testable but not launch-ready.
- **Advance evidence:** five independent recurring agency cases with a preventable cost mechanism, competent native-tool test, at least two buyer-owned conditional paid evaluations and a common workflow. Stop if fees are unaffected, no budget exists or all value needs unavailable integrations/service guarantees.

### B — Approved payroll-input exception workspace

- **Target/buyer [H]:** construction/hospitality/logistics or other multi-site employer keeping a competent payroll provider; finance/payroll/ops joint buyer, site managers approve.
- **Problem:** P2, informed by P3 upstream evidence; late/mismatched inputs and ownership before provider handoff.
- **Minimum complete workflow:** import necessary source references/time-input statuses → flag missing/disputed inputs against **customer-provided** cutoff/approval policy → assign/approve corrections → versioned approved handoff and reconciliation with existing provider.
- **Exclude:** statutory/gross-to-net calculation, WPS/payment execution, tax/gratuity engine, new timeclock/biometrics and full workforce scheduler.
- **Commercial model to test:** organization/entity/site subscription with defined volume and separately scoped onboarding; compare actual provider/admin spend and support burden.
- **Effort/time dependencies:** source formats/authorization, manager adoption, provider acceptance and correction history. Bad inputs can affect pay even without a calculation engine; independent payroll examples/provider review are required before real outputs.
- **Advance evidence:** two closed cycles from independent employers showing attributable input rework, shared formats/approval rules, provider participation and specific finance-backed evaluation commitments. Stop if provider configuration solves it, calculation is the real problem or bespoke integration erases value.

### C — International-hiring readiness metadata

- **Target/buyer [H]:** employer repeatedly coordinating HR, recruiters and authorized mobility/PRO providers; HR/ops buyer.
- **Problem:** P4; unresolved ownership/status handoffs, not legal eligibility determination.
- **Minimum complete workflow:** necessary minimal hire/task/status references → named authorized owners and deadlines → missing-item follow-up → human employer/provider readiness review → planned/actual handoff report. Determine whether metadata alone is useful before considering files.
- **Exclude:** immigration advice/submission, government approval, legal employer services, professional credential verification, passport/medical/bank-file uploads and universal compliance packs.
- **Commercial model to test:** bounded organization/batch workflow subscription rather than a regulated service fee; repeat hire frequency must support recurrence.
- **Effort/time dependencies:** cross-party participation, scope/jurisdiction/data responsibility, legitimate permissions and an unsolved job outside existing HRMS/EOR/PRO service.
- **Advance evidence:** repeated preventable cases, named standalone budget, willing providers and an authorized low-sensitivity path. Stop if service provider already owns the outcome, volume is episodic or value requires legal guarantees.

## Why a generic SME HRMS / full scheduler is not the first recommendation

[H/J] P5 can be real but faces broad suites; “records + leave + AI” is not observed differentiation. P3 may justify a narrow manager-to-payroll approval slice, but scheduling/attendance hardware and payroll-invoice engines add separate problems. A broad all-in-one build would combine unvalidated workflows and country rules. Keep SME and site operators in discovery so evidence can overturn this judgment.

## Advance decision and prototype policy

Rank **A for first discovery, B as the explicit challenger**, not A for automatic feature work. Apply the [problem scorecard](MARKET_RESEARCH.md#problem-validation-scorecard) only to collected evidence; all five problems currently remain unscored. Require charter evidence gates and two fair incumbent tests before a founder-reviewed MVP choice.

If A wins, compare the validated job with existing R1 and close only relevant acceptance gaps after approval. If B/C wins, write a scoped change proposal and migration/security/delivery assessment; do not replace working code automatically. Production remains independently NO-GO until deployment/provider/privacy/recovery/financial gates close. No new feature work, real-data pilot, live billing or promised revenue date is authorized by this document.
