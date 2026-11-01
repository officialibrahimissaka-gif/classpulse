# Wireframe and high-fidelity screen specifications

Version 0.1 • 1 November 2026 • 29 screen contracts. These are text wireframes and high-fidelity specifications, not rendered screens or an implemented prototype. SCR IDs are stable; navigation, journeys and dashboards refer to the same IDs.

## WF-UI-001 — Reading and implementation contract

All screens inherit the tokens in DESIGN_SYSTEM.md, components in COMPONENT_CATALOG.md and accessibility/responsive gates in ACCESSIBILITY_CHECKLIST.md. Desktop references use a 1440 px viewport and 12-column application grid; small references use 390 px, tested down to 320 px. Wireframes show reading/priority order, not pixel-perfect mobile stacking. Screens labelled Later cannot be exposed merely by purchasing a parent module. R1 slices are explicit.

High-fidelity common anatomy: 64 px header; 240 px workspace navigation except public/external modes; 32 px large/24 px medium/16 px small content padding; 24 px panel gaps; 12 px card radius; body 16/24, metadata 14/20, headings 28/36, KPI 32/40; all colors use semantic tokens. Input/control height 44 px; responsive touch targets follow the component checklist. App action bars have one contextual primary action. The critical status/owner/date context is never hidden behind hover.

Use placeholder labels or a clearly marked synthetic design fixture for visual review. No screen may show invented live customer names, performance outcomes, statutory amounts or commercial prices. For every screen test loading, no data, filtered empty, permission change, stale source, error, conflict and read-only behavior where applicable. State absence is not a number zero. Existing API endpoints are contracts, not implementation claims; UX-DELTA items require review before affected controls are built.

<a id="scr-01"></a>
## SCR-01 — Marketing website

**Release:** R1 public scope. **Audience:** PER-01/04. **Job:** Understand the product and whether the agency workflow fits.

**Wireframe / reading order**

```text
[ Header: Product | Modules | Pricing | Security | Sign in ]
[ Hero: Keep accepted placements moving toward their start date ]
[ CTA: Discuss your workflow | Secondary: Explore the product ]
[ Illustrative placement handoff diagram, explicitly labelled ]
[ Three value sections: ownership | exceptions | start history ]
[ Supported scope and planned modules | Security facts | Footer ]
```

**Information and fields:** Headline, truthful capability text, illustrative product diagram, scope/availability badges, security/contact links.

**Primary action:** Discuss your workflow. **Interaction:** Anchor navigation, clear product/module pages; contact form only if a supported secure submission flow is defined.

**High-fidelity specification:** Public max width 1200; 56/64 hero title at wide size, 36/44 mobile; 7/5 text/illustration split; indigo CTA; no invented logos, claims or testimonial cards. Use semantic component states and token values from the shared system.

**Responsive:** Public/auth/external pages use their stated narrow layout; workspace pages follow the shared breakpoints. Preserve the reading order above, visible labels, source context and the primary action at 320 px. Wide tables/pipelines use the accessible scroll/list alternatives; no whole-page horizontal overflow.

**Critical exception and recovery:** Do not display unsupported compliance badges, price promises or fake customer results; unavailable contact submission has a real alternative, not a pretend success toast.

**Review acceptance UX-SCR-01:** the intended persona can identify the job, scope/status and next action using keyboard and small-screen layout; forbidden fields/actions/counts are absent; success waits for server confirmation; the exception above has a visible safe recovery. **Trace:** REQ-L001/L002, UX-P01/P10.

<a id="scr-02"></a>
## SCR-02 — Pricing and module catalog

**Release:** R1 plan information. **Audience:** PER-01/04. **Job:** Compare supported scope without hidden fees or false prices.

**Wireframe / reading order**

```text
[ Header + title: Choose the scope your team needs ]
[ Plans: Trial | Agency Starter | Agency Growth | Enterprise discussion ]
[ Price: Contact sales until approved prices/terms exist ]
[ Rows: internal seats | active placements | entities | export limits ]
[ Module list: Available / Planned, with dependencies and scope ]
[ Definitions, external participants, trial expiry and FAQ ]
```

**Information and fields:** Approved proposed plan limits, defined billing units, module release status, add-on/service distinction.

**Primary action:** Discuss plan and scope. **Interaction:** Compare columns on desktop; mobile plan selector preserves row labels; explain capacities and paid-order approval; no unsupported billing-period discount toggle.

**High-fidelity specification:** Four aligned plan cards, no arbitrary Most popular badge; equal feature label column; details expand inline; commercial facts use readable 16 px body. Use semantic component states and token values from the shared system.

**Responsive:** Public/auth/external pages use their stated narrow layout; workspace pages follow the shared breakpoints. Preserve the reading order above, visible labels, source context and the primary action at 320 px. Wide tables/pipelines use the accessible scroll/list alternatives; no whole-page horizontal overflow.

**Critical exception and recovery:** Unapproved price appears as Contact sales, not zero/free; no purchased module can promise future feature activation.

**Review acceptance UX-SCR-02:** the intended persona can identify the job, scope/status and next action using keyboard and small-screen layout; forbidden fields/actions/counts are absent; success waits for server confirmation; the exception above has a visible safe recovery. **Trace:** REQ-E002/E009/E010/E012, MODULE_CATALOG plan definitions.

<a id="scr-03"></a>
## SCR-03 — Registration and secure sign-in

**Release:** R1 identity adapter. **Audience:** PER-04. **Job:** Establish verified identity without unsafe tenant provisioning.

**Wireframe / reading order**

```text
[ Brand + secure account explanation ]
[ Continue to secure sign-in / registration ]
[ Managed identity verification and required MFA ]
[ Return to ClassPulse with verified identity ]
[ Existing workspace choice or authorized setup continuation ]
```

**Information and fields:** Managed identity email/verification, consent/terms links, safe return context; no unverified company claim from email domain.

**Primary action:** Continue to secure sign-in. **Interaction:** Cognito-managed flow or reviewed adapter; pass no password through ordinary app analytics/API; resume intended permitted destination after validation.

**High-fidelity specification:** 480 px centered form card; 24 px heading, full-width 44 px actions; visible labels and quiet privacy text; managed IdP branding mirrors approved tokens where supported. Use semantic component states and token values from the shared system.

**Responsive:** Public/auth/external pages use their stated narrow layout; workspace pages follow the shared breakpoints. Preserve the reading order above, visible labels, source context and the primary action at 320 px. Wide tables/pipelines use the accessible scroll/list alternatives; no whole-page horizontal overflow.

**Critical exception and recovery:** Rate limits, verification expiry, identity conflict and recovery receive non-enumerating messages; do not preserve passwords/OTP in localStorage.

