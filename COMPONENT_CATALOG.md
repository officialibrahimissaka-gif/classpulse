# Component inventory and interaction contracts

Version 0.1 • 1 November 2026 • Components are specifications, not implemented library code. Each C-ID inherits DS tokens, AX checks and server authorization. Native HTML semantics are preferred; ARIA describes actual behavior rather than replacing working keyboard interaction.

## C-BASE — Shared component interface

Component state is explicit: default/hover/focus/pressed, disabled with readable reason, loading/busy, validation error, empty, partial/stale, read_only, forbidden and unavailable as applicable. Presentational components receive permitted DTOs; they never fetch broader data to decide what to hide. An isVisible flag cannot replace backend enforcement. Public, internal, external and self-service shells compose the same primitives with distinct navigation/data scope.

Metric components accept registry key/version, server value/state, denominator/context, filters/as-of, comparison result, allowed drill-down and export capability. They do not accept a screen-local calculation callback. Module components receive supported release, effective state, entitlement/dependency preview and permitted actions, not a client-authored plan. Form components expose id/label/hint/error linkage and exact input units. Every async command exposes the authoritative result/version and safe failure state.

## Component registry

| ID / component | Variants and content | Keyboard/semantic contract | Important state and usage |
|---|---|---|---|
| C-01 Public shell | Header/footer, mobile menu, active link, primary CTA | landmarks, skip link, actual links; drawer focus management | SCR-01/02; no tenant data or fake product availability |
| C-02 Workspace shell | Expanded/collapsed/drawer nav, page header | nav landmark, aria-current, predictable focus after navigation | All internal screens; only permitted groups/items |
| C-03 External shell | Agency identity, one shared context, help/sign out | concise landmarks, no hidden full-app keyboard destinations | SCR-25/26; no company-wide search |
| C-04 Company/context switcher | Tenant choice, entity/filter context, current scope | labelled button/list, no automatic switch on arrow; explicit selection | Clear stale state and reauthorize; tenant switch differs from entity filtering |
| C-05 Breadcrumb/page header | Title, context, one primary action | ordered list links, one H1, no forbidden parent names | All detail/workspace screens |
| C-06 Buttons/icon buttons | Primary/secondary/destructive/quiet/loading | native button, accessible name, visible focus, correct submit type | Icon-only actions have labels; never hover-only |
| C-07 Link and copy reference | Inline/navigation/external/source reference | actual link; external destination described where needed; copy confirmation live message | No auth tokens or sensitive clipboard content by default |
| C-08 Text/textarea | Default, required, readonly, error, sensitive write-only | visible labels, described-by hints/errors, paste allowed | No browser-local sensitive draft, passwords or ID values |
| C-09 Select/combobox | Native select preferred; searchable controlled options when necessary | arrow/Enter/Escape, active-descendant pattern if custom; no input trapping | Scoped entity/owner/status values only |
| C-10 Date/range/timezone input | Typed date + picker, interval/date basis, period selector | keyboard typed/picker parity, labelled calendar navigation | SCR-04/11/12; explicit units/zone; configured workweek |
| C-11 Money/quantity input | Decimal string, currency/unit adornment | labelled currency/unit, error examples, no float coercion | Later payroll/expense; source adapter performs calculation |
| C-12 Checkbox/radio/switch | Selection, explicit binary setting, grouped choices | fieldset/legend, native semantics; Space toggles | Module activation is a reviewed action, not an instant switch shortcut |
| C-13 Field/error summary | Inline error, validation summary, conflict summary | error summary links to fields and receives focus after failure | Do not remove entered safe values or expose forbidden values |
| C-14 Stepper | Numbered steps, current/completed/pending | ordered list and aria-current=step; prior steps available if safe | SCR-04/24, visible saved-state feedback |
| C-15 Tabs | Page tabs, mode tabs, scoped domain tabs | tablist with documented activation, arrow/Home/End, associated panels | Omit unauthorized panels/counts; preserve URL for meaningful page tabs |
| C-16 Filter bar/sheet | Date/entity/source dimensions, applied chips, reset | labelled group, buttons for chips, focus return on mobile Apply | Source-specific allowed fields, no nonexistent department parameter |
| C-17 Data table | Sort/page/select/column chooser, comfortable/compact | real table headers/caption, labelled controls; no unnecessary ARIA grid | Cursor source, bounded scroll region, safe mobile detail alternative |
| C-18 Record list/card | Mobile summary, priority item, empty list | list semantics and named record links/actions | Preserve key labels/status/date and do not bury primary task |
| C-19 Status/attention badge | Lifecycle, exception, read-only, unknown | icon + text; color not the name; no focus unless actionable | Attention is not a new underlying lifecycle state |
| C-20 KPI card | Numeric/percent/currency, N/A/unknown/suppressed/stale | accessible metric title/value/context and definition action | Registry-driven value; no hidden formula; blank value never equals zero |
| C-21 Chart frame | Time line, category/stage/aging bar, table alternative | heading, summary, focusable data access, data table toggle | Marker/pattern/label beyond color; units and domain explicit |
| C-22 Comparison label | Count change, percentage-point change, no valid baseline | spoken full text; direction not only arrow/color | “No valid comparison” rather than invented 0% or infinity |
| C-23 Definition/provenance panel | Meaning, version, scope, denominator, source/as-of | labelled expandable section or dialog; keyboard reachable | Business explanation first; technical identifiers secondary |
| C-24 Timeline/history | Replan, transition, approval, effective/recorded date | chronological list with text labels and time elements | Original evidence immutable; no secret/raw audit payload |
| C-25 Detail panel | Wide-screen aside, mobile full page | dialog only if modal; otherwise labelled complementary region | Focus not obscured by sticky actions; close restores sensible context |
| C-26 Confirmation/decision dialog | Ready/start/waiver, delete/cancel, module/contract review | title/description, focus containment, Escape/cancel, explicit verb | Server-confirmed result, reason/evidence, step-up when required |
| C-27 Task/milestone list | Required/optional, due/overdue, ownership, complete/waive | ordered/list structure, named per-task actions, no drag-only change | SCR-17/23/25; client cannot waive or decide readiness |
| C-28 Ownership/participant editor | Permitted owner assignment, scoped invitation, field sharing | plain-language sharing preview, keyboard selection | Verified recipient/link; no account-wide implicit grant |
| C-29 CSV chooser/validation | File button + optional drop, mapping, safe error table | file control labelled, progress announced, errors navigable | SCR-24; type/size/row caps, no personal-document uploader in R1 |
| C-30 Pipeline/stage view | ATS or sales domains, list alternative, optional drag | Move menu/keyboard action and confirmation; horizontal region labelled | Domain stages distinct, no arbitrary state patch |
| C-31 Version/configuration editor | Draft, preview, publish/new version, historical read | form controls/order list; canvas has equivalent outline later | Published versions not overwritten; arbitrary code not allowed |
| C-32 Module card/dependency preview | Supported/enabled/archive/planned | details link + named action, explicit confirmation | Read-only/export effects, no phantom purchase or unsupported enable |
| C-33 Plan comparison/usage gauge | Limits, definitions, order/trial state | semantic comparison table and textual used/limit/expiry | No unverified money, forced urgency, undefined unlimited or automatic charge |
| C-34 Report/export controls | PDF/CSV/XLSX, print snapshot, job progress | format radios/select, clear queue/result labels, authenticated links | Current scope recheck, cap/expiry, no sensitive email attachments |
| C-35 Alert/banner | Info/review/error/read-only/security | role=status for routine feedback; alert only urgent relevant errors | Persistent essential context; dismissal doesn't hide unresolved blockers |
| C-36 Toast/live status | Optional supplemental confirmation | polite live region, no focus theft, accessible pause/history if needed | Never sole source of error/result/timeout information |
| C-37 Skeleton/empty/retry | Initial/filtered empty, stale, unavailable, denied | labelled busy region, retry control, no fabricated figures | State copy reflects source distinction and permitted action |
| C-38 Calendar/agenda | Month/week/list, local holiday/calendar version | keyboard navigation/typed input; equivalent agenda/list | Not a mandatory single input path; no fixed UAE workweek |
| C-39 Sensitive field/document view | Masked/unavailable/permitted restricted content | permission before serialization; reveal/step-up has meaningful name | Later only; no blurred preview of forbidden values, file scan/expiry rules |
| C-40 Reply/review editor | Public reply/internal note, draft/published feedback | explicit visibility label, toolbar semantics, keyboard formatting | No accidental draft publication or public/internal toggle by color alone |
| C-41 SLA/approval context | Captured calendar/policy, source units, reason | textual clock/state and source link, not a color-only countdown | No fake pause or self-approval; confirmation pending differs from paid |
| C-42 Print frame | A4/Letter sensible pagination, headers/metadata | selectable text and logical reading order, monochrome legibility | No app chrome, hidden unauthorized content or clipped financial columns |

## C-COMPOSE — Page compositions

Dashboard: C-02/04/05/16 + C-20/21/22/23 + C-17/34/35/37. Record detail: C-05/19/24/25/26 plus domain C-27/28/39/41. Import: C-14/29/13/34. Module/subscription: C-32/33/26/35. Pipeline: C-15/16/30/17/40. External participation: C-03/27/19/26; never the whole enterprise shell. These shared compositions reduce visual inconsistency without merging data permissions or metric definitions.

Every component review covers allowed/denied fields, non-pointer use, screen-reader naming, focus/zoom/reflow, reduced motion, loading/error/empty/conflict/read-only, expiry/session changes, light/tint/dark-nav contrast, RTL target and print where relevant. Handoff records C-ID, screen/journey/requirement references, token usage and proposed behavior. Component implementation must gain real tests; no component is marked production-ready by this inventory.
