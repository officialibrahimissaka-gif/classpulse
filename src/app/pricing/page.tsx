import Link from "next/link";
import { commercialCatalog as catalog } from "@/commercial/catalog";
export default function Pricing() {
  return (
    <main id="main" className="launch-page">
      <nav aria-label="Public navigation">
        <Link href="/">ClassPulse</Link> ·{" "}
        <Link href="/workspace">Workspace</Link> ·{" "}
        <Link href="/billing">Billing records</Link>
      </nav>
      <p className="eyebrow">PLACEMENT OPERATIONS</p>
      <h1>A focused workspace from acceptance to first day</h1>
      <p>
        Keep task ownership, client handoffs, exceptions and human readiness
        decisions together alongside your existing ATS.
      </p>
      <p className="notice">
        <strong>Evaluation preview.</strong> Production launch is blocked
        pending security, recovery, legal and customer validation. Prices below
        are proposed experiments, not purchasable offers. No card is collected
        and no payment is initiated here. Proposed billing currency is Ghana
        cedis (GHS); no AED conversion or FX rate is promised.
      </p>
      <div className="launch-grid">
        {catalog.plans.map((p) => (
          <section className="card" key={p.id}>
            <h2>{p.name}</h2>
            <p className="launch-price">
              {p.id === "trial"
                ? "14 days"
                : new Intl.NumberFormat("en-GH", {
                    style: "currency",
                    currency: catalog.currency,
                    maximumFractionDigits: 0,
                  }).format(p.monthlyMinor / 100) + " / month"}
            </p>
            <ul>
              <li>{p.seats} internal seats</li>
              <li>{p.placements} active placements</li>
              <li>
                {p.entities} legal {p.entities === 1 ? "entity" : "entities"}
              </li>
              <li>Scoped client participation</li>
            </ul>
            <p>
              {p.id === "trial"
                ? "Local evaluation; no automatic paid conversion."
                : "Proposed organization subscription; accepted terms and reviewed order required."}
            </p>
            <Link href="/">Explore the evaluation</Link>
          </section>
        ))}
      </div>
      <h2>Enable the modules you need</h2>
      <ul>
        {catalog.modules.map((m) => (
          <li key={m.id}>
            {m.name} <code>{m.id}</code> — bundled within plan limits
          </li>
        ))}
      </ul>
      <p>
        Switching off an optional module preserves authorized read-only access
        and export. It does not reduce a quoted bundle price automatically.
        Bespoke onboarding is separately scoped; no unimplemented module is
        sold.
      </p>
      <h2>Before a paid evaluation</h2>
      <p>
        Agree the scope, price, tax treatment, billing period, renewal,
        cancellation and data terms in a reviewed order. Taxes, annual
        discounts, overages and refunds are not calculated or promised by this
        preview.
      </p>
      <p>
        Payroll, government submissions, full ATS, document uploads, native ATS
        connectors and automatic payment-based entitlement changes are
        unavailable.
      </p>
    </main>
  );
}