**Review acceptance UX-SCR-03:** the intended persona can identify the job, scope/status and next action using keyboard and small-screen layout; forbidden fields/actions/counts are absent; success waits for server confirmation; the exception above has a visible safe recovery. **Trace:** REQ-P002, SEC-002, UX-DELTA-04.

<a id="scr-04"></a>
## SCR-04 — Tenant setup wizard

**Release:** R1 bounded setup. **Audience:** PER-04. **Job:** Create a correctly scoped company with explicit responsibilities.

**Wireframe / reading order**

```text
[ Step 1 Company and approved home region ]
[ Step 2 Legal entity, authority, timezone and currency ]
[ Step 3 Access roles and supported module/trial/order ]
[ Step 4 Approved privacy/retention responsibility ]
[ Step 5 Review scope, expiry, access and create ]
[ Back | Save permitted progress | Continue / Create workspace ]
```

**Information and fields:** Company name, entity code/name, factual authority/country, IANA timezone, currency, admin scope, selected supported modules, terms/retention decision references.

**Primary action:** Continue; final Create workspace. **Interaction:** Five-step ordered list; validate each step server-side, show saved status; review summary names consequences; residency is a supported fixed UAE home cell with a review route for other needs.

**High-fidelity specification:** Left 240 px progress panel and 640 px form on wide screens; mobile progress text Step N of 5 above one-column form; active step indigo, completed step icon/text. Use semantic component states and token values from the shared system.

**Responsive:** Public/auth/external pages use their stated narrow layout; workspace pages follow the shared breakpoints. Preserve the reading order above, visible labels, source context and the primary action at 320 px. Wide tables/pipelines use the accessible scroll/list alternatives; no whole-page horizontal overflow.

**Critical exception and recovery:** No default legal certification, automatic compliance pack, unreviewed retention acceptance or instant international migration; pending prerequisites remain Pending setup.

**Review acceptance UX-SCR-04:** the intended persona can identify the job, scope/status and next action using keyboard and small-screen layout; forbidden fields/actions/counts are absent; success waits for server confirmation; the exception above has a visible safe recovery. **Trace:** REQ-P005/P007/P012, REQ-E002/E010, UX-DELTA-04.

<a id="scr-05"></a>
## SCR-05 — Organization settings

**Release:** R1 supported administration. **Audience:** PER-04. **Job:** Manage company context and safe access without obtaining all sensitive data.

**Wireframe / reading order**

```text
[ Settings navigation: Organization | Access | Privacy | Audit ]
[ Entity list: name | authority | timezone | currency ]
[ Access: membership role + explicit scope + expiry ]
[ Privacy: approved schedule, requests and scoped holds ]
[ Audit: permitted filters and redacted event detail ]
```

**Information and fields:** Entity/contact settings, verified memberships, custom/delegable roles, access expiry, schedule/hold references and redacted audit facts.

**Primary action:** Context-specific Add entity / Invite member / Request reviewed change. **Interaction:** Use distinct forms and step-up confirmation for high-impact changes; show current scope before role grant; residency and built-in bundles are not casual editable fields.

**High-fidelity specification:** Settings rail 200 px inside main shell; form sections max 720 px; one Save per form, unsaved-change guard; audit detail is a labelled side panel. Use semantic component states and token values from the shared system.

**Responsive:** Public/auth/external pages use their stated narrow layout; workspace pages follow the shared breakpoints. Preserve the reading order above, visible labels, source context and the primary action at 320 px. Wide tables/pipelines use the accessible scroll/list alternatives; no whole-page horizontal overflow.

**Critical exception and recovery:** Owner/billing authority does not imply salary access; revoke confirmation explains current sessions/links; no raw credential or personal-document display.

**Review acceptance UX-SCR-05:** the intended persona can identify the job, scope/status and next action using keyboard and small-screen layout; forbidden fields/actions/counts are absent; success waits for server confirmation; the exception above has a visible safe recovery. **Trace:** REQ-P002/P003/P004/P005/P010/P012, REQ-E014.

<a id="scr-06"></a>
## SCR-06 — Executive dashboard

**Release:** R1 agency; Later full-suite composition. **Audience:** PER-01; later scoped executives. **Job:** See decision-ready cross-domain summaries without mixing incompatible numbers.

**Wireframe / reading order**

```text
[ Title + scope and as-of | Customize approved view | Export ]
[ Filters: date/cohort | entity | permitted source dimensions ]
[ R1: confirmed starts | on-time starts | overdue tasks | slippage ]
[ Later: workforce | payroll cost coverage | recruitment | retention | pipeline ]
[ Charts + source tables + visible definitions/freshness ]
[ Attention list linked to authorized source records ]
```

**Information and fields:** Registered metric cards, context/date basis, source freshness, no-data/permission states, source record links.

**Primary action:** Investigate the highest-priority permitted exception. **Interaction:** Use dashboard EXEC contract; chart click shows explicit filter chips and source table; comparison stays within metric/currency/cohort semantics.

**High-fidelity specification:** Four R1 cards across at large size; future 8/4 analytics grid with separate cost and pipeline currency panels; 32 px KPI figures and 14 px numerator/context; no rainbow financial tiles. Use semantic component states and token values from the shared system.

**Responsive:** Public/auth/external pages use their stated narrow layout; workspace pages follow the shared breakpoints. Preserve the reading order above, visible labels, source context and the primary action at 320 px. Wide tables/pipelines use the accessible scroll/list alternatives; no whole-page horizontal overflow.

**Critical exception and recovery:** No employer-cost value until UX-DELTA-01 is resolved; net payroll remains labelled net; missing modules never become zero or a forced upsell.

**Review acceptance UX-SCR-06:** the intended persona can identify the job, scope/status and next action using keyboard and small-screen layout; forbidden fields/actions/counts are absent; success waits for server confirmation; the exception above has a visible safe recovery. **Trace:** REQ-D001, REQ-K001–K006/K011/K016/K017, UX-DELTA-01/02.

<a id="scr-07"></a>
## SCR-07 — HR dashboard

**Release:** Later. **Audience:** PER-05. **Job:** Understand workforce movements and administration priorities.

**Wireframe / reading order**

```text
[ HR title | Leadership / Operations tabs ]
[ Date/as-of | entity | department/team | employment type ]
[ Leadership: headcount | turnover | lifecycle completion ]
[ Operations: lifecycle completion | request backlog ]
[ Trend/cohort chart | due cases table | source drill-down ]
```

**Information and fields:** KPI keys kpi.005–008, employment/calendar context, effective department assignment, scoped case lists.

