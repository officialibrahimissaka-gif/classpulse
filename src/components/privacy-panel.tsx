"use client";
import { useEffect, useState } from "react";
import { api } from "./http";
type Data = {
  requests: { id: string; state: string; requestType: string; dueAt: string }[];
  candidates: { id: string; displayName: string }[];
  contacts: { id: string; displayName: string }[];
};
export default function PrivacyPanel({ csrf }: { csrf: string }) {
  const [data, setData] = useState<Data>(),
    [kind, setKind] = useState<"candidate" | "contact">("candidate"),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    void api<Data>("/api/v1/privacy")
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);
  async function submit(e: React.SubmitEvent<HTMLFormElement>, path: string) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const values = Object.fromEntries(new FormData(e.currentTarget));
      await api(
        "/api/v1/" + path,
        path === "privacy" ? { ...values, subjectType: kind } : values,
        csrf,
      );
      setData(await api<Data>("/api/v1/privacy"));
      setNotice(
        "Recorded for the authorized privacy operator. No automatic erasure was performed.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to record");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="card">
      <h2>Privacy and retention review</h2>
      <p>
        Fresh MFA is required. Verify the requester and review jurisdiction,
        retention, and legal holds before authorizing an operator to erase live
        records. Deadlines below are reviewed company decisions.
      </p>
      <div role="alert">{error}</div>
      <div role="status">{notice}</div>
      <form onSubmit={(e) => void submit(e, "privacy")}>
        <label>
          Subject type
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as typeof kind)}
          >
            <option value="candidate">Candidate reference</option>
            <option value="contact">Client contact</option>
          </select>
        </label>
        <label>
          Subject record
          <select name="subjectId" required>
            {(kind === "candidate" ? data?.candidates : data?.contacts)?.map(
              (p) => (
                <option key={p.id} value={p.id}>
                  {p.displayName}
                </option>
              ),
            )}
          </select>
        </label>
        <label>
          Reviewed response due date
          <input name="dueOn" type="date" required />
        </label>
        <label>
          Identity-verification reference
          <input
            name="verificationReference"
            required
            minLength={10}
            maxLength={500}
          />
        </label>
        <button disabled={busy}>Record verified erasure request</button>
      </form>
      <h3>Erasure requests</h3>
      {data?.requests.map((r) => (
        <p className="small" key={r.id}>
          {r.id.slice(0, 8)} · {r.state} · Due {r.dueAt.slice(0, 10)}
        </p>
      ))}
      <details>
        <summary>Record a legal hold</summary>
        <form onSubmit={(e) => void submit(e, "holds")}>
          <label>
            Hold reason code
            <input name="reasonCode" required minLength={3} maxLength={60} />
          </label>
          <label>
            Authority reference
            <input
              name="authorityReference"
              required
              minLength={10}
              maxLength={500}
            />
          </label>
          <label>
            Review due date
            <input name="reviewOn" type="date" required />
          </label>
          <button disabled={busy}>Record legal hold</button>
        </form>
      </details>
      <p className="small muted">
        This conservative workflow blocks tenant cleanup while any legal hold is
        active. An independent legal/privacy review is required before
        production use.
      </p>
    </section>
  );
}
