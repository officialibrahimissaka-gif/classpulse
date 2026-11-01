# UX design specification

Version 0.1 • 1 November 2026 • Proposed design, not implemented screens or validated usability findings.

## UX-001 — Product promise and evidence

ClassPulse is the working name. The first release helps recruitment agencies coordinate accepted placements toward an agreed start, with clear task ownership, scoped client participation and human readiness decisions. The full vision adds HRMS/HCM, workforce, payroll, employee experience and customer operations. The design must feel like one product without pretending every module exists in R1.

The Phase 0 customer segments remain hypotheses: no founder interviews or user-testing results were supplied. Personas below are proto-personas, not invented research participants. Phase 1 requirements, [MVP_SCOPE.md](MVP_SCOPE.md), [ENTITLEMENT_MODEL.md](ENTITLEMENT_MODEL.md), [KPI_CATALOG.md](KPI_CATALOG.md), Phase 2 security/globalization and Phase 3 contracts remain authoritative inputs. This phase produces specifications and wireframes only; it does not approve expanded implementation, new prices or regulatory coverage.

## UX-002 — Experience principles

| ID | Principle | Observable design rule |
|---|---|---|
| UX-P01 | Make the next responsible action clear | One primary action per work context; show owner, due date, prerequisites and evidence before completion |
| UX-P02 | Explain consequential states | Accepted, ready, started, approved, exported and paid are distinct labels; never imply permit approval or payment from checklist completion |
| UX-P03 | Keep scope visible | Persistent company and active legal-entity/team context, scoped counts, safe client views; tenant switching is explicit and clears stale records |
| UX-P04 | Preserve operational memory | Show original vs revised plans, decision actor/time and correction history; human-readable audit without exposing secret/internal fields |
| UX-P05 | Reveal complexity when needed | Simple record overview first, detailed rules/history behind named sections; full module discovery belongs to authorized admins |
| UX-P06 | Make recovery a normal path | Preserve safe drafts on validation/network errors, show conflicts before overwrite, retain read-only/export routes after module-off |
| UX-P07 | Make numbers explainable | Metric definition, period/cohort, currency, source/as-of and drill-down are available together; no frontend formulas |
| UX-P08 | Be calm and accessible | Restrained color, strong typography, clear labels, keyboard-complete operations and table alternatives; no motion/counter animation required to understand data |
| UX-P09 | Earn sensitive access | Mask/minimize by permission, require reauthentication for sensitive actions, never use an upgrade CTA as a substitute for a permission denial |
| UX-P10 | Be honest about availability | R1 vs planned products, pending activation, no-data, stale source and lack of permission are different states; no fake demos presented as real tenant results |

## UX-003 — Proto-personas and product modes

| ID / role | Job and success hypothesis | Needed context | Main failure to avoid | Release |
|---|---|---|---|---|
| PER-01 Agency owner/operations lead | Know which placements need intervention and who owns it | Clients, original start cohorts, overdue tasks, ready/start evidence | False certainty from a green checklist; confusing placements with internal headcount | R1 |
| PER-02 Recruiter/account coordinator | Move assigned accepted offers forward without repeated chasing | Own/team placements, client tasks, due dates, import errors | Duplicate entry, hidden original dates, task completion interpreted as legal approval | R1 |
| PER-03 Client HR participant | Complete specifically requested tasks safely | One invited placement and the fields explicitly shared | Seeing other clients/placements or being asked to manage a whole tenant | R1 scoped |
| PER-04 Tenant/security/billing administrator | Set up company access and commercial modules predictably | Roles/scopes, trial/order, usage, retention and module dependencies | Self-escalation, accidental data loss, hidden charges | R1 bounded |
| PER-05 HR leader/HR operations | Understand employee changes and complete reliable administration | Employment/entity history, policies, requests and workforce KPIs | Current profile presented as historical truth; sensitive case leakage | Later |
| PER-06 Payroll preparer/approver | Resolve inputs and approve an explainable run | Entity/pay period/currency, approved inputs, exceptions and role separation | Payment assumed from export; net wages presented as employer cost | Later |
| PER-07 Line manager | Resolve team work/leave/coverage decisions quickly | Assigned team, calendar, pending approvals, employee availability | Access to unneeded medical/pay data; drag-only rostering | Later |
| PER-08 Employee | Understand own records/requests and get help | Self profile, leave, payslips when entitled, request progress | Another employee's records, repeated sensitive uploads, inaccessible mobile forms | Later |
| PER-09 Sales/account manager | Progress client relationships and legitimate commercial decisions | Account activity, deal stage, quote approval and currency | Forecast presented as recognized revenue; employee data in account views | Later |
| PER-10 Customer-success/support agent | Own customer commitments and resolve issues | Assigned accounts/cases, explainable health, SLA history and safe replies | Restricted ticket leakage or tenant support mistaken for SaaS operator access | Later |