**Primary action:** Open authorized lifecycle or request case. **Interaction:** Leadership and operations have separate permission compositions; switching tabs does not widen scope; historical headcount uses historical records.

**High-fidelity specification:** Shared dashboard anatomy; 3 cards + 8/4 charts/table; title reflects permitted entity not all-company assumption; clear employment vs person count subtitle. Use semantic component states and token values from the shared system.

**Responsive:** Public/auth/external pages use their stated narrow layout; workspace pages follow the shared breakpoints. Preserve the reading order above, visible labels, source context and the primary action at 320 px. Wide tables/pipelines use the accessible scroll/list alternatives; no whole-page horizontal overflow.

**Critical exception and recovery:** Restricted cases/exit details stay excluded; a zero denominator or missing history is N/A/Unavailable, not 0% turnover.

**Review acceptance UX-SCR-07:** the intended persona can identify the job, scope/status and next action using keyboard and small-screen layout; forbidden fields/actions/counts are absent; success waits for server confirmation; the exception above has a visible safe recovery. **Trace:** REQ-D002/D003, REQ-K005–K008, UX-DELTA-02.

<a id="scr-08"></a>
## SCR-08 — Employee directory

**Release:** Later. **Audience:** PER-05; separately permitted employees. **Job:** Find the correct employment record with safe directory fields.

**Wireframe / reading order**

```text
[ People > Employees | Add employee if permitted ]
[ Search | entity | department/team | employment status ]
[ Table: name | employee code | entity | role | manager | status ]
[ Selected employee opens full permitted profile ]
[ Cursor paging and column selector ]
```

**Information and fields:** Approved work-directory fields only; employment vs person identity, active/as-of filter.

**Primary action:** Open employee profile. **Interaction:** Use actual links not clickable-row-only behavior; search excludes forbidden fields/counts; bulk actions appear only for explicit selection/permission.

**High-fidelity specification:** 48 px comfortable rows, textual name + optional initials not stock faces; sticky header; private data absent from default columns; mobile summary retains name/entity/status. Use semantic component states and token values from the shared system.

**Responsive:** Public/auth/external pages use their stated narrow layout; workspace pages follow the shared breakpoints. Preserve the reading order above, visible labels, source context and the primary action at 320 px. Wide tables/pipelines use the accessible scroll/list alternatives; no whole-page horizontal overflow.

**Critical exception and recovery:** No salary, bank IDs, health details or candidate records; clarify multiple employment periods rather than merging names.

**Review acceptance UX-SCR-08:** the intended persona can identify the job, scope/status and next action using keyboard and small-screen layout; forbidden fields/actions/counts are absent; success waits for server confirmation; the exception above has a visible safe recovery. **Trace:** REQ-F004/F046, REQ-P001/P003/P011.

<a id="scr-09"></a>
## SCR-09 — Employee profile

**Release:** Later. **Audience:** PER-05/07/08 with distinct scopes. **Job:** Understand the correct current and historical employment context.

**Wireframe / reading order**

```text
[ Name | employee code | entity and employment period | status ]
[ Tabs: Overview | Employment history | Requests | restricted tabs if permitted ]
[ Current role/manager/calendar; effective date controls ]
[ Timeline: terms, entity changes, approved corrections ]
[ Restricted information revealed only after field authorization/step-up ]
```

**Information and fields:** Employment history and effective organization assignments, explicit record dates, allowed contacts, source/provenance; restricted financial/document data separately gated.

**Primary action:** Propose an authorized employment change. **Interaction:** Edits follow reviewed change/proposal workflow; history cannot be overwritten; self-service fields are narrower than HR administration.

**High-fidelity specification:** 8/4 summary/detail composition; 160 px label rail in definition lists; date ranges labelled Effective and Recorded; no visible empty restricted tab titles for unauthorized viewers. Use semantic component states and token values from the shared system.

**Responsive:** Public/auth/external pages use their stated narrow layout; workspace pages follow the shared breakpoints. Preserve the reading order above, visible labels, source context and the primary action at 320 px. Wide tables/pipelines use the accessible scroll/list alternatives; no whole-page horizontal overflow.

**Critical exception and recovery:** An employee cannot read another profile via URL; transfer access changes invalidate stale sections; original history is retained.

**Review acceptance UX-SCR-09:** the intended persona can identify the job, scope/status and next action using keyboard and small-screen layout; forbidden fields/actions/counts are absent; success waits for server confirmation; the exception above has a visible safe recovery. **Trace:** REQ-F004/F005/F008/F009/F046, REQ-P011/P012.

<a id="scr-10"></a>
## SCR-10 — Recruitment pipeline

**Release:** Later ATS. **Audience:** PER-02; hiring teams. **Job:** Manage requisitions and application stages with explicit decisions.

**Wireframe / reading order**

```text
[ Recruitment | requisition and hiring-team scope ]
[ Approved requisition filter | stage | owner | date ]
[ Pipeline: New | Screening | Interview | Offer | terminal views ]
[ Application list/card: candidate reference | role | owner | next action ]
[ Detail: structured review and versioned approved offer ]
```

**Information and fields:** Applications, separate requisitions, permitted candidate fields, interview/offer states and source history.

**Primary action:** Open application / perform named stage action. **Interaction:** Provide Move to stage and keyboard menu; drag is optional and still opens required confirmation; accepted offer handoff is distinct from employment/start.

**High-fidelity specification:** Desktop 280 px minimum pipeline columns with labelled horizontal region; 12 px card radius, subdued metadata; mobile defaults to list with stage select. Use semantic component states and token values from the shared system.

**Responsive:** Public/auth/external pages use their stated narrow layout; workspace pages follow the shared breakpoints. Preserve the reading order above, visible labels, source context and the primary action at 320 px. Wide tables/pipelines use the accessible scroll/list alternatives; no whole-page horizontal overflow.

**Critical exception and recovery:** No autonomous screening/ranking or hidden feedback leakage; blocked offer approval explains prerequisites; R1 Placements is a different screen.

**Review acceptance UX-SCR-10:** the intended persona can identify the job, scope/status and next action using keyboard and small-screen layout; forbidden fields/actions/counts are absent; success waits for server confirmation; the exception above has a visible safe recovery. **Trace:** REQ-F011/F012/F044/F045, WF-001.

<a id="scr-11"></a>
## SCR-11 — Payroll workspace

**Release:** Later; inputs before engine. **Audience:** PER-06. **Job:** Resolve inputs and safely distinguish approval, export and payment.

**Wireframe / reading order**

```text
[ Payroll | entity | pay period | provider | currency ]
[ Status rail: Draft > Review > Approved > Exported > provider evidence ]
[ Input completeness | unresolved exceptions | approved net when supported ]
[ Exceptions table with owner/source/version and totals reconciliation ]
[ Prepare / Submit / Approve / Generate reviewed export actions ]
```

