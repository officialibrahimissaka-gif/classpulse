# Design system and tokens

Version 0.1 • 1 November 2026 • DS-001–DS-006. Specification only; no UI library or application components implemented. Light theme is the approved design proposal; dark/high-contrast modes require a separate tested token set and are not claimed complete.

## DS-001 — Foundation and semantic tokens

Design intent: restrained, legible enterprise work surfaces. Use indigo for the primary action/selection, ink for hierarchy, teal only with meaningful state text, and neutral canvas/panels. Avoid competing accent gradients. Font assets are locally bundled and licensed/reviewed at implementation; no employee data sent to a third-party font provider.

The JSON is the single proposed token source; semantic aliases are resolved once in the eventual token pipeline. Components consume semantic roles, never a screen-local hex value. px values are reference CSS units and must support zoom/reflow; typography implementation uses rem with the user's base size.

```json
{
  "color": {
    "canvas": "#F6F7FA",
    "surface": "#FFFFFF",
    "surfaceSubtle": "#F1F4F8",
    "ink": "#17212B",
    "textMuted": "#526173",
    "textDisabled": "#7F8A98",
    "nav": "#152536",
    "navText": "#E8EDF5",
    "primary": "#4338CA",
    "primaryHover": "#3730A3",
    "primaryPressed": "#312E81",
    "onPrimary": "#FFFFFF",
    "link": "#2F4FB8",
    "focus": "#1D4ED8",
    "focusOnDark": "#A5D8FF",
    "borderControl": "#78889B",
    "borderDecorative": "#CBD5E1",
    "divider": "#E2E8F0",
    "selectedBackground": "#EEF2FF",
    "successText": "#146C43",
    "successBackground": "#E9F6EF",
    "warningText": "#8A4B00",
    "warningBackground": "#FFF5DB",
    "dangerText": "#B42318",
    "dangerBackground": "#FEF3F2",
    "infoText": "#1D4ED8",
    "infoBackground": "#EFF6FF",
    "chart1": "#4338CA",
    "chart2": "#006B5F",
    "chart3": "#9A3412",
    "chart4": "#6B21A8",
    "chart5": "#075985",
    "chart6": "#64748B"
  },
  "font": {
    "ui": "Inter, system-ui, sans-serif",
    "arabic": "Noto Sans Arabic, system-ui, sans-serif",
    "mono": "ui-monospace, monospace",
    "body": { "size": 16, "lineHeight": 24, "weight": 400 },
    "label": { "size": 14, "lineHeight": 20, "weight": 600 },
    "caption": { "size": 14, "lineHeight": 20, "weight": 400 },
    "h1": { "size": 28, "lineHeight": 36, "weight": 650 },
    "h2": { "size": 22, "lineHeight": 30, "weight": 600 },
    "h3": { "size": 18, "lineHeight": 26, "weight": 600 },
    "metric": { "size": 32, "lineHeight": 40, "weight": 600 },
    "heroLarge": { "size": 56, "lineHeight": 64, "weight": 650 },
    "heroSmall": { "size": 36, "lineHeight": 44, "weight": 650 }
  },
  "space": { "0": 0, "1": 4, "2": 8, "3": 12, "4": 16, "5": 20, "6": 24, "8": 32, "10": 40, "12": 48, "16": 64 },
  "radius": { "control": 8, "panel": 12, "badge": 999 },
  "size": { "header": 64, "navigation": 240, "control": 44, "rowComfortable": 48, "rowCompact": 40, "rowTouch": 56, "contentMax": 1440, "publicMax": 1200 },
  "breakpoint": { "smallMax": 767, "mediumMin": 768, "largeMin": 1200 },
  "focus": { "width": 2, "gap": 2 },
  "motion": { "fastMs": 120, "standardMs": 180, "reducedMs": 0 },
  "layer": { "base": 0, "sticky": 10, "menu": 20, "dialog": 30, "toast": 40 },
  "shadow": { "panel": "0 1px 3px rgba(23,33,43,0.06)", "overlay": "0 8px 24px rgba(23,33,43,0.16)" }
}
```

Semantic mapping: text.primary→ink, text.secondary→textMuted, action.primary→primary/onPrimary, form.boundary→borderControl, focus.light→focus, focus.dark→focusOnDark, status.*→paired text/background. decorative border/divider is not a form/control boundary. Primary hover/pressed states darken; focus remains a separate outline and does not depend on the hover state. Financial numbers use tabular numerals; preserve sign, precision and currency label.

## DS-002 — Contrast and status

Computed WCAG relative-luminance contrast against white: ink 16.29:1, muted text 6.33:1, primary 7.90:1, links 7.16:1, control border 3.62:1, success text 6.45:1, warning text 6.80:1, danger text 6.57:1 and info text 6.70:1. A total of 35 numeric token-pair checks passed for selected text/surface, tint, action, control-boundary, focus and chart/surface pairs; tinted status text ratios range from 5.80:1 to 6.26:1 and focusOnDark/nav is 10.27:1. Final checks must still cover actual rendered states; palette calculations are not a completed accessibility audit.

Normal text target ≥4.5:1; large text and essential control/data boundaries ≥3:1 under WCAG definitions. textDisabled is restricted to genuinely inactive controls, never explanatory text or an essential value. Disabled reasons use normal muted text. Surface decorations can be low contrast only when they convey no essential control boundary. Focus uses a 2 px ring/2 px gap; on dark navigation use focusOnDark. Do not remove outlines or rely on box shadow alone in forced-colors mode.

