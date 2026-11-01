# Customer segments and jobs

Prepared: 1 November 2026. All segment needs, buying behavior and priorities below are **[H]**, unless marked otherwise. No customer interviews have occurred. See [evidence definitions](MARKET_RESEARCH.md).

## Segment by operational model before industry

Employee count alone is insufficient. Separate direct employers, permanent-placement agencies, temporary staffing/labor-supply businesses, and multinational groups. They have different revenue events, legal responsibilities, data boundaries and approval chains. Within each, identify jurisdiction, sites, entities, worker languages/access, monthly hire/start volume, payroll providers and existing systems.

| Segment | Jobs and likely pain hypotheses | Buyer / daily users | Trigger and evidence to seek | Entry priority [E] |
|---|---|---|---|---|
| SME direct employer | Organize records, leave and payroll inputs without a large HR team | Owner/finance approves; administrator/HR uses | New site, first HR hire, repeated correction cycle; obtain last actual incident | Medium; broad need but incumbent and spreadsheet substitution |
| Mid-market multi-site employer | Resolve payroll inputs, attendance exceptions and manager approvals across sites | Finance/HR/operations jointly; payroll and supervisors use | Growth, provider change, missed cutoff; inspect cross-site handoffs | High for payroll-input discovery, not full payroll replacement |
| Permanent recruitment agency | Turn accepted offers into actual starts with clear client/candidate ownership | Agency owner or operations head; recruiters/account managers use | Repeated slippage after acceptance; compare planned starts, actual starts and fee events | Highest initial discovery priority |
| Temporary staffing / labor supply | Coordinate assignments, approved time, worker readiness, payroll and client invoicing | Operations/finance owner; coordinators, clients and site managers use | More assignments/sites, disputed hours or delayed invoices | High pain hypothesis; larger integration and regulatory burden |
| Employer hiring international workers | Coordinate employer, worker, recruiter and authorized service provider tasks | HR/operations; PRO/mobility and candidates participate | Hiring from a new origin/destination or increasing batches | Medium; accountability valuable, differentiation uncertain |
| Multi-country group | Consolidate visibility while local providers run payroll and employment processes | Regional finance/HR; country HR/payroll users | New country/entity, acquisition, fragmented reporting | Later; higher contract potential but more stakeholders and data/legal complexity |

## Industry-specific workflow hypotheses

| Industry | Distinctive workflow to investigate [H] | Who feels the failure | Product implication to validate |
|---|---|---|---|
| Construction | Project/site transfers, supervisor sign-off, attendance exceptions, mobilization and subcontractor boundaries | Site manager, workforce coordinator, payroll | Offline/low-connectivity process, assignment history and clear employer boundaries; location or biometric capture is not assumed necessary |
| Hospitality | Shift coverage, seasonal hiring, multi-property changes, overtime approval | Department manager, HR, payroll, employee | Mobile supervisor approvals and clear shift/pay exceptions; avoid assuming all pay components are uniform |
| Retail | Store-level rosters, part-time/variable schedules, transfers and approval consistency | Store/area manager, payroll | Simple repeated site workflow; show which source record controls when systems disagree |
| Logistics | Depot/route/site changes, contractor vs employee distinctions, variable time records | Operations dispatcher, manager, payroll | Assignment accuracy and system boundaries; distinguish employment software from fleet/dispatch software |
| Healthcare | Staff scheduling, role/credential readiness, leave and availability | Clinical/operations manager, HR | Additional authority- and profession-specific credential verification; do not claim a generic document tracker verifies a professional license |
| Professional services | Skilled hiring, utilization, client/project assignment, international onboarding | Practice lead, finance, HR | Assignment/start visibility and approvals; utilization and billing integrations may already solve much of the job |

Industry differences are interview prompts, not observed customer complaints. Include exceptions: a construction head office may resemble professional services more than site operations; a hospitality staffing agency differs from a hotel direct employer.

## Persona needs and conflicting incentives

| Persona | Desired outcome [H] | Evidence / measure | Adoption obstacle to test |
|---|---|---|---|
| Business owner / agency owner | Reliable revenue or fewer expensive operational surprises | Completed starts, realized fee/margin, cost of specific failures | Extra system cost; unclear accountability; preference for managed service |
| HR manager | Complete records and fewer escalations with visible ownership | Missing items, follow-up time, unresolved cases | Migration, permissions, legal accountability and exception diversity |
| Payroll / finance | Approved inputs before cutoff and traceable corrections | Rework hours, late changes, reconciliation and adjustment counts | Untrusted source data; extra review layer; finance still liable for sign-off |
| Recruiter | Placements start with less chasing and no duplicate entry | Follow-ups per accepted placement, actual starts, re-entry time | Existing ATS already adequate; reward tied to sourcing rather than follow-through |
| Line / site manager | Staff available when needed, fast approvals | Start/coverage exceptions and approval latency | Low incentive to maintain HR records; mobile/language/access constraints |
| Employee / candidate | Understand next steps, pay, document status and who can help | Completion, support queries, resolution time | Privacy, distrust, device or language barriers, repeated uploads |
| Client approver / PRO / provider | Receive complete requests and avoid repeated clarifications | Handoff rejection, response time, missing-input rate | Another portal, unclear authority, contractual/data-sharing restrictions |

Do not optimize admin visibility by shifting unpaid effort or unnecessary data collection onto workers. Test accessible language and channels with employees; do not assume nationality determines language or technical ability.

## Potentially underserved slices

These are **[H] candidates**, not established underserved markets:

- Agencies that already have an ATS but coordinate post-offer tasks across client HR, candidates and authorized providers in separate systems.
- Mid-market employers whose payroll bureau is competent but site-level inputs arrive late or conflict.
- Staffing operators with client-specific start/assignment requirements that do not map cleanly to a standard employee-onboarding checklist.
- Multi-entity firms too complex for a single spreadsheet but unable to justify an enterprise implementation.

Evidence of “underserved” requires both a material unresolved problem and a fair test of existing alternatives. A missing vendor website feature is insufficient.

## Initial customer profile and exclusions

**[E] Discovery target:** UAE permanent-placement agencies with roughly 5–30 internal users, an existing ATS, recurring accepted offers, and multiple client HR contacts. Employee and volume ranges are recruitment filters to test, not validated optimal thresholds. Favor agencies that can show a recent delayed-start case and name the person who owns it.

Initially exclude single operators without repeated handoffs, customers seeking candidate sourcing alone, businesses requiring the software company to supply labor or become legal employer, and organizations requiring payment execution or several country payroll engines before any benefit is possible. Retain temporary staffing interviews as a comparison group; do not assume permanent and temporary agency workflows share an MVP.