**Information and fields:** kpi.009/010, later kpi.011, pay-period/currency, approved source revisions, preparer/approver, rule/provider coverage.

**Primary action:** Resolve exception or perform next permitted stage. **Interaction:** No universal Run payroll CTA; preparer and approver see different enabled actions; totals drill into authorized source rows; risky actions use step-up/review.

**High-fidelity specification:** Full-width financial table with sticky identifiers and separate currency sections; use tabular numbers, no red/green-only differences; evidence panel occupies right 4 columns. Use semantic component states and token values from the shared system.

**Responsive:** Public/auth/external pages use their stated narrow layout; workspace pages follow the shared breakpoints. Preserve the reading order above, visible labels, source context and the primary action at 320 px. Wide tables/pipelines use the accessible scroll/list alternatives; no whole-page horizontal overflow.

**Critical exception and recovery:** Unsupported rule/provider blocks output, not an upsell to bypass review; self-approval denied; export/accepted file never displays Paid without evidence.

**Review acceptance UX-SCR-11:** the intended persona can identify the job, scope/status and next action using keyboard and small-screen layout; forbidden fields/actions/counts are absent; success waits for server confirmation; the exception above has a visible safe recovery. **Trace:** REQ-F013–F016/F042/F043, REQ-D005, REQ-K009–K011.

<a id="scr-12"></a>
## SCR-12 — Leave and attendance workspace

**Release:** Later. **Audience:** PER-05/07/08 scoped modes. **Job:** Inspect absence/time records and make authorized decisions.

**Wireframe / reading order**

```text
[ Workforce | Leave / Attendance tabs; scheduling Later when entitled ]
[ Date/as-of | entity | department/team | configured calendar ]
[ Leave request list with units and balance/reservation context ]
[ Attendance exceptions table: source | approved correction | owner ]
[ Request detail / Approve / Reject with source history ]
```

**Information and fields:** Working/calendar-day or minute units, local work dates, source versions, approval status and scoped employment references.

**Primary action:** Submit request for self or review assigned approval. **Interaction:** Calendar is optional visualization with a list alternative; distinguish planned leave and actual attendance; no medical attachment in general manager view.

**High-fidelity specification:** Two-tab workspace, contextual toolbar, neutral calendar heat and explicit labels; mobile agenda list replaces dense month grid; configured holidays retain provenance. Use semantic component states and token values from the shared system.

**Responsive:** Public/auth/external pages use their stated narrow layout; workspace pages follow the shared breakpoints. Preserve the reading order above, visible labels, source context and the primary action at 320 px. Wide tables/pipelines use the accessible scroll/list alternatives; no whole-page horizontal overflow.

**Critical exception and recovery:** Missing attendance is an exception, not confirmed absence; no fixed UAE weekend or frontend balance calculation; stale updates require revalidation.

**Review acceptance UX-SCR-12:** the intended persona can identify the job, scope/status and next action using keyboard and small-screen layout; forbidden fields/actions/counts are absent; success waits for server confirmation; the exception above has a visible safe recovery. **Trace:** REQ-F006/F007/F017/F018/F019/F020, REQ-K012–K015.

<a id="scr-13"></a>
## SCR-13 — Performance reviews

**Release:** Later. **Audience:** PER-05/07/08 scoped modes. **Job:** Complete goals and review stages without exposing drafts.

**Wireframe / reading order**

```text
[ Talent > Performance | cycle and allowed cohort ]
[ Tabs: My reviews | Assigned reviews | Calibration if authorized ]
[ Table: employee/self | stage | due date | next permitted action ]
[ Review form: goals, rubric labels, draft vs published feedback ]
[ Submit / Publish / reasoned calibration workflow ]
```

**Information and fields:** Cycle/rubric version, permitted feedback/goals, reviewer relationships, publication/acknowledgment states.

**Primary action:** Continue assigned review. **Interaction:** Explicit draft/saved/submitted/published language; preserve safe draft server-side; calibration changes require a reason and authorized cohort.

**High-fidelity specification:** Readable 760 px form column, 240 px context panel; anchored section navigation; numeric scales have descriptions, not unlabelled stars or color-only rankings. Use semantic component states and token values from the shared system.

**Responsive:** Public/auth/external pages use their stated narrow layout; workspace pages follow the shared breakpoints. Preserve the reading order above, visible labels, source context and the primary action at 320 px. Wide tables/pipelines use the accessible scroll/list alternatives; no whole-page horizontal overflow.

**Critical exception and recovery:** No invented performance KPI/AI recommendation; missing reviews are work items; unpublished reviewer comments stay private.

**Review acceptance UX-SCR-13:** the intended persona can identify the job, scope/status and next action using keyboard and small-screen layout; forbidden fields/actions/counts are absent; success waits for server confirmation; the exception above has a visible safe recovery. **Trace:** REQ-F024/F025/F028, REQ-P003/P012.

<a id="scr-14"></a>
## SCR-14 — CRM sales pipeline

**Release:** Later. **Audience:** PER-09. **Job:** Progress opportunities and understand pipeline without inventing revenue.

**Wireframe / reading order**

```text
[ Sales | Pipeline / Summary tabs ]
[ Owner/team | entity | close period | currency ]
[ Qualified | Discovery | Proposal | Negotiation | terminal views ]
[ Opportunity amount, currency, next activity and accountable owner ]
[ Summary: pipeline value by stage/currency and win-rate cohort ]
```

**Information and fields:** kpi.016/017, opportunity/quote state history and commercial evidence; no employee/candidate joins.

**Primary action:** Open opportunity / perform next authorized stage action. **Interaction:** Keyboard/list alternatives to drag; won requires accepted evidence; quote terms/discount approval separate; no weighted forecast unless registered independently.

**High-fidelity specification:** Use same pipeline pattern as ATS with different domain labels/colors; currency always adjacent to amount; summary charts grouped, not one mixed-currency total. Use semantic component states and token values from the shared system.

**Responsive:** Public/auth/external pages use their stated narrow layout; workspace pages follow the shared breakpoints. Preserve the reading order above, visible labels, source context and the primary action at 320 px. Wide tables/pipelines use the accessible scroll/list alternatives; no whole-page horizontal overflow.

**Critical exception and recovery:** Pipeline is not recognized revenue or cash; lost/reopen preserves history; restricted contracts remain absent for unpermitted users.

**Review acceptance UX-SCR-14:** the intended persona can identify the job, scope/status and next action using keyboard and small-screen layout; forbidden fields/actions/counts are absent; success waits for server confirmation; the exception above has a visible safe recovery. **Trace:** REQ-F031/F032/F051, REQ-D008, REQ-K016/K017.