PER-03 is R1 scoped participation only, not employee/candidate self-service. Candidate self-service is a later ATS mode. SaaS vendor operators use a separately audited administrative access experience, not the customer-support workspace. Role names are contextual; no role label grants unscoped access.

## UX-004 — Visual direction and screen anatomy

Direction: a quiet operational workspace with off-white canvas, white panels, deep ink typography, a dark slate navigation rail and restrained indigo primary actions. Teal communicates successful progress with explicit text; amber identifies review needs; red denotes error/destructive consequences. Do not turn every metric into a brightly colored tile. Use local embedded fonts, no decorative gradients, stock portraits, glass panels or invented customer logos.

The application shell uses a 240 px navigation rail, 64 px header, 32 px desktop content padding, 24 px grid gaps, a maximum 1,440 px content width and 12-column layout. Typography, colors, spacing and states are centralized in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md). A page contains breadcrumb where useful, H1/context, one primary action, filters, content and contextual help. Detail pages use an 8/4 main/action layout at wide widths, stacked sections below 1,200 px. Mobile uses full-width pages rather than a narrow desktop drawer.

Record pages put status, owner and due date above history. Labels say “Ready — agency-reviewed” or “Start confirmed” with actor/time; they never say “Legally cleared.” Destructive, commercial and approval actions preview consequences before submission. One status badge has text and an icon; there is no generic unlabeled red dot.

## UX-005 — Interaction, errors and data states

| State | Presentation and action |
|---|---|
| Initial loading | Layout-stable skeleton, visible loading label; do not fabricate values or announce every skeleton cell |
| Empty, no records | Explain the missing work context and offer permitted first action; “Add accepted placement” for R1, not “Hire your first employee” |
| Empty after filtering | Preserve filters, show “No placements match these filters,” with clear/reset controls |
| Partial/stale source | Keep last confirmed permitted values labelled as-of; identify affected widgets and retry. Never replace a failed source with zero |
| Unknown/zero/N/A/suppressed | Distinct copy. No denominator→N/A; no permission→omit/redact safely; privacy-suppressed→“Not enough responses to display” |
| Permission denied | Safe generic message, optional request-access route to a permitted admin; no sensitive counts, titles or upgrade prompt |
| Module unavailable | Admin catalogue may show “Planned”; normal users see no dead navigation. Never offer purchase/activation for unsupported features |
| Read-only retained data | Persistent archive banner, disabled mutations with reason, authorized read/export remains available for the applicable window |
| Validation | Inline field error plus linked error summary; preserve non-sensitive entries, focus the first error, explain correction |
| Conflict (412) | “This record changed,” compare permitted fields/new version, reload or reapply deliberately; no silent overwrite |
| Capacity/rate limit | State capacity and permitted options, no silent charge; near-cap warnings only to relevant admins. Show retry time for transient throttling |
| Unknown provider outcome | “Confirmation pending” and reconcile guidance, not success or an unconditional resend button |
| Unsaved change / lost session | Confirm leave, save safe server draft when supported; reauthenticate without storing sensitive data in browser localStorage |

