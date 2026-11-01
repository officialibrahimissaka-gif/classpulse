# Opportunity scorecard and MVP entry points

Prepared: 1 November 2026. **All scores are [E] researcher judgments with low confidence, not customer measurements.** The ranking chooses a discovery priority. It does not authorize building or establish willingness to pay. See [validation status](PROBLEM_VALIDATION.md).

## Scoring method

Each dimension uses 1–5, with **5 always more attractive**:

| Dimension | Weight [E] | Score 1 | Score 3 | Score 5 |
|---|---:|---|---|---|
| Customer pain | 25% | Occasional inconvenience | Recurring operational cost | Frequent, severe, evidenced business loss |
| Willingness to pay | 20% | No buyer or budget | Plausible budget with untested purchase | Multiple paid/renewed commitments |
| Competition | 15% | Adequate entrenched alternatives | Several alternatives with a possible gap | Repeatedly demonstrated unmet job despite fair alternative tests |
| Implementation complexity | 15% | Several deep integrations or rules engines | Bounded integration and workflow scope | Little integration; repeatable inputs and onboarding |
| Regulatory risk | 10% | Provider assumes regulated decisions/services | Sensitive coordination with clear boundaries | Limited exposure and straightforward authorized role |
| Speed to revenue | 15% | Long approvals and extensive prerequisites | Plausible short paid evaluation | Observed repeatable short paid sales cycle |

Scores 4–5 on pain/revenue below are **optimistic hypotheses of potential**, not attainment of those evidence anchors. No candidate has met the evidence bar for a score of 5 on willingness to pay. Weighted total = sum(score × weight), on a 1–5 scale. Competition, complexity and regulatory risk are scored inversely: more competition, complexity or risk means a lower score.

## Three potential entry points

| Candidate | Pain | WTP | Competition | Complexity | Regulatory risk | Speed | Weighted total | Confidence |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| A. Agency placement-to-start coordination | 4 | 3 | 3 | 4 | 4 | 4 | **3.65** | Low |
| B. Employer payroll-input exception management | 5 | 3 | 2 | 2 | 3 | 3 | **3.20** | Low |
| C. International-hiring document/task readiness | 4 | 2 | 2 | 3 | 2 | 3 | **2.80** | Low |

None of these totals is a probability, forecast, market size or validated commercial result. Decimal precision reflects arithmetic only. Legal scope uncertainty may change the regulatory scores substantially.

## A. Agency placement-to-start coordination

**Proposed customer:** UAE permanent-placement agency with an existing ATS, repeated accepted offers, several client contacts and a named operations owner. Distinguish from a temporary staffing firm's timesheet/payroll business.

**Bounded MVP concept [H]:** an accepted-placement checklist with accountable owners, shared milestone status, missing-item follow-up, exceptions and audit/export. Initial value would be fewer preventable handoff failures and less chasing. Determine whether data can arrive through an authorized existing export before requiring deep integrations. Do not assume an API is free or available.

**Outside initial scope:** sourcing, candidate ranking, ATS replacement, visa submission/approval, labor supply, payroll calculation, payment and compliance certification.

**Score rationale [H]:** a start is a concrete event potentially linked to agency economics; a workflow addition could avoid replacing the ATS. Existing ATS automation and onboarding products create strong substitution risk, hence competition 3 rather than 5. Privacy and authorized data-sharing obligations remain even without a payroll engine. No paid demand exists, hence WTP 3 is only a hypothesis.

**Kill tests:** native ATS configuration solves the problem at lower total cost; avoidable coordination accounts for little delay; clients/candidates will not participate; or duplicate entry outweighs benefits. Require corroborated incidents and paid buyer commitments before selection.

## B. Employer payroll-input exception management

**Proposed customer:** a UAE multi-site employer with a functioning payroll engine/provider but repeated late, inconsistent or unapproved attendance/leave/overtime inputs.

**Bounded MVP concept [H]:** collect approved inputs, flag inconsistencies, assign resolution owners and produce a provider-agreed handoff with traceable changes. The employer/provider retains calculation, legal interpretation, payment submission and reconciliation responsibilities. Export correctness must be tested against the real provider's accepted format.

**Outside initial scope:** wage calculation engine, statutory rules coverage, banking/payment execution, broad attendance hardware or biometric platform, multiple-country rollout.

**Score rationale [H]:** payroll is recurrent and consequential, giving the strongest potential pain score. However, attendance/provider integrations, source-data reliability, manager adoption and existing HRMS capabilities increase complexity and competition. Incorrect outputs can affect pay even if the product does not execute payment. These dependencies reduce the speed advantage.

**Kill tests:** root problem is payroll calculation/payment rather than inputs; current HRMS already solves it; no reliable authorized data access; or required integrations and support erase the economic benefit.

## C. International-hiring document and task readiness

**Proposed customer:** UAE employer or agency coordinating repeated international hires across candidate, client HR and an authorized PRO/mobility provider.

**Bounded MVP concept [H]:** explicit task ownership, requests for necessary documents, status/expiry reminders and human-reviewed readiness. “Ready” must identify who made the judgment; it must not imply government approval or employment eligibility.

**Outside initial scope:** legal advice, immigration decisions, recruitment/intermediation services, professional-license verification, employer-of-record services and automatic government submission.

**Score rationale [H]:** fragmented handoffs could be painful, but established HRMS, onboarding, PRO and mobility providers may cover the need. Sensitive identity data and unclear legal responsibility increase risk. Standalone budget is especially uncertain, so WTP is scored below the other options.

**Kill tests:** provider already owns the job end to end; volumes are infrequent; buyer only values bundled legal/service guarantees; or cross-border data handling cannot be bounded appropriately.

## Sensitivity and what could change the winner

- If A's WTP falls from 3 to 1, its total becomes **3.25**, close to B's 3.20. One weak assumption nearly eliminates its advantage.
- If A's competition score falls from 3 to 1 because ATS configuration is sufficient, its total becomes **3.35**. Combining that with weaker WTP puts it below B.
- If B obtains a repeatable authorized integration and a demonstrated faster paid purchase, raising complexity and speed from 2/3 to 4/4 gives **3.65**, equal to A's provisional baseline.
- Raising C's WTP from 2 to 4 gives **3.20**; better demand alone does not remove its scope and substitution concerns.

These are scenario calculations, not evidence. Customer access, founder expertise and distribution relationships are unknown and not silently assumed in any score.

## Recommendation

Start discovery with **A**, and keep **B** as the explicit challenger. The supporting reasoning is a potentially measurable commercial event, a narrower addition beside the incumbent system, and less dependence on country-specific payroll calculation. **No current customer evidence supports selecting A for a build yet.** The competitor shortlist also identifies a clear reason it may fail: agency ATS products may already provide adequate handoffs.

Selection requires recent corroborated customer incidents, a fair incumbent configuration test, an authorized repeatable data path, named buyers and actual paid commitments. Complete current-source verification and the interview plan before converting this ranking into product scope.