<a id="scr-15"></a>
## SCR-15 — Customer account detail

**Release:** R1 client references; Later account suite. **Audience:** PER-02/09/10 scoped roles. **Job:** Understand the relationship without crossing tenant or domain boundaries.

**Wireframe / reading order**

```text
[ Client name | reference code | relationship owner | status ]
[ R1 tabs: Overview | Contacts | permitted placements ]
[ Later entitled tabs: Opportunities | Contracts | Success | Support ]
[ Scoped activity/source records, not a merged people dossier ]
[ Open linked record / Add permitted contact ]
```

**Information and fields:** Client reference, approved work contacts, assigned placements; later commercial/CS/support records independently authorized.

**Primary action:** Add contact or open authorized placement. **Interaction:** Tabs and counts depend on module AND source permissions; client record is not another tenant workspace; shared placement grants remain explicit.

**High-fidelity specification:** Header with understated client initials, 8/4 context layout and stable tabs; show source/module label on timeline items; no inaccessible tab-count teaser. Use semantic component states and token values from the shared system.

**Responsive:** Public/auth/external pages use their stated narrow layout; workspace pages follow the shared breakpoints. Preserve the reading order above, visible labels, source context and the primary action at 320 px. Wide tables/pipelines use the accessible scroll/list alternatives; no whole-page horizontal overflow.

**Critical exception and recovery:** No automatic sharing of all placements with a contact; restricted ticket or salary details never flow through an account timeline.

**Review acceptance UX-SCR-15:** the intended persona can identify the job, scope/status and next action using keyboard and small-screen layout; forbidden fields/actions/counts are absent; success waits for server confirmation; the exception above has a visible safe recovery. **Trace:** REQ-F029/F030/F033–F036, REQ-P003.

<a id="scr-16"></a>
## SCR-16 — Reports center and exports

**Release:** R1 agency subset. **Audience:** PER-01/02/04; later report users. **Job:** Run explainable registered reports and retrieve safe files.

**Wireframe / reading order**

```text
[ Reports | Catalogue / Saved views / Export jobs ]
[ Select registered metric/report | source-aware filters | as-of ]
[ Chart + matching table + definition/context ]
[ Generate: PDF / CSV / XLSX | separate Print report ]
[ Jobs: queued / generating / ready / failed / expired ]
```

**Information and fields:** Metric definitions/versions, authorized filters, freshness, snapshot scope, export format/row limit, job/result expiry.

**Primary action:** Run report; then Generate export. **Interaction:** Same snapshot across visual/table/files; authenticated current-permission download; save view never saves access rights; scheduled delivery appears only Later.

**High-fidelity specification:** Report selector and filter summary across top; preview main area 8 columns, definitions panel 4; export dialog shows exact scope, row cap and expiry before queueing. Use semantic component states and token values from the shared system.

**Responsive:** Public/auth/external pages use their stated narrow layout; workspace pages follow the shared breakpoints. Preserve the reading order above, visible labels, source context and the primary action at 320 px. Wide tables/pipelines use the accessible scroll/list alternatives; no whole-page horizontal overflow.

**Critical exception and recovery:** No silent 5,000-row truncation or arbitrary SQL; changed permissions invalidate old artifacts; print excludes app navigation and includes filters/as-of/pages.

**Review acceptance UX-SCR-16:** the intended persona can identify the job, scope/status and next action using keyboard and small-screen layout; forbidden fields/actions/counts are absent; success waits for server confirmation; the exception above has a visible safe recovery. **Trace:** REQ-F039, REQ-R001–R010, REQ-E005, UX-DELTA-05.

<a id="scr-17"></a>
## SCR-17 — Workflow builder and placement templates

**Release:** R1 checklist version editor; Later automation builder. **Audience:** PER-04. **Job:** Configure reviewed workflow versions without arbitrary execution.

**Wireframe / reading order**

```text
[ Automation/templates | version | Draft / Published ]
[ R1: ordered milestones and required task definitions ]
[ Task fields: label | owner policy | due offset | required ]
[ Preview impact on new vs existing placements ]
[ Publish new version; Later governed trigger/action canvas ]
```

**Information and fields:** Template revision, milestone/task keys, required flag, due offset and permitted role policy; later registered triggers/actions/depth/budget.

**Primary action:** Publish reviewed version. **Interaction:** R1 uses a structured list editor, no custom code/branching or automation license requirement for fixed reminders; later canvas always has equivalent outline/keyboard editing.

**High-fidelity specification:** 280 px template list, central ordered form, 320 px preview panel at wide size; draggable handles optional only; publish review dialog compares old/new version. Use semantic component states and token values from the shared system.

**Responsive:** Public/auth/external pages use their stated narrow layout; workspace pages follow the shared breakpoints. Preserve the reading order above, visible labels, source context and the primary action at 320 px. Wide tables/pipelines use the accessible scroll/list alternatives; no whole-page horizontal overflow.

**Critical exception and recovery:** Published version stays immutable; existing placements migrate only explicitly; disabled source/action module blocks or pauses the relevant later rule.

**Review acceptance UX-SCR-17:** the intended persona can identify the job, scope/status and next action using keyboard and small-screen layout; forbidden fields/actions/counts are absent; success waits for server confirmation; the exception above has a visible safe recovery. **Trace:** REQ-P012, REQ-F002/F037/F038, REQ-E004/E006, UX-DELTA-03.

<a id="scr-18"></a>
## SCR-18 — Module marketplace

**Release:** R1 supported admin catalogue. **Audience:** PER-04. **Job:** Discover supported scope and change module state safely.

**Wireframe / reading order**

```text
[ Modules | Available / Enabled / Archived / Planned ]
[ Domain filters and search of approved catalogue ]
[ Cards: purpose | dependencies | state | supported release ]
[ Detail: capabilities, permissions, data/retention and commercial scope ]
[ Preview activation/deactivation/retained-data effect ]
```

**Information and fields:** Stable module identity behind readable name, supported feature subset, dependencies, package/retention state and approved commercial terms.

**Primary action:** Review change for supported module; Planned has no activate action. **Interaction:** Server-derived states, dependency preview and explicit confirmation; disabled switch is not a silent billing purchase; archived modules expose authorized retained data/export.

**High-fidelity specification:** Three 320 px-min cards on wide view, one on mobile; status + text prominent, no ornamental app logos; expanded detail is a full page on small screens. Use semantic component states and token values from the shared system.

