"use client";
import { useEffect, useState } from "react";
import { api } from "./http";
type Shared = {
  id: string;
  status: string;
  candidateName?: string;
  plannedStart?: string;
  tasks: {
    id: string;
    label: string;
    state: string;
    dueAt: string;
    version: number;
  }[];
};
export function SharedPortal({ csrf }: { csrf: string }) {
  const [rows, setRows] = useState<Shared[]>([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    void api<Shared[]>("/api/v1/shared")
      .then(setRows)
      .catch((e) => setError(e.message));
  }, []);
  return (
    <section className="card">
      <h2>Your shared placements</h2>
      <p>Only explicitly shared fields and your assigned tasks are visible.</p>
      <div role="alert">{error}</div>
      {!rows.length && (
        <p>
          No active shared placements. Your agency can issue or renew an
          invitation.
        </p>
      )}
      {rows.map((r) => (
        <article key={r.id}>
          <h3>{r.candidateName ?? "Shared placement"}</h3>
          <p>
            {r.status.replace("_", " ")}
            {r.plannedStart
              ? " · Planned start " + r.plannedStart.slice(0, 10)
              : ""}
          </p>
          {r.tasks.map((t) => (
            <div className="task" key={t.id}>
              <div>
                <strong>{t.label}</strong>
                <small>
                  {t.state} · Due {new Date(t.dueAt).toLocaleString()}
                </small>
              </div>
              {!["completed", "waived"].includes(t.state) &&
                !["started", "canceled"].includes(r.status) && (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setBusy(true);
                      setError("");
                      const evidence = new FormData(e.currentTarget).get(
                        "evidence",
                      );
                      try {
                        await api(
                          "/api/v1/shared/complete",
                          { placementId: r.id, taskId: t.id, evidence },
                          csrf,
                          t.version,
                        );
                        setRows(await api<Shared[]>("/api/v1/shared"));
                      } catch (e) {
                        setError(
                          e instanceof Error ? e.message : "Unable to complete",
                        );
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    <label>
                      Completion evidence
                      <input
                        name="evidence"
                        required
                        minLength={3}
                        maxLength={500}
                      />
                    </label>
                    <button disabled={busy}>Confirm completion</button>
                  </form>
                )}
            </div>
          ))}
        </article>
      ))}
    </section>
  );
}
type Participants = {
  grants: {
    id: string;
    revokedAt: string | null;
    expiresAt: string;
    contact: { displayName: string };
  }[];
  invitations: {
    id: string;
    acceptedAt: string | null;
    expiresAt: string;
    deliveryRows: { state: string }[];
  }[];
};
export function Participants({
  placementId,
  tasks,
  csrf,
}: {
  placementId: string;
  tasks: { id: string; label: string; state: string }[];
  csrf: string;
}) {
  const [rows, setRows] = useState<Participants>(),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    void api<Participants>("/api/v1/participants/" + placementId)
      .then(setRows)
      .catch((e) => setError(e.message));
  }, [placementId]);
  return (
    <section className="card">
      <h2>Client coordination</h2>
      <p>
        Select only the fields and tasks this contact needs. Invitation email is
        sent by the background worker.
      </p>
      <div role="alert">{error}</div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget,
            data = new FormData(form);
          setError("");
          setBusy(true);
          try {
            await api(
              "/api/v1/invitations",
              {
                placementId,
                name: data.get("name"),
                email: data.get("email"),
                taskIds: data.getAll("taskIds"),
                sharedFields: data.getAll("sharedFields"),
              },
              csrf,
            );
            setRows(
              await api<Participants>("/api/v1/participants/" + placementId),
            );
            form.reset();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Invitation failed");
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="form-grid">
          <label>
            Contact name
            <input name="name" required maxLength={200} />
          </label>
          <label>
            Invited email
            <input name="email" type="email" required maxLength={320} />
          </label>
        </div>
        <fieldset>
          <legend>Assigned tasks</legend>
          {tasks
            .filter((t) => !["completed", "waived"].includes(t.state))
            .map((t) => (
              <label className="checkbox" key={t.id}>
                <input type="checkbox" name="taskIds" value={t.id} />
                {t.label}
              </label>
            ))}
        </fieldset>
        <fieldset>
          <legend>Optional shared fields</legend>
          <label className="checkbox">
            <input type="checkbox" name="sharedFields" value="candidate.name" />
            Candidate name
          </label>
          <label className="checkbox">
            <input type="checkbox" name="sharedFields" value="planned_start" />
            Planned start date
          </label>
        </fieldset>
        <button disabled={busy}>Send scoped invitation</button>
      </form>
      {rows?.invitations.map((i) => (
        <p className="small" key={i.id}>
          Invitation {i.id.slice(0, 8)} ·{" "}
          {i.acceptedAt ? "Accepted" : (i.deliveryRows[0]?.state ?? "queued")} ·
          Expires {i.expiresAt.slice(0, 10)}
        </p>
      ))}
      {rows?.grants.map((g) => (
        <div className="task" key={g.id}>
          <span>
            {g.contact.displayName} ·{" "}
            {g.revokedAt ? "Revoked" : "Expires " + g.expiresAt.slice(0, 10)}
          </span>
          {!g.revokedAt && (
            <button
              className="secondary"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await api(
                    "/api/v1/participants/revoke",
                    { grantId: g.id },
                    csrf,
                  );
                  setRows(
                    await api<Participants>(
                      "/api/v1/participants/" + placementId,
                    ),
                  );
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Revoke failed");
                } finally {
                  setBusy(false);
                }
              }}
            >
              Revoke access
            </button>
          )}
        </div>
      ))}
    </section>
  );
}