The backend ready state means an authorized agency readiness decision already occurred. “Awaiting agency review” is a distinct derived work cue after task completion, not a relabeling of ready. Client task submission does not set placement readiness. Focus gaps follow the underlying surface (surface on light panels, nav on dark navigation); do not force a low-contrast light focus ring onto a white gap on dark navigation.

Statuses use icon + text + optional tint: “Coordinating,” “Ready — agency-reviewed,” “Start confirmed,” “Review needed,” “Read-only archive,” “Confirmation pending.” Danger styling is for error/destructive consequence, not every late item or negative business metric. Optional/required and unknown/zero/denied are textual distinctions. Do not represent pending as a green success state.

## DS-003 — Typography, density and layout

Body text defaults to 16/24; labels, legends, metadata and tables may use 14/20 with preserved zoom. No critical information at 10–12 px. Headings use sentence case and a real document hierarchy. Limit ordinary explanatory paragraphs to about 65–80 characters/line. Use the mono stack only for source/reference codes, with copy affordance where appropriate. Arabic typesetting gets native review and may require different line metrics; do not mechanically squeeze it into Latin-only heights.

Comfortable table row 48 px; optional compact row 40 px for precise pointer/keyboard contexts only. Dense icon actions remain at least 32×32 px and meet WCAG minimum target/spacing rules; default actions/inputs and touch actions target ≥44×44 px. Touch rows 56 px. Density preference is per membership and cannot shrink text below supported sizes or change permission scope. Row selection checkbox is separate from the record-name link; no double-action click ambiguity.

Large viewport ≥1200: 12-column grid, 240 px rail, 32 px padding, 24 px gutters. Medium 768–1199: compact/collapsible navigation, 24 px padding, 8-column grid, detail sidebar stacks when content would be squeezed. Small <768: drawer navigation, 16 px padding, one main column, full-page detail/actions instead of narrow drawers. At 320 px no page-level horizontal scrolling; meaningful wide tables/charts may have a labelled bounded scroll region and equivalent accessible data access.

## DS-004 — Forms and feedback patterns

Visible label above input; required text/semantic required attribute; example/hint before validation; inline error plus linked summary after failed submit. Do not use placeholder as label. Distinguish display locale from accepted import format and show exact units. Monetary input has currency and string-precision validation; no front-end floating-point payroll calculations. Date inputs present an unambiguous date and support typed entry in addition to a picker. Calendars use the applicable configured workweek and distinguish working/calendar days.

Primary button: indigo/onPrimary, 44 px default height, 16 px horizontal padding, 8 px radius. Secondary: surface/ink with borderControl. Destructive: dangerText or danger-filled with verified contrast, explicit verb/object and a consequence review. Loading buttons keep width and text, announce submission, and prevent duplicate pointer/keyboard activation. Server idempotency remains mandatory. Permission/eligibility changes never create a fake successful toggle/submit.

Dialog: titled, descriptive, focus-contained, Escape/cancel where safe, explicit primary consequence. Step-up authentication stays in the approved identity flow. Cancel returns focus to the original trigger or a sensible destination if navigation destroyed it. Essential success/errors appear inline and in the activity/context, with optional toast duplication. Async work uses queued/generating/ready/failed/expired labels and a retrievable job state, not a simulated percentage.

## DS-005 — Charts, tables and print

Chart palette chart1–chart6 has ≥3:1 contrast against white. It does not guarantee pairwise color separation; use direct labels, markers/dashes/patterns, spacing/borders and data tables. No red–green legend alone. Use horizontal bars for categorical comparison, lines for real time trends, ordered stage bars/tables for pipelines and explicit aging tables for work queues. Avoid decorative donuts, 3D, area-distorted funnels, dual axes and rotating charts.

Bar axes start at zero; line axes/currency/units are explicit and any nonzero baseline is disclosed. Tooltips work on keyboard focus and do not contain the only copy of a value. Chart summary explains time/source/scope and a data-table view exposes the same result/drill-down. Do not calculate percentages, totals or delta arrows inside chart components; they render centrally returned metric results.

Print is a report snapshot with title, tenant/entity context, authorized filters, dates/timezone, currency, metric version/as-of and classification. Hide navigation/controls; repeat table headers, number pages, prevent clipped financial columns and provide readable monochrome patterns/labels. PDF text remains selectable, with verified reading order/tagging when supported; do not turn the screen into a screenshot-only PDF. CSV/XLSX preserve raw typed values and neutralize formulas under the report contract. Font/localization and print metadata are tested per format.

## DS-006 — Localization, tokens and change control

Use semantic start/end spacing and CSS logical properties in future implementation. RTL mirrors reading order/directional affordances while preserving numeric/email/ID bidi isolation. Respect reduced motion; progress/state feedback stays clear with transitions disabled. No auto-refresh announcement flood, parallax, animated counters or timed disappearing essential alerts.

Token changes require component-state, light/dark-context focus, tint/text contrast, chart/print and RTL review. Version the token set and component contracts. New local color/spacing or a new metric formula is a review failure, not an acceptable one-screen shortcut. Dark mode and translations remain explicit future work until their complete states pass the same checks.