**Responsive:** Public/auth/external pages use their stated narrow layout; workspace pages follow the shared breakpoints. Preserve the reading order above, visible labels, source context and the primary action at 320 px. Wide tables/pipelines use the accessible scroll/list alternatives; no whole-page horizontal overflow.

**Critical exception and recovery:** Unreviewed country packs and unsupported modules remain unavailable regardless of plan; no price estimate or activation success invented by UI.

**Review acceptance UX-SCR-18:** the intended persona can identify the job, scope/status and next action using keyboard and small-screen layout; forbidden fields/actions/counts are absent; success waits for server confirmation; the exception above has a visible safe recovery. **Trace:** REQ-M001–M026, REQ-E003–E007/E012.

<a id="scr-19"></a>
## SCR-19 — Subscription management

**Release:** R1 manual contract/trial; automated billing Later. **Audience:** PER-04. **Job:** Understand capacity, contract changes and exit without surprise charges.

**Wireframe / reading order**

```text
[ Subscription | current plan/order | trial expiry if applicable ]
[ Usage: internal seats, active placements and relevant limits ]
[ Included supported scope and add-on/service records ]
[ Request upgrade / Review downgrade / Cancel under contract ]
[ Read-only/export window and change history ]
```

**Information and fields:** Authoritative plan/order, limit definitions, accepted terms/effective date, usage gauges, external participant treatment and data window.

**Primary action:** Request reviewed plan change. **Interaction:** Show actual contract amount only when supplied by accepted order; no self-service proration/card flow in R1; preserve over-cap records and explain blocked new allocation.

**High-fidelity specification:** Two-column contract summary + usage at large size; gauges pair numeric used/limit and text, no shame colors; cancellation review is a readable consequence checklist. Use semantic component states and token values from the shared system.

**Responsive:** Public/auth/external pages use their stated narrow layout; workspace pages follow the shared breakpoints. Preserve the reading order above, visible labels, source context and the primary action at 320 px. Wide tables/pipelines use the accessible scroll/list alternatives; no whole-page horizontal overflow.

**Critical exception and recovery:** Trial expiry has no auto-charge; no retention promise from a plan label; reactivation cannot restore deleted data or replay jobs.

**Review acceptance UX-SCR-19:** the intended persona can identify the job, scope/status and next action using keyboard and small-screen layout; forbidden fields/actions/counts are absent; success waits for server confirmation; the exception above has a visible safe recovery. **Trace:** REQ-E002/E008–E013, MODULE_CATALOG plan definitions.

<a id="scr-20"></a>
## SCR-20 — Employee self-service portal

**Release:** Later. **Audience:** PER-08. **Job:** Understand own requests and records on any device.

**Wireframe / reading order**

```text
[ My workspace | verified company context | own identity ]
[ Leave balance by type/unit | own request status ]
[ Actions: Request leave | View own payslip if permitted | Get help ]
[ Own notices/acknowledgments and upcoming work context ]
[ Profile/request detail with safe return navigation ]
```

**Information and fields:** kpi.014/015, approved own records and relevant source entitlements; no global employee counts.

**Primary action:** Continue or submit a self request. **Interaction:** Self-only scope, no arbitrary employee selector; versioned acknowledgment not assumed from email; sensitive detail/download reauthorization.

**High-fidelity specification:** Mobile-first single column, large clear action tiles, compact two-card summary when labels fit; own request table becomes labelled summary cards. Use semantic component states and token values from the shared system.

**Responsive:** Public/auth/external pages use their stated narrow layout; workspace pages follow the shared breakpoints. Preserve the reading order above, visible labels, source context and the primary action at 320 px. Wide tables/pipelines use the accessible scroll/list alternatives; no whole-page horizontal overflow.

**Critical exception and recovery:** Do not insert planned/unlicensed source sections or expose bank/medical info by default; old payslip link cannot bypass revoked access.

**Review acceptance UX-SCR-20:** the intended persona can identify the job, scope/status and next action using keyboard and small-screen layout; forbidden fields/actions/counts are absent; success waits for server confirmation; the exception above has a visible safe recovery. **Trace:** REQ-F021/F022/F050, REQ-D007, REQ-K014/K015.

<a id="scr-21"></a>
## SCR-21 — Manager portal

**Release:** Later. **Audience:** PER-07. **Job:** Resolve assigned approvals and team coverage with minimal private data.

**Wireframe / reading order**

```text
[ Team workspace | allowed team/entity | relevant date/calendar ]
[ Pending approvals | Shift coverage only when entitled ]
[ Approval queue: type | employee/work context | due date | action ]
[ Team coverage/absence view with list alternative ]
[ Decision detail: source evidence + approve/reject reason ]
```

**Information and fields:** kpi.013 and later kpi.012, effective team scope, delegation expiry and source permissions.

**Primary action:** Review next assigned approval. **Interaction:** Never approve directly from an opaque metric card; show source units/policy; delegation/current scope rechecked at decision; roster drag has explicit alternatives.

**High-fidelity specification:** 4-column summary at wide, 8/4 queue/coverage split; mobile queue first; sensitive supporting fields absent rather than blurred teasers. Use semantic component states and token values from the shared system.

**Responsive:** Public/auth/external pages use their stated narrow layout; workspace pages follow the shared breakpoints. Preserve the reading order above, visible labels, source context and the primary action at 320 px. Wide tables/pipelines use the accessible scroll/list alternatives; no whole-page horizontal overflow.

**Critical exception and recovery:** No payroll/medical access from manager label; waiting source or expired delegation blocks action safely; department choices restricted to actual scope.

**Review acceptance UX-SCR-21:** the intended persona can identify the job, scope/status and next action using keyboard and small-screen layout; forbidden fields/actions/counts are absent; success waits for server confirmation; the exception above has a visible safe recovery. **Trace:** REQ-D006, REQ-K012/K013, REQ-P003.

<a id="scr-22"></a>
## SCR-22 — Accepted placements workspace

**Release:** R1. **Audience:** PER-01/02. **Job:** Find and prioritize accepted placements without a full ATS replacement.

**Wireframe / reading order**

```text
[ Placements | Add accepted placement | Import CSV ]
[ Date basis | entity | client | owner | supported status filter ]
[ Table: candidate reference | client | original/current start | owner | status ]
[ Attention: overdue mandatory tasks and open exceptions ]
[ Open record | permitted bulk/view actions only ]
```

**Information and fields:** Minimal candidate reference, original/current dates, owner/client, workflow status and distinct exception count; current authorized scope.

**Primary action:** Add accepted placement. **Interaction:** Use named statuses accepted/coordinating/ready/started/canceled; Needs attention is a derived view, not a new mutable state; new placement requires client, owner and template.

