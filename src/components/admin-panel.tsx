"use client";
import { useEffect, useState } from "react";
import { api } from "./http";
type Member = { id: string; displayName: string; status: string };
type TaskDef = {
  label: string;
  required: boolean;
  dueOffsetDays: number;
  dueTime: string;
};
export default function AdminPanel({
  csrf,
  permissions,
}: {
  csrf: string;
  permissions: string[];
}) {
  const [members, setMembers] = useState<Member[]>([]),
    [tasks, setTasks] = useState<TaskDef[]>([]),
    [revision, setRevision] = useState(0),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (permissions.includes("tasks.assign"))
      void api<Member[]>("/api/v1/members")
        .then(setMembers)
        .catch((e) => setError(e.message));
    if (permissions.includes("templates.manage"))
      void api<{
        revision: number;
        fromTaskDefinition_templateVersion: TaskDef[];
      }>("/api/v1/template")
        .then((v) => {
          setTasks(v.fromTaskDefinition_templateVersion);
          setRevision(v.revision);
        })
        .catch((e) => setError(e.message));
  }, [permissions]);
  async function run(path: string, data: unknown) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api("/api/v1/" + path, data, csrf);
      setNotice("Request recorded.");
      if (path === "members/deactivate")
        setMembers(await api<Member[]>("/api/v1/members"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div role="alert" className={error ? "error" : ""}>
        {error}
      </div>
      <div role="status">{notice}</div>
      {permissions.includes("roles.manage") && (
        <section className="card">
          <h2>Internal workspace members</h2>
          <p>
            Inviting or deactivating members requires fresh MFA. Recruiters
            receive access to owned placements and assigned work.
          </p>
          {members.map((m) => (
            <div className="task" key={m.id}>
              <span>
                {m.displayName} · {m.status}
              </span>
              {m.status === "active" && (
                <button
                  disabled={busy}
                  className="secondary"
                  onClick={() =>
                    void run("members/deactivate", { membershipId: m.id })
                  }
                >
                  Deactivate member
                </button>
              )}
            </div>
          ))}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void run(
                "members/invite",
                Object.fromEntries(new FormData(e.currentTarget)),
              );
            }}
          >
            <div className="form-grid">
              <label>
                New member name
                <input name="name" required maxLength={200} />
              </label>
              <label>
                New member email
                <input name="email" type="email" required maxLength={320} />
              </label>
              <label>
                Workspace role
                <select name="role">
                  <option value="recruiter">Recruiter</option>
                  <option value="owner">Owner</option>
                </select>
              </label>
            </div>
            <button disabled={busy}>Invite internal member</button>
          </form>
        </section>
      )}
      {permissions.includes("templates.manage") && (
        <section className="card">
          <h2>Start checklist · revision {revision}</h2>
          <p>
            Publishing creates a new immutable revision. Existing placements
            keep their current checklist and history.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void run("template", { tasks });
            }}
          >
            {tasks.map((t, i) => (
              <div className="form-grid" key={i}>
                <label>
                  Task {i + 1} label
                  <input
                    value={t.label}
                    required
                    maxLength={200}
                    onChange={(e) =>
                      setTasks(
                        tasks.map((x, n) =>
                          n === i ? { ...x, label: e.target.value } : x,
                        ),
                      )
                    }
                  />
                </label>
                <label>
                  Days relative to planned start
                  <input
                    type="number"
                    min={-365}
                    max={365}
                    value={t.dueOffsetDays}
                    required
                    onChange={(e) =>
                      setTasks(
                        tasks.map((x, n) =>
                          n === i
                            ? { ...x, dueOffsetDays: Number(e.target.value) }
                            : x,
                        ),
                      )
                    }
                  />
                </label>
                <label>
                  Local due time
                  <input
                    type="time"
                    value={t.dueTime}
                    required
                    onChange={(e) =>
                      setTasks(
                        tasks.map((x, n) =>
                          n === i ? { ...x, dueTime: e.target.value } : x,
                        ),
                      )
                    }
                  />
                </label>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={t.required}
                    onChange={(e) =>
                      setTasks(
                        tasks.map((x, n) =>
                          n === i ? { ...x, required: e.target.checked } : x,
                        ),
                      )
                    }
                  />
                  Required for readiness
                </label>
              </div>
            ))}
            <button
              type="button"
              className="secondary"
              disabled={tasks.length >= 50}
              onClick={() =>
                setTasks([
                  ...tasks,
                  {
                    label: "",
                    required: true,
                    dueOffsetDays: -1,
                    dueTime: "17:00",
                  },
                ])
              }
            >
              Add checklist task
            </button>
            <button disabled={busy}>Publish new checklist revision</button>
          </form>
        </section>
      )}
      {permissions.includes("billing.manage") && (
        <section className="card">
          <h2>Request a subscription change</h2>
          <p>
            Starter: 10 internal seats and 100 active placements. Growth: 30
            seats, 500 placements, and up to 3 legal entities. Prices and
            services require a reviewed commercial order; this request does not
            charge a card or activate a paid plan.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void run(
                "commercial-requests",
                Object.fromEntries(new FormData(e.currentTarget)),
              );
            }}
          >
            <label>
              Requested change
              <select name="requestType">
                <option value="upgrade">Upgrade</option>
                <option value="downgrade">Downgrade at reviewed renewal</option>
                <option value="cancel">Cancel at reviewed term end</option>
              </select>
            </label>
            <label>
              Plan for upgrade / downgrade
              <select name="planKey">
                <option value="starter">Starter</option>
                <option value="growth">Growth</option>
              </select>
            </label>
            <label>
              Business requirements
              <input name="reason" required minLength={3} maxLength={300} />
            </label>
            <button disabled={busy}>Record plan request</button>
          </form>
        </section>
      )}
    </>
  );
}
