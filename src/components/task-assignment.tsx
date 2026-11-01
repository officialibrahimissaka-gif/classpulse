"use client";
import { useEffect, useState } from "react";
import { api } from "./http";
export default function TaskAssignment({
  csrf,
  tasks,
  onChanged,
}: {
  csrf: string;
  tasks: { id: string; label: string; state: string; version?: number }[];
  onChanged: () => Promise<void>;
}) {
  const [members, setMembers] = useState<
      { id: string; displayName: string; status: string }[]
    >([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    void api<typeof members>("/api/v1/members")
      .then(setMembers)
      .catch((e) => setError(e.message));
  }, []);
  return (
    <details className="card">
      <summary>Assign an internal task owner</summary>
      <div role="alert">{error}</div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const data = Object.fromEntries(new FormData(e.currentTarget));
          setBusy(true);
          try {
            await api(
              "/api/v1/tasks/assign",
              data,
              csrf,
              tasks.find((t) => t.id === data.taskId)?.version,
            );
            await onChanged();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Unable to assign");
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Checklist task
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
          Internal owner
          <select name="ownerId" required>
            {members
              .filter((m) => m.status === "active")
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.displayName}
                </option>
              ))}
          </select>
        </label>
        <button className="secondary" disabled={busy}>
          Assign owner
        </button>
      </form>
    </details>
  );
}