**High-fidelity specification:** Full-width 48 px table with original/current date labels, text badges and explicit name link; filter chips summarize date basis; mobile selected record opens full detail. Use semantic component states and token values from the shared system.

**Responsive:** Public/auth/external pages use their stated narrow layout; workspace pages follow the shared breakpoints. Preserve the reading order above, visible labels, source context and the primary action at 320 px. Wide tables/pipelines use the accessible scroll/list alternatives; no whole-page horizontal overflow.

**Critical exception and recovery:** No permit status invented, no candidate documents uploaded, no silent email merge; over-cap creation explains request-admin path.

**Review acceptance UX-SCR-22:** the intended persona can identify the job, scope/status and next action using keyboard and small-screen layout; forbidden fields/actions/counts are absent; success waits for server confirmation; the exception above has a visible safe recovery. **Trace:** REQ-F001/F002/F029/F040, REQ-E008, UX-DELTA-03.

<a id="scr-23"></a>
## SCR-23 — Placement detail and decision review

**Release:** R1. **Audience:** PER-01/02. **Job:** Complete accountable tasks and preserve start decisions/history.

**Wireframe / reading order**

```text
[ Candidate reference + Client | lifecycle status + open exceptions ]
[ Original planned start | Current plan | owner | source/as-of ]
[ Milestone tasks with required flag, due date, owner and status ]
[ Decision panel: prerequisites | Mark ready / Confirm start ]
[ History: replans, waivers, shared task changes and actor/time ]
```

**Information and fields:** Placement, milestones, tasks, safe evidence references, exceptions, readiness decision, participant grants and append-only transitions.

**Primary action:** Next permitted action, context-sensitive. **Interaction:** Assign/complete/waive through explicit actions; replan reason, readiness review and actual start confirmation have distinct dialogs; client invitation previews shared fields.

**High-fidelity specification:** 8-column milestone/task panel plus 4-column decision panel; original date never visually replaced by current; required tasks use labelled chips; history has meaningful date groups. Use semantic component states and token values from the shared system.

**Responsive:** Public/auth/external pages use their stated narrow layout; workspace pages follow the shared breakpoints. Preserve the reading order above, visible labels, source context and the primary action at 320 px. Wide tables/pipelines use the accessible scroll/list alternatives; no whole-page horizontal overflow.

**Critical exception and recovery:** Incomplete required work blocks readiness; stale version offers safe compare/reload; no optimistic start/payment/legal clearance; history survives reopen.

**Review acceptance UX-SCR-23:** the intended persona can identify the job, scope/status and next action using keyboard and small-screen layout; forbidden fields/actions/counts are absent; success waits for server confirmation; the exception above has a visible safe recovery. **Trace:** REQ-F001–F003, REQ-P006/P012, WF-001.

<a id="scr-24"></a>
## SCR-24 — Import wizard and error review

**Release:** R1. **Audience:** PER-02. **Job:** Bring valid existing placements in atomically and fix precise errors.

**Wireframe / reading order**

```text
[ Import placements | Choose / Map / Validate / Review / Result ]
[ Select CSV or download documented template ]
[ Allowed field mapping with sample-safe preview ]
[ Validation: row number | column | code | correction guidance ]
[ Commit N placements | capacity impact | result links ]
```

**Information and fields:** Source profile/hash, permitted field mapping, ISO dates/timezones, row count, error codes, preview totals, source-key conflict and usage.

**Primary action:** Validate file; then Commit reviewed import. **Interaction:** Visible Choose file button in addition to drop zone; mapping persists safely, validation results are keyboard-navigable; same operation retry returns prior batch result.

**High-fidelity specification:** Step header, central table and compact summary card; no animated fake progress; max 1,000 rows/10 MiB and CSV-only rule near file control. Use semantic component states and token values from the shared system.

**Responsive:** Public/auth/external pages use their stated narrow layout; workspace pages follow the shared breakpoints. Preserve the reading order above, visible labels, source context and the primary action at 320 px. Wide tables/pipelines use the accessible scroll/list alternatives; no whole-page horizontal overflow.

**Critical exception and recovery:** A single bad row blocks commit; reject forbidden identity/medical/bank fields and formulas; error exports do not expose raw unpermitted values.

**Review acceptance UX-SCR-24:** the intended persona can identify the job, scope/status and next action using keyboard and small-screen layout; forbidden fields/actions/counts are absent; success waits for server confirmation; the exception above has a visible safe recovery. **Trace:** REQ-F040, REQ-E008/E009, UX-DELTA-03.

<a id="scr-25"></a>
## SCR-25 — Scoped client task portal

**Release:** R1 external view. **Audience:** PER-03. **Job:** Complete invited work without entering the agency administration UI.

**Wireframe / reading order**

```text
[ Agency identity | Shared placement context | Help / Sign out ]
[ Only fields explicitly shared with this participant ]
[ Assigned task: instructions | due date | completion action ]
[ Submitted / pending agency review state ]
[ No other-client navigation, search or module marketplace ]
```

**Information and fields:** One placement grant, approved field projection, assigned task status and approved help contact; no document files in R1.

**Primary action:** Complete assigned task. **Interaction:** Confirm task submission separately from agency readiness; provide mobile/keyboard-friendly task instructions; old link rechecks grant and current membership.

**High-fidelity specification:** Max width 760 px centered panel, 48 px actions, readable 18 px task text; no full sidebar; actor/time receipt after server completion. Use semantic component states and token values from the shared system.

**Responsive:** Public/auth/external pages use their stated narrow layout; workspace pages follow the shared breakpoints. Preserve the reading order above, visible labels, source context and the primary action at 320 px. Wide tables/pipelines use the accessible scroll/list alternatives; no whole-page horizontal overflow.

**Critical exception and recovery:** Expired/revoked grant uses safe recovery copy; no complete-client list, candidate private contact, notes or other-participant directory.

**Review acceptance UX-SCR-25:** the intended persona can identify the job, scope/status and next action using keyboard and small-screen layout; forbidden fields/actions/counts are absent; success waits for server confirmation; the exception above has a visible safe recovery. **Trace:** REQ-F003, REQ-P001–P003, TEST-F003.

<a id="scr-26"></a>
## SCR-26 — Invitation, verification and recovery

**Release:** R1. **Audience:** PER-03/04. **Job:** Accept a legitimate scoped invitation or recover safely.

**Wireframe / reading order**

```text
[ You have been invited to a workspace or shared task ]
[ Verify identity via secure sign-in ]
[ Review permitted company/context and requested role scope ]
[ Accept single-use invitation ]
[ Expired / already used / access changed recovery alternatives ]
```

**Information and fields:** Verified identity, signed tenant/cell context and permitted invitation details; token never logged/displayed as data.

