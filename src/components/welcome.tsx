"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Layers3 } from "lucide-react";
import { api } from "./http";
export default function Welcome({
  development,
  initialIdentity,
}: {
  development: boolean;
  initialIdentity: boolean;
}) {
  const router = useRouter();
  const [identity, setIdentity] = useState(initialIdentity),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(
    event: React.SubmitEvent<HTMLFormElement>,
    action: "identity" | "setup" | "login",
  ) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      if (action === "identity") {
        await api("/api/auth/development", values);
        setIdentity(true);
      } else if (action === "login") {
        await api("/api/auth/workspace", values);
        router.push("/workspace");
      } else {
        await api("/api/v1/tenants", {
          ...values,
          retentionDays: Number(values.retentionDays),
          acknowledged: true,
        });
        router.push("/workspace");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to continue");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main id="main" className="welcome">
      <section className="intro">
        <div className="brand">
          <Layers3 aria-hidden="true" /> ClassPulse
        </div>
        <span className="eyebrow">PLACEMENT OPERATIONS</span>
        <a href="/pricing">Plans and evaluation scope</a>
        <h1>
          A confident start.
          <br />
          Every placement.
        </h1>
        <p>
          Bring client coordination, candidate readiness, and first-day
          decisions into one clear workspace.
        </p>
        <ul className="benefits">
          {[
            "One checklist from acceptance to start",
            "Clear ownership and human readiness decisions",
            "A reliable view of starts, delays, and blockers",
          ].map((v) => (
            <li key={v}>
              <CheckCircle2 size={20} aria-hidden="true" />
              {v}
            </li>
          ))}
        </ul>
        <a href="/workspace" className="text-link">
          Open your workspace <ArrowRight size={16} />
        </a>
      </section>
      <section className="entry card">
        <h2>Welcome to your next start</h2>
        <p className="muted">
          A 14-day trial includes 5 internal seats, 25 active placements, and
          one legal entity.
        </p>
        {development && (
          <p className="notice">
            Local development only. These identities are not verified and cannot
            authorize sensitive MFA-protected changes.
          </p>
        )}
        <div role="alert">{error}</div>
        {!identity ? (
          <>
            {development ? (
              <form onSubmit={(e) => submit(e, "identity")}>
                <label>
                  Your name
                  <input
                    name="name"
                    required
                    maxLength={200}
                    autoComplete="name"
                  />
                </label>
                <label>
                  Work email
                  <input
                    name="email"
                    required
                    type="email"
                    autoComplete="email"
                  />
                </label>
                <button disabled={busy}>
                  Continue locally <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              <form action="/api/auth/login" method="GET">
                <button>Sign in with your identity provider</button>
              </form>
            )}
            <p className="muted small">
              After signing in, set up a company or enter your workspace
              address.
            </p>
            {!development && (
              <button className="secondary" onClick={() => setIdentity(true)}>
                I have completed sign-in
              </button>
            )}
          </>
        ) : (
          <>
            <form onSubmit={(e) => submit(e, "login")}>
              <h3>Join your workspace</h3>
              <label>
                Workspace address
                <input
                  name="slug"
                  required
                  pattern="[a-z][a-z0-9\-]{2,59}"
                  placeholder="your-company"
                />
              </label>
              <button disabled={busy}>Open workspace</button>
            </form>
            <hr />
            <form onSubmit={(e) => submit(e, "setup")}>
              <h3>Create a company</h3>
              <div className="form-grid">
                <label>
                  Company name
                  <input name="name" required minLength={2} maxLength={240} />
                </label>
                <label>
                  Workspace address
                  <input
                    name="slug"
                    required
                    pattern="[a-z][a-z0-9\-]{2,59}"
                    placeholder="your-company"
                  />
                </label>
                <label>
                  Country code
                  <input
                    name="country"
                    required
                    pattern="[A-Z]{2}"
                    defaultValue="AE"
                  />
                </label>
                <label>
                  Employment authority
                  <input
                    name="authority"
                    required
                    minLength={2}
                    maxLength={80}
                    placeholder="Confirm your applicable authority"
                  />
                </label>
                <label>
                  Time zone
                  <input name="timeZone" required defaultValue="Asia/Dubai" />
                </label>
                <label>
                  Currency code
                  <input
                    name="currency"
                    required
                    pattern="[A-Z]{3}"
                    defaultValue="AED"
                  />
                </label>
                <label>
                  Retention days
                  <input
                    name="retentionDays"
                    type="number"
                    required
                    min={30}
                    max={3650}
                  />
                </label>
                <label>
                  Retention policy reference
                  <input
                    name="retentionReference"
                    required
                    minLength={10}
                    maxLength={500}
                    placeholder="Your reviewed company policy"
                  />
                </label>
              </div>
              <label className="checkbox">
                <input type="checkbox" required />I confirm the company’s
                jurisdiction and retention policy. This workspace does not
                calculate payroll or certify legal compliance.
              </label>
              <button disabled={busy}>
                Create trial workspace <ArrowRight size={16} />
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
