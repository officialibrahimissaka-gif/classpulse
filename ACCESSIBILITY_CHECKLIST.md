# Accessibility and responsive review checklist

Version 0.1 • 1 November 2026. Target: [WCAG 2.2](https://www.w3.org/TR/WCAG22/) Level AA, with stronger usability goals where specified. This is an unexecuted implementation/research checklist except the explicitly recorded token contrast calculations. No conformance, assistive-technology testing or user-study success is claimed.

## AX-001 — Semantic structure and names

- [ ] Public, workspace, external and self-service layouts have meaningful landmarks, a working skip link and one page H1; headings follow a coherent hierarchy.
- [ ] Link/button names state the object/action; repeated row actions include record context for screen readers. Icons, loading controls, field hints and error summaries have meaningful names.
- [ ] Native forms/tables/lists are used where appropriate. ARIA roles/state match actual interaction; no decorative icon is announced as essential content.
- [ ] Tables have captions/headers, correct header association, announced sort state and named selection controls. Selected counts refer only to permitted rows.
- [ ] Form label, required state, hint and error are programmatically associated. Placeholders do not replace labels. Text spacing overrides do not clip content.

## AX-002 — Keyboard and focus

- [ ] All actions work without pointer, including navigation, tenant/entity selection, task completion, stage movement, column selection, filters, date input, import and report export.
- [ ] Drag-and-drop pipeline/template/roster operations have explicit Move/Assign/Reorder alternatives. File controls include a standard Choose file button.
- [ ] Focus is visible and not obscured by sticky headers, bottom action bars, overlays or validation banners; scroll margins accommodate the shell.
- [ ] Dialogs/menus follow documented focus entry, containment where modal, Escape/cancel and sensible focus return. No keyboard trap or unexpected automatic navigation on selection.
- [ ] Tabs and comboboxes follow an appropriate keyboard pattern. Tab order follows reading/task order and contains no offscreen unauthorized controls.
- [ ] Client/external views cannot reach hidden full-workspace actions by keyboard or deep link. Permission revocation updates focus safely without leaking a removed record.

## AX-003 — Color, contrast and content

- [ ] Normal text ≥4.5:1, qualifying large text ≥3:1, essential controls/data boundaries ≥3:1. Test actual default/hover/focus/error/read-only/tint/nav contexts, not just raw palette colors.
- [ ] Primary/secondary status, trends, required flags, exceptions, chart series and reply visibility have text/icon/shape beyond color.
- [ ] Focus ring/gap is discernible in light/tinted/dark navigation and forced-colors modes. Decorative divider tokens are not used as the only input boundary.
- [ ] Disabled explanations use readable normal text. Disabled text styling never hides essential expiry/retention/capacity consequences.
- [ ] Copy uses plain language; approved/exported/paid, ready/legally approved, company/client tenant and working/calendar days are distinct. No jargon-filled error or misleading legal certainty.

## AX-004 — Charts, dashboards and files

- [ ] Every chart has an accessible title/summary, units/currency, date/cohort/as-of and same-data table. Interactive values are reachable on keyboard focus, not hover only.
- [ ] Series remain understandable in grayscale/color-vision simulations using labels/markers/patterns; no misleading truncated bar axis, dual-axis scale or distorted funnel.
- [ ] No-data, zero, unknown, suppressed, N/A and stale source are distinct. Denominator/cohort and comparison availability are understandable to nonvisual users.
- [ ] Every dashboard supports source drill-down under permission; suppressed surveys never open individual records. Organization/team filters cannot reveal unauthorized options/counts.
- [ ] Chart/card/table/PDF/CSV/XLSX/print share central metric version/filter/snapshot and source permissions. Monetary formatting preserves exact values and currency.
- [ ] Print removes application chrome, repeats headers, includes metadata/page numbers and does not clip columns. PDF selectable text, reading order, language, headings and tags are inspected using actual output; do not assume the PDF library guarantees conformance.
- [ ] CSV/XLSX preserve safe readable headers/types and formula-neutralized text; downloads remain authenticated and meaningful denial/retry states are accessible.

## AX-005 — Forms, errors and asynchronous work

- [ ] Invalid submit focuses a linked error summary, preserves safe entered data and identifies corrections inline. Server error codes are translated to useful messages without secrets/PII leakage.
- [ ] Date/time controls support keyboard/typed entry and unambiguous localized labels; workweeks/holidays and leave units follow configured context.
- [ ] Autosave/draft/session recovery excludes passwords, OTP, identity documents and other sensitive localStorage content. Secure server drafts are reauthorized.
- [ ] Routine saved/progress messages use polite live regions; assertive alerts are reserved for urgent relevant errors. Async queues do not announce every polling cycle or move focus unexpectedly.
- [ ] No fake percentage or optimistic readiness/approval/payment success. Unknown provider outcome and stale version have a safe, keyboard-accessible recovery.
- [ ] Essential status and errors remain available inline; a disappearing toast is never the only evidence. Reduced motion does not remove state understanding.

## AX-006 — Authentication, timing and consequential actions

- [ ] Sign-in/MFA/recovery supports password managers and paste; no unnecessary memory puzzle or inaccessible CAPTCHA. Any anti-abuse alternative and external IdP behavior is reviewed.
- [ ] Required timeouts warn and allow extension where security policy permits; safe work resumes after reauthentication. A notification cannot expose a sensitive record before authorization.
- [ ] Invitation/token expiry and session/access revocation have plain safe recovery without user/record enumeration.
- [ ] Readiness, waiver, start, approval, sensitive export, role/module change and cancellation have explicit consequences and review/confirmation where required; no tiny adjacent destructive targets.
- [ ] Billing/trial/module states are understandable without relying on a toggle color; no automatic charge, hidden deletion or false activation indication.

## AX-007 — Reflow, touch and localization

- [ ] Test 320/390/768/1024/1440 CSS px widths, portrait/landscape, 200% text enlargement and 400% browser zoom/reflow. No lost context/actions or whole-page horizontal scroll.
- [ ] Essential dense tables/charts have a labelled bounded scroll area and alternate accessible data view; hidden columns remain available through an intentional detail view/export when permitted.
- [ ] Default/touch actions target ≥44×44 px. Dense desktop controls remain ≥32×32 px in this design and satisfy WCAG 2.2 target/spacing exceptions where relevant; no hover-only affordances.
- [ ] Mobile filters preserve values and have explicit Apply/Clear/Close with focus return. Mobile detail uses a readable page, not a narrow clipped side panel.
- [ ] English R1 supports Unicode names, named timezones and localized display. Arabic/RTL target tests include translated long text, logical layout, correct icon direction, bidi-isolated numbers/emails/IDs and native review before release.
- [ ] Reduced motion, forced colors, high-contrast settings, text-spacing overrides and on-screen keyboard are tested. Local fonts/fallbacks do not cause unreadable or clipped content.

## AX-008 — Permission and lifecycle accessibility

- [ ] Screen reader/DOM/HTML/print/export do not contain hidden forbidden fields, counts, chart data or tab labels. Backend authorization is tested independently from visual hiding.
- [ ] Read-only/archive retains permitted navigation/view/export and clearly explains blocked actions; a disabled button's reason is readable without hovering.
- [ ] Source/module removal invalidates old view state and downloads. Existing saved views run under the current viewer's permissions, not the creator's.
- [ ] Employee self scope, manager scope and one-placement client scope remain distinct on mobile and assistive technology. No global search leaks other records.
- [ ] Small-cohort reporting, source erasure and updated retention/permissions have safe result states without inferring an individual's sensitive information.

## AX-009 — Verification plan and evidence

| Layer | Planned verification | Required evidence |
|---|---|---|
| Tokens | Compute contrast for text/surface/tint/nav, control borders, focus and chart colors | Exact token pairs/ratios; actual states checked after implementation |
| Components | Keyboard, focus, names, zoom, errors and state combinations for C-01–C-42 | Component/state/version and reproducible manual notes; automated checks supplement |
| Automated pages | axe or equivalent plus semantic/browser assertions across key states | Actual assertions/findings, not a zero-test pass or a score alone |
| Assistive technology | NVDA with supported Chromium/Firefox; VoiceOver with Safari/iOS; test supported versions | Task-by-task results, environment versions and unresolved issues |
| R1 journeys | JRN-02–JRN-07, including keyboard client, invalid import, stale conflict, module-off and revoked export | Completion/errors/help needed and privacy/state comprehension; no invented success percentages |
| Responsive/localization | Defined sizes/zoom, touch keyboard, long names/text, RTL target, calendar/timezone/currency boundaries | Screen/state issues, reading order and overflow evidence |
| Files | Actual PDF/print/XLSX/CSV inspection using synthetic authorized data | Readable headers, values, language/order, scope parity and no forbidden fields |

Current performed work: 35 numeric design-token contrast-pair checks passed, plus structural document/link/reference checks. All checkboxes above remain unexecuted until there is a real component/prototype/application/file to inspect. WCAG AA blockers, critical keyboard/reflow failures and privacy/state misunderstandings must be resolved before affected design/MVP approval and production release. Do not mark the product accessible merely because these requirements exist.
