"use client";
import { useEffect, useState } from "react";
import { api } from "./http";
type Run = {
  id: string;
  state: string;
  artifactId?: string;
  errorCode?: string;
};
export default function ReportExport({
  csrf,
  from,
  to,
  clientId,
  entityId,
}: {
  csrf: string;
  from: string;
  to: string;
  clientId: string;
  entityId: string;
}) {
  const [run, setRun] = useState<Run>(),
    [error, setError] = useState(""),
    [format, setFormat] = useState("pdf"),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!run || !["queued", "generating"].includes(run.state)) return;
    const timer = setInterval(() => {
      void api<Run>("/api/v1/exports/" + run.id)
        .then(setRun)
        .catch((e) => setError(e.message));
    }, 2000);
    return () => clearInterval(timer);
  }, [run]);
  return (
    <div className="export-control">
      <label className="sr-only" htmlFor="report-format">
        Export format
      </label>
      <select
        id="report-format"
        value={format}
        onChange={(e) => setFormat(e.target.value)}
      >
        <option value="pdf">PDF</option>
        <option value="csv">CSV</option>
        <option value="xlsx">XLSX</option>
      </select>
      <button
        className="secondary"
        disabled={
          busy || (!!run && !!["queued", "generating"].includes(run.state))
        }
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            setRun(
              await api<Run>(
                "/api/v1/exports",
                {
                  filters: {
                    from,
                    to,
                    ...(clientId ? { clientId } : {}),
                    ...(entityId ? { entityId } : {}),
                  },
                  format,
                },
                csrf,
              ),
            );
          } catch (e) {
            setError(e instanceof Error ? e.message : "Export failed");
          } finally {
            setBusy(false);
          }
        }}
      >
        Generate export
      </button>
      {run && (
        <span role="status">
          {run.state === "queued"
            ? "Queued for the report worker"
            : run.state === "generating"
              ? "Generating snapshot"
              : run.state === "failed"
                ? "Report failed. Generate a new export."
                : run.state === "ready"
                  ? "Ready"
                  : "Report unavailable. Generate a new export."}
        </span>
      )}
      {run?.artifactId && (
        <a
          className="text-link"
          href={"/api/v1/exports/" + run.artifactId + "/content"}
        >
          Download report
        </a>
      )}
      <span role="alert">{error}</span>
    </div>
  );
}