**Primary action:** Verify identity; then Accept invitation. **Interaction:** Accept is an explicit action; token consumption and membership/contact linking are server-confirmed; no email-domain ownership or email-only person merge.

**High-fidelity specification:** Same identity card pattern as SCR-03, concise scope summary and terms links; recovery has one clear next action and no guessed-record detail. Use semantic component states and token values from the shared system.

**Responsive:** Public/auth/external pages use their stated narrow layout; workspace pages follow the shared breakpoints. Preserve the reading order above, visible labels, source context and the primary action at 320 px. Wide tables/pipelines use the accessible scroll/list alternatives; no whole-page horizontal overflow.

**Critical exception and recovery:** Generic failure for invalid links; no membership/placement existence leak; passwords and OTP never persisted in local browser drafts.

**Review acceptance UX-SCR-26:** the intended persona can identify the job, scope/status and next action using keyboard and small-screen layout; forbidden fields/actions/counts are absent; success waits for server confirmation; the exception above has a visible safe recovery. **Trace:** REQ-P002, REQ-F003, API invitation bootstrap contract.

<a id="scr-27"></a>
## SCR-27 — Recruiter dashboard and task view

**Release:** R1. **Audience:** PER-02. **Job:** See own/team priority work and investigate source placements.

**Wireframe / reading order**

```text
[ My agency work | Own / allowed team scope | as-of ]
[ Date/cohort | entity | client | owner ]
[ Confirmed starts | on-time starts | overdue tasks | slippage ]
[ Overdue owner bar + original-date cohort summary ]
[ Priority task table linked to permitted placement detail ]
```

**Information and fields:** kpi.001–004, authorized task/placement records, explicit date basis, optional permitted team context.

**Primary action:** Open priority task or placement. **Interaction:** Default to own work without implying a company total; same shared metric renderer as executive view; table/list for all charts.

**High-fidelity specification:** Shared R1 dashboard cards, calm focus on due work; 8/4 table/context layout; mobile shows prioritized task list before charts. Use semantic component states and token values from the shared system.

**Responsive:** Public/auth/external pages use their stated narrow layout; workspace pages follow the shared breakpoints. Preserve the reading order above, visible labels, source context and the primary action at 320 px. Wide tables/pipelines use the accessible scroll/list alternatives; no whole-page horizontal overflow.

**Critical exception and recovery:** Historical backlog comparison omitted without a valid prior snapshot; no separate client-side KPI formula or unsupported department filter.

**Review acceptance UX-SCR-27:** the intended persona can identify the job, scope/status and next action using keyboard and small-screen layout; forbidden fields/actions/counts are absent; success waits for server confirmation; the exception above has a visible safe recovery. **Trace:** REQ-D004, REQ-K001–K004, UX-DELTA-02/03.

<a id="scr-28"></a>
## SCR-28 — Customer-success workspace

**Release:** Later. **Audience:** PER-10. **Job:** Identify accountable customer milestones and explainable renewal/health signals.

**Wireframe / reading order**

```text
[ Customer success | assigned account/entity | date/cohort ]
[ Renewal rate | Current health assessment coverage ]
[ Renewal cohort table | Known / stale / unknown health coverage ]
[ Owned success-plan milestones and source drill-down ]
[ Account detail opens only permitted tabs ]
```

**Information and fields:** kpi.018/019, health model/component freshness, contracts due and success milestone owner/evidence.

**Primary action:** Open due renewal or blocked success milestone. **Interaction:** Health coverage is not average health or renewal prediction; unknown factors remain unknown; restricted support inputs do not leak through health explanations.

**High-fidelity specification:** Two headline cards and 8/4 cohort/health source table; textual known/stale/unknown labels; no red danger score by default for missing telemetry. Use semantic component states and token values from the shared system.

**Responsive:** Public/auth/external pages use their stated narrow layout; workspace pages follow the shared breakpoints. Preserve the reading order above, visible labels, source context and the primary action at 320 px. Wide tables/pipelines use the accessible scroll/list alternatives; no whole-page horizontal overflow.

**Critical exception and recovery:** No multi-tenant SaaS operator controls; CS permissions do not expose salary, candidate records or restricted tickets.

**Review acceptance UX-SCR-28:** the intended persona can identify the job, scope/status and next action using keyboard and small-screen layout; forbidden fields/actions/counts are absent; success waits for server confirmation; the exception above has a visible safe recovery. **Trace:** REQ-D009, REQ-K018/K019, REQ-F033/F034.

<a id="scr-29"></a>
## SCR-29 — Customer-support workspace

**Release:** Later. **Audience:** PER-10. **Job:** Resolve assigned cases with accurate service-clock evidence.

**Wireframe / reading order**

```text
[ Support | queue/entity | date/policy | scoped agent/team ]
[ Median first human response | Resolution SLA | CSAT when publishable ]
[ Queue table: ticket | priority | state | SLA clock | owner ]
[ Ticket detail: public/private reply, evidence and reopen history ]
[ Knowledge lookup and approved publication route ]
```

**Information and fields:** kpi.020–022, captured SLA calendar/policy, ticket visibility, human-response and CSAT evidence.

**Primary action:** Open next authorized ticket. **Interaction:** Waiting pauses clock only under policy; reply visibility is explicit and previewed; automated acknowledgments never count as human response; no all-ticket search from restricted agent.

**High-fidelity specification:** Three headline metrics, queue table main panel, separate conversation/detail page on mobile; clear public reply vs internal note surfaces with text labels. Use semantic component states and token values from the shared system.

**Responsive:** Public/auth/external pages use their stated narrow layout; workspace pages follow the shared breakpoints. Preserve the reading order above, visible labels, source context and the primary action at 320 px. Wide tables/pipelines use the accessible scroll/list alternatives; no whole-page horizontal overflow.

**Critical exception and recovery:** Suppress small CSAT cohorts and prevent identity-revealing drill-down; reopened cases preserve clock history; tenant support is not vendor break-glass.

**Review acceptance UX-SCR-29:** the intended persona can identify the job, scope/status and next action using keyboard and small-screen layout; forbidden fields/actions/counts are absent; success waits for server confirmation; the exception above has a visible safe recovery. **Trace:** REQ-D010, REQ-K020–K022, REQ-F035/F036.

## WF-UI-002 — Design review package

Review SCR-03–06, SCR-15–19 bounded R1, and SCR-22–27 before extensive build. SCR-01/02 public content requires verified commercial claims. Later screens are the full-vision design and need their own data, security, regulatory and UX approval before activation. Include focus order, accessible names, keyboard alternatives, control/field errors and print layouts in any later Figma/prototype handoff; a polished default state alone is not a completed screen specification.
