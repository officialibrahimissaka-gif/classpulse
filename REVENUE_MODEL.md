# Revenue model and launch KPIs

2 November 2026. **Planning model only. Actual customers, payments, CAC, churn and MRR are unknown; none has been supplied or measured.** Do not turn mock provider responses or test-mode status into revenue.

## Revenue units and illustrative first-ten scenario

Unit: organization/month, billed in GHS by the reviewed Ghana seller. Proposed Starter GHS 1,000 and Growth GHS 2,500 are pricing hypotheses, not accepted prices. Optional implementation services are separately scoped one-time revenue, excluded from MRR. No payroll, automatic overages or placement-success commission.

| Illustrative mix, not forecast | Calculation | Monthly recurring run-rate hypothesis |
|---|---|---:|
| 10 Starter | 10 × 1,000 | GHS 10,000 |
| 6 Starter + 4 Growth | 6 × 1,000 + 4 × 2,500 | GHS 16,000 |
| 10 Growth | 10 × 2,500 | GHS 25,000 |

This is arithmetic, not evidence buyers will pay or revenue will be recognized. Trial/evaluation deposits, one-time services, tax, refunds/credits and uncollected invoices are reported separately. No AED/GHS conversion is assumed. If annual contracts are later approved, normalize recurring contracted service value over covered months; keep booked contract value, recognized revenue, invoiced amounts and settled cash distinct. Obtain accountant-approved treatment before reporting financial statements.

## Cost model and sensitivity

Monthly direct cost = actual hosting/HA database/Redis/storage/version/backups/network/KMS/logging/mail + allocated support/onboarding delivery labor + provider fees/refund/chargeback losses attributable to delivered subscriptions. Track actual provider quotes and labor rates; no AWS or Paystack fee is invented. Acquisition costs include founder sales time at a disclosed consistent rate, campaigns, travel/events, partner commissions and relevant sales tooling. Separate fixed engineering/product development from delivery/acquisition costs and state the accounting basis.

Contribution/account = recurring revenue/account − variable delivery/support/provider cost/account. Break-even customer count = ceiling(fixed monthly operating cost / positive contribution/account); undefined if contribution is nonpositive. For a mixed portfolio use the explicitly assumed weighted mix. Gross margin = (recurring service revenue − direct service cost) / recurring service revenue, null at zero. Simple CAC payback = CAC / positive monthly gross profit per new account. Do not estimate LTV from a few pilots or assume founder labor is free.

Sensitivity: test offered price ±20%, real delivery labor at 1×/2×, provider/FX costs from actual statement, and lower/higher plan mix. Use a customer-level ledger, not a growth-rate extrapolation, until renewal evidence exists. Pricing may fail because UAE procurement rejects GHS/foreign-seller billing even if card authorization works; record that reason separately from product value.

## Metric contract

All metrics are organization-level with UTC event timestamps, displayed in the chosen business time zone. Deduplicate by stable tenant/account ID. Attribute source at qualified-opportunity creation using an agreed attribution rule. Separate production/test, currency, plan, country, segment and acquisition cohort; exclude internal/test tenants. Empty denominator → null plus numerator/denominator, never 0% or 100%. Publish maturity window and censored cases.

| KPI | Formula / business meaning | Source and cadence | Proposed experiment threshold, not achieved |
|---|---|---|---|
| Qualified leads | Distinct accounts newly meeting ICP + named buyer + recurring observed problem + next step within period | Restricted sales register; weekly | 60 total qualified accounts in first-ten experiment, capacity permitting |
| Demo conversion | Distinct qualified accounts attending a substantive demo / distinct qualified accounts invited in the same invitation cohort, after 14 days | Demo invitations/attendance; weekly mature cohorts | 30/60 = 50% planning assumption |
| Trial conversion | Organizations completing setup/start-trial within 14 days of attended demo / attended-demo organizations in that cohort | Sales register + verified setup/subscription timestamps; weekly | 15/30 = 50% planning assumption |
| Paid conversion | Organizations with an accepted recurring order AND independently verified first settled payment within 30 days of trial start / trial organizations with full 30-day observation | Reviewed orders + provider settlement/bank reconciliation; monthly | 10/15 ≈66.7% ambitious planning assumption; reject/revise on evidence |
| Activation rate | Trial organizations achieving the defined owned-handoff event within 7 days / trial organizations observed for ≥7 days | Authorized product events + champion confirmation; weekly | Proposed ≥70%, revise after first five; no observed rate |
| Time to first value | Median elapsed hours setup_completed→champion_confirmed_first_usable_handoff among activated cohort; also report nonactivated count | Product timestamp + customer confirmation; weekly | Proposed median ≤48h; not a product guarantee |
| CAC | Acquisition cash + consistently valued sales labor in cohort / new paying organizations attributable to that cohort | Expense/time/sales ledger; monthly | No threshold until actual gross profit/costs known |
| MRR | Sum active accepted recurring monthly normalized GHS amounts, excluding tax/one-offs/credits; report delinquency separately | Contracts + subscription/invoice/settlement reconciliation; monthly | First-ten illustrative mix GHS 16,000, not forecast |
| Logo churn | Starting-period paying organizations ending recurring service during period / paying organizations at period start | Contract cancellations/end dates; monthly | Report observed counts; no statistically credible early benchmark |
| Customer retention | Starting-period paying organizations still contracted at end / starting-period paying organizations = 1 − logo churn (under same definition) | Same starting cohort; monthly/90-day cohorts | Aim to observe first renewals before expanding channels |
| Gross revenue retention | (Starting recurring MRR − churn MRR − contraction MRR) / starting recurring MRR, excluding expansion | Reviewed contract ledger; monthly | No commitment before actual renewals |

Demo→trial counts one trial per organization; repeated demos cannot inflate denominators. “Paid” for first-ten milestone requires actual settled payment, not Paystack test success, provider initialization, invoice issuance, an order request or a nonbinding commitment. Recognized MRR is not necessarily cash and must be labeled accordingly.

## Implementation boundary and review

Existing tenant/subscription/usage and audited workflow records support product counts; a full analytics/CRM/financial ledger is not implemented. Use reviewed restricted registers until the lifecycle event/settlement/invoice pipeline is built and reconciled. The new payment-observation table is not a tax-invoice, settlement or accounting system. Weekly founder/product/billing review checks denominators, refunds, support hours, losses and currency objections. Do not claim these KPIs are already measured or automatically available in the product.