Optimistic UI is limited to low-risk reversible preferences after safe authorization; readiness, approval, start, grant/module/billing change and reimbursement wait for server confirmation. A 202 means queued, not completed. Prevent accidental double-submit in the UI, but server idempotency remains authoritative. Show progress/failure inline or in an accessible job panel; essential failures cannot be toast-only.

## UX-006 — Responsive and localization contract

Viewport ranges: small <768 px, medium 768–1199 px, large ≥1200 px; test 320, 390, 768, 1024 and 1440 CSS-pixel layouts. At small widths use a labelled menu drawer, one-column forms, mobile filter sheet with Apply/Clear, two KPI cards only if labels fit, otherwise one. Replace task/pipeline drag operations with explicit Move/Assign actions. Do not hide essential actions behind hover. Wide data tables have a labelled horizontal scroll region/column chooser or a selected-row detail view; financial comparison tables retain columns rather than misleading card rearrangement.

Unicode names and IANA timezones are supported in design. English R1; Arabic is an RTL-ready target needing translation/native review before shipping. Use logical start/end spacing and mirrored directional icons only where semantically appropriate. Numbers, emails, IDs and source codes have controlled bidi isolation. Dates show unambiguous localized text; imports use documented ISO. Company/entity timezones and currencies are explicit; UI locale never selects legal rules. Calendars use configured workweeks/holidays, not a fixed UAE weekend. No nationality-based language assumption.

## UX-007 — Design scope and approval gate

All 29 screen specifications are in [WIREFRAME_SPECIFICATIONS.md](WIREFRAME_SPECIFICATIONS.md), with low-fidelity structure, high-fidelity anatomy, content/actions, states, responsive behavior and requirement links. The full executive suite is a later composition; R1 executive/recruiter dashboards use only kpi.001–004. Pricing shows approved limits and “Contact sales” until real prices/terms are approved. Setup and subscriptions are bounded order/trial workflows, not a surprise card payment flow.

Before extensive implementation, review the R1 screens/journeys, design tokens, field sharing, metric semantics, responsive and accessibility requirements, and the contract deltas below. Proposed usability study: moderated tasks with 5 agency operators, 3 client participants and 2 admins; include keyboard/screen-reader and mobile participants where possible. These are recruitment targets, not completed interviews or a representative sample. Observe task completion, errors, unassisted state understanding, time and recovery; do not invent success rates. Resolve critical privacy/state misunderstandings before adding polish.

## UX-008 — Contract deltas requiring review

| ID | Design need | Current constraint / proposed resolution | Scope |
|---|---|---|---|
| UX-DELTA-01 | Executive employer payroll cost | kpi.011 is approved net payroll, not employer cost. Proposed centrally registered metric in DASHBOARD_SPECIFICATIONS.md needs classified employer-cost lines and reviewed scope/reconciliation before display | Later; never relabel net payroll |
| UX-DELTA-02 | Department/team and historical comparison filters | Phase 3 FilterAst lacks teamId/department taxonomy; extend allowlisted source-aware filter contracts using effective OrganizationAssignment. R1 agency uses entity/client/owner and marks department not applicable | Later; no invented query parameter |
| UX-DELTA-03 | Rich task views/import errors/configuration editing | Validate exact task-state/owner filter and error-detail projections against Phase 3 endpoints; add explicit versioned read/command schemas where absent | R1 before implementing affected view |
| UX-DELTA-04 | Registration, setup and signed-order changes | Identity bootstrap, provisioning, retention approval and accepted-order adapters are architecture contracts, not all OpenAPI business endpoints. Define exact adapters and secure order workflow before implementation | R1 bounded; no public unrestricted tenant/plan writes |
| UX-DELTA-05 | Save/export/print and accessible media | Confirm report job progress, recipient-free download, PDF tagging/reading order and locale layouts against actual renderer tests | R1 reports; scheduled reports remain Later |

These deltas do not silently amend the approved API, KPI registry or MVP. Design approval must choose resolution before affected implementation. No Figma file, clickable prototype, rendered high-fidelity application or completed user study is claimed.
