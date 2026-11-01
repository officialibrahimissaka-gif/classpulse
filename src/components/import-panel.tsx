"use client";
import { useState } from "react";
import { api } from "./http";
type Batch = {
  id: string;
  state: string;
  rowCount: number;
  errorCount: number;
  errors: { rowNumber: number; columnKey: string; errorCode: string }[];
};
const template =
  "clientCode,clientName,candidateKey,candidateName,placementKey,acceptedOn,plannedStart\nCLIENT-1,Example Client,CAND-1,Example Candidate,PLACE-1,2026-11-01,2026-11-10\n";
export default function ImportPanel({
  csrf,
  entities,
  onCommitted,
}: {
  csrf: string;
  entities: { id: string; name: string }[];
  onCommitted: () => Promise<void>;
}) {
  const [batch, setBatch] = useState<Batch>(),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <section className="card">
      <h2>Import accepted placements</h2>
      <p>
        Validate up to 1,000 CSV rows before committing. Source references
        identify records; email addresses are never used to merge identities.
        The entire commit succeeds or rolls back together.
      </p>
      <a
        className="text-link"
        download="placement-import-template.csv"
        href={"data:text/csv;charset=utf-8," + encodeURIComponent(template)}
      >
        Download CSV template
      </a>
      <div role="alert">{error}</div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget),
            file = data.get("file");
          setBusy(true);
          setError("");
          try {
            if (!(file instanceof File) || file.size > 10 * 1024 * 1024)
              throw Error("Choose a CSV file no larger than 10 MiB.");
            const result = await api<{ id: string }>(
              "/api/v1/imports",
              {
                sourceProfile: data.get("sourceProfile"),
                entityId: data.get("entityId"),
                csv: await file.text(),
              },
              csrf,
            );
            setBatch(await api<Batch>("/api/v1/imports/" + result.id));
          } catch (e) {
            setError(e instanceof Error ? e.message : "Import failed");
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="form-grid">
          <label>
            Import legal entity
            <select name="entityId" required>
              {entities.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Import source system
            <input name="sourceProfile" required maxLength={80} />
          </label>
          <label>
            Placement CSV
            <input type="file" accept=".csv,text/csv" name="file" required />
          </label>
        </div>
        <button className="secondary" disabled={busy}>
          Validate CSV
        </button>
      </form>
      {batch && (
        <>
          <p role="status">
            {batch.state} · {batch.rowCount} rows · {batch.errorCount}{" "}
            validation errors
          </p>
          {batch.errors.length > 0 && (
            <div className="table-wrap">
              <table>
                <caption>CSV validation errors</caption>
                <thead>
                  <tr>
                    <th>Row</th>
                    <th>Column</th>
                    <th>Code</th>
                  </tr>
                </thead>
                <tbody>
                  {batch.errors.map((e, i) => (
                    <tr key={i}>
                      <td>{e.rowNumber}</td>
                      <td>{e.columnKey}</td>
                      <td>{e.errorCode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {batch.state === "validated" && (
            <button
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setError("");
                try {
                  await api(
                    "/api/v1/imports/" + batch.id + "/commit",
                    {},
                    csrf,
                  );
                  setBatch(await api<Batch>("/api/v1/imports/" + batch.id));
                  await onCommitted();
                } catch (e) {
                  setError(
                    e instanceof Error ? e.message : "Import commit failed",
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              Commit validated import
            </button>
          )}
        </>
      )}
    </section>
  );
}
