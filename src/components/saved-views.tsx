"use client";
import { useEffect, useState } from "react";
import { api } from "./http";
type View = {
  id: string;
  name: string;
  visibility: string;
  filterSchema: {
    from: string;
    to: string;
    clientId?: string;
    entityId?: string;
  };
};
export default function SavedViews({
  csrf,
  filters,
  onApply,
}: {
  csrf: string;
  filters: { from: string; to: string; clientId?: string; entityId?: string };
  onApply: (v: View["filterSchema"]) => void;
}) {
  const [views, setViews] = useState<View[]>([]),
    [teams, setTeams] = useState<{ team: { id: string; name: string } }[]>([]),
    [error, setError] = useState("");
  useEffect(() => {
    void api<View[]>("/api/v1/views")
      .then(setViews)
      .catch((e) => setError(e.message));
    void api<{ team: { id: string; name: string } }[]>("/api/v1/teams")
      .then(setTeams)
      .catch((e) => setError(e.message));
  }, []);
  return (
    <details className="card">
      <summary>Saved report views</summary>
      <div role="alert">{error}</div>
      <label>
        Apply a saved view
        <select
          defaultValue=""
          onChange={(e) => {
            const view = views.find((v) => v.id === e.target.value);
            if (view) onApply(view.filterSchema);
          }}
        >
          <option value="" disabled>
            Choose a view
          </option>
          {views.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} · {v.visibility}
            </option>
          ))}
        </select>
      </label>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const data = Object.fromEntries(new FormData(e.currentTarget));
          try {
            await api(
              "/api/v1/views",
              {
                name: data.name,
                visibility: data.visibility,
                filters,
                ...(data.visibility === "team"
                  ? { teamId: teams[0]?.team.id }
                  : {}),
              },
              csrf,
            );
            setViews(await api<View[]>("/api/v1/views"));
          } catch (e) {
            setError(e instanceof Error ? e.message : "Unable to save");
          }
        }}
      >
        <div className="form-grid">
          <label>
            View name
            <input name="name" required maxLength={160} />
          </label>
          <label>
            Visibility
            <select name="visibility">
              <option value="private">Private</option>
              {teams.length > 0 && (
                <option value="team">{teams[0]!.team.name} team</option>
              )}
            </select>
          </label>
        </div>
        <button className="secondary">Save current filters</button>
      </form>
      <p className="small muted">
        Saved filters never expand your current access. Shared views require
        explicit team membership.
      </p>
    </details>
  );
}
