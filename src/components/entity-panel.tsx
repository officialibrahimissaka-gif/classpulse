"use client";
import { useEffect, useState } from "react";
import { api } from "./http";
export type Entity = {
  id: string;
  code: string;
  name: string;
  countryCode: string;
  authorityCode: string;
  timeZone: string;
  defaultCurrency: string;
};
export default function EntityPanel({ csrf }: { csrf: string }) {
  const [rows, setRows] = useState<Entity[]>([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    void api<Entity[]>("/api/v1/entities")
      .then(setRows)
      .catch((e) => setError(e.message));
  }, []);
  return (
    <section className="card">
      <h2>Legal entities and jurisdictions</h2>
      {rows.map((e) => (
        <p key={e.id}>
          {e.name} · {e.countryCode} · {e.authorityCode} · {e.timeZone} ·{" "}
          {e.defaultCurrency}
        </p>
      ))}
      <p>
        Additional entities require plan capacity and fresh MFA. Country and
        authority configuration does not activate payroll or legal rules.
      </p>
      <div role="alert">{error}</div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            await api(
              "/api/v1/entities",
              Object.fromEntries(new FormData(e.currentTarget)),
              csrf,
            );
            setRows(await api<Entity[]>("/api/v1/entities"));
          } catch (e) {
            setError(
              e instanceof Error ? e.message : "Unable to create entity",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="form-grid">
          <label>
            Entity code
            <input name="code" required maxLength={40} />
          </label>
          <label>
            Entity name
            <input name="name" required minLength={2} maxLength={240} />
          </label>
          <label>
            Country code
            <input name="country" required pattern="[A-Z]{2}" />
          </label>
          <label>
            Employment authority
            <input name="authority" required minLength={2} maxLength={80} />
          </label>
          <label>
            Time zone
            <input name="timeZone" required placeholder="Asia/Dubai" />
          </label>
          <label>
            Currency code
            <input name="currency" required pattern="[A-Z]{3}" />
          </label>
        </div>
        <button disabled={busy}>Add reviewed legal entity</button>
      </form>
    </section>
  );
}
