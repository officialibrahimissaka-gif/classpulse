# Pricing strategy

2 November 2026. **Experiment, not validated willingness to pay or an active offer.** No interviews, buyer commitments or collections have been supplied. Existing agency R1 is the only sellable candidate scope; production launch remains blocked.

## Merchant, currency and proposals

Founder-supplied: Ghana Paystack merchant, GHS settlement, international card acceptance. Account ownership, business legal identity, international-card enablement, recurring-card support, fees, reserves, settlement timing and permitted service/countries require actual account/provider verification. Official [subscription documentation](https://paystack.com/docs/payments/subscriptions/) describes automatic subscriptions using Card and Nigeria Direct Debit; do not advertise Ghana Mobile Money as a recurring subscription rail. Official docs were retrieved 2 November 2026; account configuration remains unverified. No UAE/AED merchant support or settlement is assumed.

The executable catalog in `src/commercial/catalog.ts` and `/pricing` is the source of the following **founder pricing experiments**, selected as round test anchors, not FX conversions or competitor-derived prices:

| Plan | Hypothesized monthly organization fee | Internal seats | Active placements | Legal entities |
|---|---:|---:|---:|---:|
| Evaluation | GHS 0 for 14 days | 5 | 25 | 1 |
| Starter | GHS 1,000 | 10 | 100 | 1 |
| Growth | GHS 2,500 | 30 | 500 | 3 |

No card required for the local trial; no automatic paid conversion. Trial expiry and retained read/export window use existing server policy. Paid plans require reviewed order acceptance; the price page itself cannot grant entitlements. The server enforces current plan capacities independently from this display catalog. Tests and review must keep those limits synchronized. GHS prices for UAE buyers are a sales hypothesis: ask procurement whether foreign billing/FX is acceptable; record rejection and consider a separately approved alternative provider rather than hiding currency conversion. Buyer-card FX, taxes and provider fees are not calculated by this application.

## Modular packaging and services

Bundle only `platform.core`, `crm.accounts`, `agency.starts`, limited `platform.analytics` and CSV-only `platform.integrations`. Core cannot be disabled; optional modules retain read/export/reactivation behavior. Disabling one bundled module does not imply a discount. No payroll, immigration compliance pack, ATS connector, API, document storage or future module is sold. Separately quote optional assisted onboarding/import/template setup and training only for capabilities actually delivered; retain a written scope and service effort record. No service price is validated yet. No usage overage or placement-success fee; exceeding capacity blocks new allocations and invites a reviewed plan request.

## Discovery and decision rules

Ask named owners to compare the proposed fee with their last actual handoff problem, incumbent configuration cost and budget process. Present one price/scope consistently per cohort; record offered currency, decision-maker, signed acceptance/rejection reason and actual collected amount. Free trial activity and verbal enthusiasm do not prove willingness to pay. Do not change a customer's quote after acceptance without the reviewed order process.

Prerequisite gates remain five independent recurring cases, three lawful/redacted artifacts and two specific paid-evaluation commitments; then actual approved collection before a willingness-to-pay claim. Pilot length is a proposed four weeks of an agreed start cohort after production gates, not a guarantee that all starts occur in 14 days. A paid pilot price/credit, invoicing entity, taxes, renewal, cancellation, dispute and refund policies must be reviewed and agreed separately; none is implied by this document.

## Billing design and status

Paystack test-mode hosted checkout adapter verifies a monthly GHS plan before initialization; server-side transaction verification produces tenant-isolated integer-minor-unit observations. No card data, authorization tokens, customer email or payment links are persisted in application billing tables. The owner billing screen displays test payment status only, explicitly not an invoice ledger. Existing upgrade/downgrade/cancel order application remains independent and audited. Live credentials are rejected. Automated invoice/payment status reconciliation, recurring lifecycle webhook inbox/signature/replay/out-of-order tests, provider subscription mapping, billing portal, tax invoices, prorations/dunning/refunds and live settlement reconciliation are **not complete**. They are release blockers before recurring revenue, not a fake integration hidden behind a pay button.

Legal/accountant review must approve Ghana seller identity, UAE cross-border sale/consumer/business applicability, invoicing/VAT/FX treatment, payment authorization and privacy transfer/subprocessor terms. No fee schedule, tax rule or legal conclusion is invented. Draft review outlines are in `docs/legal/`.
