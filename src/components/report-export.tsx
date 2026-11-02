"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "./http";
import type { Report } from "./workspace";
type Run = {
  id: string;
  state: string;
  artifactId?: string;
  errorCode?: string;
  snapshotId?: string;
};
type Frozen = { id: string; expiresAt: string; data: Report };
export default function ReportExport({
  csrf,
  from,
  to,
  clientId,
  entityId,
  snapshotId,
  snapshotExpiresAt,
  onFrozen,
  onRefresh,
}: {
  csrf: string;
  from: string;
  to: string;
  clientId: string;
  entityId: string;
  snapshotId?: string;
  snapshotExpiresAt?: string;
  onFrozen: (value: Frozen) => void;
  onRefresh: () => void;
}) {
  const [run, setRun] = useState<Run>(),
    [error, setError] = useState(""),
    [format, setFormat] = useState("pdf"),
    [busy, setBusy] = useState(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const pending = !!run && ["queued", "generating"].includes(run.state);
  useEffect(() => {
    if (!run || !["queued", "generating"].includes(run.state)) return;
    let canceled = false;
    const timer = setInterval(() => {
      void api<Run>("/api/v1/exports/" + run.id)
        .then((value) => {
          if (!canceled) setRun(value);
        })
        .catch((e) => {
          if (!canceled) {
            setError(e.message);
            setRun((r) =>
              r ? { ...r, state: "unavailable", artifactId: undefined } : r,
            );
          }
        });
    }, 2000);
    return () => {
      canceled = true;
      clearInterval(timer);
    };
  }, [run]);
  async function freeze() {
    const ack = await api<{ id: string }>(
      "/api/v1/report-snapshots",
      {
        filters: {
          from,
          to,
          ...(clientId ? { clientId } : {}),
          ...(entityId ? { entityId } : {}),
        },
      },
      csrf,
    );
    const frozen = await api<Frozen>("/api/v1/report-snapshots/" + ack.id);
    if (mounted.current) onFrozen(frozen);
    return frozen.id;
  }
  async function generate() {
    setBusy(true);
    setError("");
    try {
      const id = snapshotId ?? (await freeze());
      if (!mounted.current) return;
      const ack = await api<Run>(
        "/api/v1/exports",
        { snapshotId: id, format },
        csrf,
      );
      if (mounted.current) setRun({ ...ack, snapshotId: id });
    } catch (e) {
      if (mounted.current)
        setError(e instanceof Error ? e.message : "Export failed.");
    } finally {
      if (mounted.current) setBusy(false);
    }
  }
  return (
    <div className="export-control">
      <button
        className="secondary"
        disabled={busy || pending}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            await freeze();
            setRun(undefined);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Snapshot unavailable.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {snapshotId ? "Freeze new snapshot" : "Freeze report"}
      </button>
      {snapshotId && (
        <>
          <span role="status">
            Frozen snapshot · expires{" "}
            {snapshotExpiresAt ?? "at its original deadline"}. All formats use
            these displayed values.
          </span>
          <button
            className="secondary"
            disabled={busy || pending}
            onClick={() => {
              setRun(undefined);
              onRefresh();
            }}
          >
            Refresh live report
          </button>
        </>
      )}
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
        disabled={busy || pending}
        onClick={() => void generate()}
      >
        Generate export
      </button>
      {run && run.snapshotId === snapshotId && (
        <span role="status">
          {run.state === "queued"
            ? "Queued for the report worker"
            : run.state === "generating"
              ? "Rendering frozen snapshot"
              : run.state === "ready"
                ? "Ready"
                : "Report unavailable. Freeze a new snapshot or retry."}
        </span>
      )}
      {run?.artifactId && run.snapshotId === snapshotId && (
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
