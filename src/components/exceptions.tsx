"use client";
import { useState } from "react";
export default function Exceptions({
  exceptions,
  tasks,
  canDecide,
  act,
  busy,
}: {
  exceptions: { id: string; category: string; state: string }[];
  tasks: { id: string; label: string; state: string }[];
  canDecide: boolean;
  act: (body: unknown) => Promise<void>;
  busy: boolean;
}) {
  const [error, setError] = useState("");
  async function execute(body: unknown) {
    setError("");
    try {
      await act(body);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update");
    }
  }
  return (
    <section className="card">
      <h2>Exceptions and waivers</h2>
      <p>
        Document blockers explicitly. A waiver requires an authorized human
        decision and a reason.
      </p>
      <div role="alert">{error}</div>
      {exceptions.map((e) => (
        <div className="task" key={e.id}>
          <span>
            {e.category} · {e.state}
          </span>
          {e.state === "open" && (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void execute({
                  action: "resolve",
                  exceptionId: e.id,
                  reason: new FormData(event.currentTarget).get("reason"),
                });
              }}
            >
              <label>
                Resolution reference
                <input name="reason" required minLength={3} maxLength={60} />
              </label>
              <button disabled={busy}>Resolve exception</button>
            </form>
          )}
        </div>
      ))}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void execute({
            action: "exception",
            category: new FormData(e.currentTarget).get("category"),
          });
        }}
      >
        <label>
          New blocker category
          <select name="category">
            {[
              "candidate",
              "client",
              "documentation",
              "scheduling",
              "other",
            ].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <button className="secondary" disabled={busy}>
          Open exception
        </button>
      </form>
      {canDecide && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(e.currentTarget));
            void execute({ action: "waive", ...data });
          }}
        >
          <h3>Waive an unfinished task</h3>
          <label>
            Task
            <select name="taskId" required>
              {tasks
                .filter((t) => !["completed", "waived"].includes(t.state))
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Waiver reason
            <input name="reason" required minLength={3} maxLength={300} />
          </label>
          <button
            className="secondary"
            disabled={
              busy ||
              !tasks.some((t) => !["completed", "waived"].includes(t.state))
            }
          >
            Record waiver
          </button>
        </form>
      )}
    </section>
  );
}
