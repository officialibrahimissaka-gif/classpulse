"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Layers3,
  LayoutDashboard,
  BriefcaseBusiness,
  Building2,
  Settings2,
  LogOut,
  ArrowUpRight,
  Plus,
  Check,
  Clock3,
} from "lucide-react";
import EntityPanel, { type Entity } from "./entity-panel";
import PrivacyPanel from "./privacy-panel";
import TaskAssignment from "./task-assignment";
import AdminPanel from "./admin-panel";
import SavedViews from "./saved-views";
import Exceptions from "./exceptions";
import ImportPanel from "./import-panel";
import ReportExport from "./report-export";
import { SharedPortal, Participants } from "./collaboration";
import { api, pages } from "./http";
type Me = {
  name: string;
  company: string;
  slug: string;
  csrf: string;
  external: boolean;
  reauthAvailable: boolean;
  permissions: string[];
  modules: Record<string, string>;
  trialEndsAt: string | null;
  subscription: { planKey: string; state: string };
  usage: { resourceKey: string; used: number; hardLimit: number }[];
};
type Client = { id: string; name: string; accountCode: string };
type Placement = {
  id: string;
  status: string;
  version: number;
  originalPlannedStart: string;
  currentPlannedStart: string;
  actualStart: string | null;
  timeZone: string;
  candidate: { displayName: string };
  client: { name: string };
  fromPlacementTask_placement: Task[];
  fromPlacementException_placement?: {
    id: string;
    category: string;
    state: string;
  }[];
};
type Task = {
  id: string;
  label: string;
  required: boolean;
  state: string;
  dueAt: string;
  version?: number;
};
export type Report = {
  snapshotId?: string;
  snapshotExpiresAt?: string;
  filters: { from: string; to: string; clientId?: string; entityId?: string };
  asOf: string;
  drilldowns: Record<string, string[]>;
  distribution: Record<string, number>;
  metrics: {
    confirmedStarts: number;
    onTimeRate: number | null;
    overdueRequired: number;
    medianDelay: number | null;
    denominator: number;
    unresolved: number;
    canceled: number;
  };
  rows: {
    id: string;
    candidate: string;
    client: string;
    status: string;
    planned: string;
    overdue: number;
  }[];
};
const date = (v: string) => v.slice(0, 10);
export default function Workspace() {
  const router = useRouter();
  const [me, setMe] = useState<Me>(),
    [clients, setClients] = useState<Client[]>([]),
    [entities, setEntities] = useState<Entity[]>([]),
    [placements, setPlacements] = useState<Placement[]>([]),
    [selected, setSelected] = useState<Placement>(),
    [report, setReport] = useState<Report>(),
    [tab, setTab] = useState("Overview"),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [from, setFrom] = useState(new Date().toISOString().slice(0, 7) + "-01"),
    [to, setTo] = useState(new Date().toISOString().slice(0, 10)),
    [clientFilter, setClientFilter] = useState(""),
    [entityFilter, setEntityFilter] = useState(""),
    [drillMetric, setDrillMetric] = useState("all");
  const load = useCallback(async () => {
    const m = await api<Me>("/api/v1/me");
    setMe(m);
    if (!m.external) {
      const [c, p] = await Promise.all([
        pages<Client>("/api/v1/clients"),
        pages<Placement>("/api/v1/placements"),
      ]);
      setEntities(await api<Entity[]>("/api/v1/entities"));
      setClients(c);
      setPlacements(
        p.sort(
          (a, b) =>
            a.currentPlannedStart.localeCompare(b.currentPlannedStart) ||
            a.id.localeCompare(b.id),
        ),
      );
    }
  }, []);
  useEffect(() => {
    void Promise.resolve()
      .then(load)
      .catch((e) => setError(e.message));
  }, [load]);
  const reportEpoch = useRef(0);
  const loadReport = useCallback(async () => {
    const epoch = ++reportEpoch.current;
    try {
      const next = await api<Report>(
        "/api/v1/reports?" +
          new URLSearchParams({
            from,
            to,
            ...(clientFilter ? { clientId: clientFilter } : {}),
            ...(entityFilter ? { entityId: entityFilter } : {}),
          }),
      );
      if (epoch === reportEpoch.current) setReport(next);
    } catch (e) {
      if (epoch === reportEpoch.current)
        setError(e instanceof Error ? e.message : "Report unavailable");
    }
  }, [from, to, clientFilter, entityFilter]);
  useEffect(() => {
    if (me && !me.external) void Promise.resolve().then(loadReport);
  }, [me, loadReport]);
  async function run(fn: () => Promise<unknown>) {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      await fn();
      await load();
      await loadReport();
      setNotice("Changes saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Operation failed");
    } finally {
      setBusy(false);
    }
  }
  async function open(id: string) {
    setError("");
    try {
      setSelected(await api<Placement>("/api/v1/placements/" + id));
      setTab("Placements");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unavailable");
    }
  }
  async function act(body: unknown) {
    if (!selected || !me) return;
    await api(
      "/api/v1/placements/" + selected.id + "/actions",
      body,
      me.csrf,
      selected.version,
    );
    setSelected(await api<Placement>("/api/v1/placements/" + selected.id));
  }
  function create(
    event: React.SubmitEvent<HTMLFormElement>,
    kind: "clients" | "placements",
  ) {
    event.preventDefault();
    const form = event.currentTarget,
      body = Object.fromEntries(new FormData(form));
    void run(async () => {
      await api("/api/v1/" + kind, body, me?.csrf);
      form.reset();
    });
  }
  return (
    <div className="shell">
      <aside className="sidebar">
        <a className="brand" href="/workspace">
          <Layers3 aria-hidden="true" />
          ClassPulse
        </a>
        <div className="workspace-name">
          {me?.company ?? "Your workspace"}
          <span>Placement operations</span>
        </div>
        <nav aria-label="Main navigation">
          {[
            { name: "Overview", icon: LayoutDashboard },
            { name: "Placements", icon: BriefcaseBusiness },
            { name: "Clients", icon: Building2 },
            { name: "Settings", icon: Settings2 },
          ]
            .filter(({ name }) => !me?.external || name === "Overview")
            .map(({ name, icon: Icon }) => (
              <button
                key={name}
                className={tab === name ? "nav active" : "nav"}
                aria-current={tab === name ? "page" : undefined}
                onClick={() => {
                  setTab(name);
                  setSelected(undefined);
                }}
              >
                <Icon size={19} aria-hidden="true" />
                {me?.external ? "My tasks" : name}
              </button>
            ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="avatar">{me?.name.slice(0, 1) ?? "C"}</span>
          <span>
            {me?.name ?? "Sign in required"}
            <small>{me?.slug}</small>
          </span>
          {me && (
            <button
              className="icon-button"
              aria-label="Sign out"
              onClick={() =>
                void run(async () => {
                  await api("/api/auth/logout", {}, me.csrf);
                  router.push("/");
                })
              }
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>
      <main id="main" className="main">
        <header className="topbar">
          <span>
            Workspace <span className="muted">/ {tab}</span>
          </span>
          <span className="pill">
            {me ? me.subscription.planKey : "Secure workspace"}
          </span>
        </header>
        <div className="content">
          <div className="page-heading">
            <div>
              <span className="eyebrow">YOUR OPERATIONS, IN FOCUS</span>
              <h1>
                {selected
                  ? selected.candidate.displayName
                  : tab === "Overview"
                    ? "Every start, in sight."
                    : tab}
              </h1>
              <p className="muted">
                {tab === "Overview"
                  ? "A clear picture of your placement journey."
                  : tab === "Placements"
                    ? "Keep the next step clear, from acceptance to the first day."
                    : tab === "Clients"
                      ? "The companies behind your placements."
                      : "Manage access, modules, and trial capacity."}
              </p>
            </div>
            {tab === "Overview" && (
              <button className="secondary" onClick={() => window.print()}>
                Print overview
              </button>
            )}
          </div>
          <div role="alert" className={error ? "error" : ""}>
            {error}
            {!me && error && <Link href="/"> Sign in</Link>}
          </div>
          <div role="status" className={notice ? "success" : ""}>
            {notice}
          </div>
          {busy && <p role="status">Saving changes…</p>}
          {me?.external ? (
            <SharedPortal csrf={me.csrf} />
          ) : (
            <>
              {tab === "Overview" && (
                <>
                  <section className="filters" aria-label="Report filters">
                    <label>
                      From
                      <input
                        type="date"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                      />
                    </label>
                    <label>
                      To
                      <input
                        type="date"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                      />
                    </label>
                    <label>
                      Client
                      <select
                        value={clientFilter}
                        onChange={(e) => setClientFilter(e.target.value)}
                      >
                        <option value="">All accessible clients</option>
                        {clients.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Legal entity
                      <select
                        value={entityFilter}
                        onChange={(e) => setEntityFilter(e.target.value)}
                      >
                        <option value="">All accessible entities</option>
                        {entities.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <span className="muted small">
                      {report
                        ? "As of " + new Date(report.asOf).toLocaleString()
                        : "Loading metrics…"}
                    </span>
                  </section>
                  {me?.permissions.includes("reports.export") && (
                    <ReportExport
                      key={JSON.stringify([
                        from,
                        to,
                        clientFilter,
                        entityFilter,
                      ])}
                      csrf={me.csrf}
                      snapshotId={
                        report?.filters.from === from &&
                        report.filters.to === to &&
                        (report.filters.clientId ?? "") === clientFilter &&
                        (report.filters.entityId ?? "") === entityFilter
                          ? report.snapshotId
                          : undefined
                      }
                      snapshotExpiresAt={report?.snapshotExpiresAt}
                      onFrozen={(value) => {
                        ++reportEpoch.current;
                        setReport({
                          ...value.data,
                          snapshotId: value.id,
                          snapshotExpiresAt: value.expiresAt,
                        });
                      }}
                      onRefresh={() => void loadReport()}
                      from={from}
                      to={to}
                      clientId={clientFilter}
                      entityId={entityFilter}
                    />
                  )}
                  {me && (
                    <SavedViews
                      csrf={me.csrf}
                      filters={{
                        from,
                        to,
                        ...(clientFilter ? { clientId: clientFilter } : {}),
                        ...(entityFilter ? { entityId: entityFilter } : {}),
                      }}
                      onApply={(v) => {
                        setFrom(v.from);
                        setTo(v.to);
                        setClientFilter(v.clientId ?? "");
                        setEntityFilter(v.entityId ?? "");
                      }}
                    />
                  )}
                  <div className="metrics">
                    {[
                      {
                        key: "confirmedStarts",
                        label: "Confirmed starts",
                        value: report?.metrics.confirmedStarts,
                        sub: "Actual starts in selected period",
                        icon: Check,
                      },
                      {
                        key: "onTimeRate",
                        label: "On-time starts",
                        value:
                          report?.metrics.onTimeRate == null
                            ? "—"
                            : report.metrics.onTimeRate.toFixed(0) + "%",
                        sub: `${report?.metrics.denominator ?? 0} started in original-date cohort`,
                        icon: ArrowUpRight,
                      },
                      {
                        key: "overdueRequired",
                        label: "Overdue required tasks",
                        value: report?.metrics.overdueRequired,
                        sub: "Current unfinished required work",
                        icon: Clock3,
                      },
                      {
                        key: "medianDelay",
                        label: "Median start delay",
                        value:
                          report?.metrics.medianDelay == null
                            ? "—"
                            : report.metrics.medianDelay + " days",
                        sub: "Compared with the original plan",
                        icon: BriefcaseBusiness,
                      },
                    ].map(({ key, label, value, sub, icon: Icon }) => (
                      <button
                        className="card metric"
                        key={label}
                        onClick={() => {
                          setDrillMetric(key);
                          document
                            .getElementById("metric-sources")
                            ?.scrollIntoView({ behavior: "smooth" });
                        }}
                      >
                        <span>
                          {label}
                          <Icon size={18} aria-hidden="true" />
                        </span>
                        <strong>{value ?? "—"}</strong>
                        <small>{sub}</small>
                      </button>
                    ))}
                  </div>
                  <div className="overview-grid">
                    <section className="card">
                      <h2>Placement journey</h2>
                      <p className="muted small">
                        Current state across accessible placements
                      </p>
                      {[
                        "accepted",
                        "in_progress",
                        "ready",
                        "started",
                        "canceled",
                      ].map((state) => {
                        const n = report?.distribution[state] ?? 0;
                        return (
                          <div className="bar-row" key={state}>
                            <span>{state.replace("_", " ")}</span>
                            <div className="bar-track">
                              <span
                                style={{
                                  width: `${report?.rows.length ? (100 * n) / report.rows.length : 0}%`,
                                }}
                              />
                            </div>
                            <strong>{n}</strong>
                          </div>
                        );
                      })}
                      <p className="muted small">
                        Original-date cohort: {report?.metrics.unresolved ?? 0}{" "}
                        unresolved · {report?.metrics.canceled ?? 0} canceled.
                        No prior-period baseline is available.
                      </p>
                    </section>
                    <section className="card accent">
                      <span className="eyebrow">THE NEXT GOOD START</span>
                      <h2>Make readiness a decision.</h2>
                      <p>
                        Complete the required checklist, resolve blockers, then
                        record a human review before confirming the first day.
                      </p>
                      <button
                        className="secondary"
                        onClick={() => setTab("Placements")}
                      >
                        Review placements <ArrowUpRight size={17} />
                      </button>
                    </section>
                  </div>
                  <section className="card">
                    <h2 id="metric-sources">Source records</h2>
                    <label>
                      Metric drill-down
                      <select
                        value={drillMetric}
                        onChange={(e) => setDrillMetric(e.target.value)}
                      >
                        <option value="all">
                          All accessible source records
                        </option>
                        <option value="confirmedStarts">
                          Confirmed starts
                        </option>
                        <option value="onTimeRate">On-time denominator</option>
                        <option value="overdueRequired">
                          Placements with overdue required tasks
                        </option>
                        <option value="medianDelay">Median delay cohort</option>
                      </select>
                    </label>
                    <p className="muted small">
                      Open a record to inspect its checklist and start
                      decisions.
                    </p>
                    <PlacementTable
                      rows={(report?.rows ?? []).filter(
                        (r) =>
                          drillMetric === "all" ||
                          report?.drilldowns[drillMetric]?.includes(r.id),
                      )}
                      open={open}
                    />
                  </section>
                </>
              )}
              {tab === "Clients" && (
                <div className="split">
                  <section className="card">
                    <h2>Client directory</h2>
                    {clients.length ? (
                      <table>
                        <caption className="sr-only">
                          Accessible clients
                        </caption>
                        <thead>
                          <tr>
                            <th>Company</th>
                            <th>Reference</th>
                          </tr>
                        </thead>
                        <tbody>
                          {clients.map((c) => (
                            <tr key={c.id}>
                              <td>{c.name}</td>
                              <td>{c.accountCode}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <Empty text="Add your first client to begin a placement." />
                    )}
                  </section>
                  {me?.permissions.includes("accounts.write") && (
                    <section className="card">
                      <h2>Add a client</h2>
                      <form onSubmit={(e) => create(e, "clients")}>
                        <label>
                          Company name
                          <input name="name" required maxLength={200} />
                        </label>
                        <label>
                          Client reference
                          <input name="code" required maxLength={60} />
                        </label>
                        <button disabled={busy}>
                          <Plus size={16} />
                          Add client
                        </button>
                      </form>
                    </section>
                  )}
                </div>
              )}
              {tab === "Placements" &&
                !selected &&
                me?.permissions.includes("imports.run") && (
                  <ImportPanel
                    csrf={me.csrf}
                    entities={entities}
                    onCommitted={load}
                  />
                )}
              {tab === "Placements" && !selected && (
                <>
                  <section className="card">
                    <h2>Active and historical placements</h2>
                    <PlacementTable
                      rows={placements.map((p) => ({
                        id: p.id,
                        candidate: p.candidate.displayName,
                        client: p.client.name,
                        status: p.status,
                        planned: date(p.currentPlannedStart),
                        overdue: p.fromPlacementTask_placement.filter(
                          (t) =>
                            t.required &&
                            !["completed", "waived"].includes(t.state) &&
                            Date.parse(t.dueAt) < Date.now() &&
                            !["started", "canceled"].includes(p.status),
                        ).length,
                      }))}
                      open={open}
                    />
                  </section>
                  {me?.permissions.includes("placements.write") && (
                    <section className="card">
                      <h2>Record an accepted placement</h2>
                      {clients.length ? (
                        <form onSubmit={(e) => create(e, "placements")}>
                          <div className="form-grid">
                            <label>
                              Client
                              <select name="clientId" required>
                                {clients.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.name}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label>
                              Candidate name
                              <input
                                name="candidateName"
                                required
                                maxLength={200}
                              />
                            </label>
                            <label>
                              Source system
                              <input
                                name="sourceProfile"
                                required
                                maxLength={80}
                                placeholder="e.g. your ATS"
                              />
                            </label>
                            <label>
                              Placement source reference
                              <input
                                name="sourceKey"
                                required
                                maxLength={160}
                              />
                            </label>
                            <label>
                              Candidate source reference
                              <input
                                name="candidateKey"
                                required
                                maxLength={160}
                              />
                            </label>
                            <label>
                              Accepted on
                              <input name="acceptedOn" type="date" required />
                            </label>
                            <label>
                              Planned first day
                              <input name="plannedStart" type="date" required />
                            </label>
                          </div>
                          <button disabled={busy}>
                            <Plus size={16} />
                            Create placement checklist
                          </button>
                        </form>
                      ) : (
                        <p>Add a client first.</p>
                      )}
                    </section>
                  )}
                </>
              )}
              {selected && tab === "Placements" && (
                <>
                  <button
                    className="text-link"
                    onClick={() => setSelected(undefined)}
                  >
                    ← All placements
                  </button>
                  <section className="card">
                    <div className="record-heading">
                      <div>
                        <h2>{selected.client.name}</h2>
                        <p>
                          Original plan: {date(selected.originalPlannedStart)} ·
                          Current plan: {date(selected.currentPlannedStart)}
                          {selected.actualStart
                            ? " · Started: " + date(selected.actualStart)
                            : ""}
                        </p>
                      </div>
                      <span className="pill">
                        {selected.status.replace("_", " ")}
                      </span>
                    </div>
                    <h3>Start checklist</h3>
                    {selected.fromPlacementTask_placement.map((t) => (
                      <div className="task" key={t.id}>
                        <div>
                          <strong>{t.label}</strong>
                          <small>
                            {t.required ? "Required" : "Optional"} · Due{" "}
                            {new Intl.DateTimeFormat(undefined, {
                              dateStyle: "medium",
                              timeStyle: "short",
                              timeZone: selected.timeZone,
                            }).format(new Date(t.dueAt)) +
                              " " +
                              selected.timeZone}{" "}
                            · {t.state}
                          </small>
                        </div>
                        {!["started", "canceled"].includes(selected.status) &&
                          !["completed", "waived"].includes(t.state) && (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                const values = new FormData(e.currentTarget);
                                void run(() =>
                                  act({
                                    action: "complete",
                                    taskId: t.id,
                                    evidence: values.get("evidence"),
                                  }),
                                );
                              }}
                            >
                              <label className="sr-only" htmlFor={t.id}>
                                Completion evidence for {t.label}
                              </label>
                              <input
                                id={t.id}
                                name="evidence"
                                required
                                minLength={3}
                                maxLength={500}
                                placeholder="Evidence reference or confirmation"
                              />
                              <button className="secondary" disabled={busy}>
                                Complete
                              </button>
                            </form>
                          )}
                      </div>
                    ))}
                    {me?.permissions.includes("placements.decide") && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const data = Object.fromEntries(
                            new FormData(e.currentTarget),
                          );
                          void run(() => act(data));
                        }}
                      >
                        <h3>Record a decision</h3>
                        <div className="form-grid">
                          <label>
                            Action
                            <select
                              name="action"
                              onChange={(e) => {
                                const field =
                                  e.currentTarget.form?.elements.namedItem(
                                    "date",
                                  ) as HTMLInputElement | null;
                                if (field) {
                                  field.disabled = ![
                                    "start",
                                    "reschedule",
                                  ].includes(e.target.value);
                                  field.required = !field.disabled;
                                }
                              }}
                            >
                              {(["started", "canceled"].includes(
                                selected.status,
                              )
                                ? ["reopen"]
                                : ["ready", "start", "cancel", "reschedule"]
                              ).map((a) => (
                                <option key={a} value={a}>
                                  {a}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label>
                            Date (start / reschedule)
                            <input name="date" type="date" disabled />
                          </label>
                          <label>
                            Reason
                            <input
                              name="reason"
                              required
                              minLength={3}
                              maxLength={200}
                            />
                          </label>
                        </div>
                        <button
                          disabled={busy}
                          onClick={(e) => {
                            const form = e.currentTarget.form;
                            if (form) {
                              const action = (
                                form.elements.namedItem(
                                  "action",
                                ) as HTMLSelectElement
                              ).value;
                              const dt = form.elements.namedItem(
                                "date",
                              ) as HTMLInputElement;
                              dt.disabled = !["start", "reschedule"].includes(
                                action,
                              );
                              dt.required = ["start", "reschedule"].includes(
                                action,
                              );
                            }
                          }}
                        >
                          Save decision
                        </button>
                      </form>
                    )}
                  </section>
                </>
              )}
              {selected &&
                tab === "Placements" &&
                me?.permissions.includes("tasks.assign") &&
                !["started", "canceled"].includes(selected.status) && (
                  <TaskAssignment
                    csrf={me.csrf}
                    tasks={selected.fromPlacementTask_placement}
                    onChanged={async () => {
                      setSelected(
                        await api<Placement>(
                          "/api/v1/placements/" + selected.id,
                        ),
                      );
                      await loadReport();
                    }}
                  />
                )}
              {selected &&
                tab === "Placements" &&
                me?.permissions.includes("placements.write") &&
                !["started", "canceled"].includes(selected.status) && (
                  <Exceptions
                    exceptions={selected.fromPlacementException_placement ?? []}
                    tasks={selected.fromPlacementTask_placement}
                    canDecide={me.permissions.includes("placements.decide")}
                    act={async (data) => {
                      await run(() => act(data));
                    }}
                    busy={busy}
                  />
                )}
              {selected &&
                tab === "Placements" &&
                me?.permissions.includes("participants.manage") &&
                !["started", "canceled"].includes(selected.status) && (
                  <Participants
                    placementId={selected.id}
                    tasks={selected.fromPlacementTask_placement}
                    csrf={me.csrf}
                  />
                )}
              {tab === "Settings" && me && (
                <>
                  <AdminPanel csrf={me.csrf} permissions={me.permissions} />
                  {me.permissions.includes("tenant.manage") && (
                    <EntityPanel csrf={me.csrf} />
                  )}
                  {me.permissions.includes("privacy.manage") && (
                    <PrivacyPanel csrf={me.csrf} />
                  )}
                  <section className="card">
                    <h2>Subscription and capacity</h2>
                    {me.reauthAvailable && (
                      <a
                        className="text-link"
                        href={
                          "/api/auth/login?workspace=" +
                          encodeURIComponent(me.slug)
                        }
                      >
                        Reauthenticate for sensitive changes
                      </a>
                    )}
                    <p>
                      {me.trialEndsAt
                        ? `Trial ends ${new Date(me.trialEndsAt).toLocaleDateString()}. After expiry, retained source records remain accessible during the 30-day exit window.`
                        : `Current plan: ${me.subscription.planKey}.`}
                    </p>
                    <div className="metrics">
                      {me.usage.map((u) => (
                        <div key={u.resourceKey}>
                          <h3>{u.resourceKey.replaceAll("_", " ")}</h3>
                          <strong>
                            {u.used} / {u.hardLimit}
                          </strong>
                        </div>
                      ))}
                    </div>
                    <p className="muted small">
                      Paid plans require an accepted commercial order. Payment
                      processing is not enabled in this local release.
                    </p>
                  </section>
                  <section className="card">
                    <h2>Product modules</h2>
                    <p>
                      Disabling a module makes retained data read-only. It does
                      not delete records. Sensitive changes require a fresh MFA
                      sign-in.
                    </p>
                    {Object.entries(me.modules).map(([key, state]) => (
                      <div className="task" key={key}>
                        <div>
                          <strong>{key}</strong>
                          <small>{state}</small>
                        </div>
                        {key !== "platform.core" &&
                          me.permissions.includes("billing.manage") && (
                            <button
                              disabled={busy}
                              className="secondary"
                              onClick={() => {
                                const cascade =
                                  key === "crm.accounts" && state === "active"
                                    ? window.confirm(
                                        "CRM accounts and Agency starts will both become read-only. Retained data will remain available. Continue?",
                                      )
                                    : false;
                                if (
                                  key === "crm.accounts" &&
                                  state === "active" &&
                                  !cascade
                                )
                                  return;
                                void run(() =>
                                  api(
                                    "/api/v1/modules",
                                    {
                                      module: key,
                                      state:
                                        state === "active"
                                          ? "read_only"
                                          : "active",
                                      cascade,
                                    },
                                    me.csrf,
                                  ),
                                );
                              }}
                            >
                              {state === "active"
                                ? "Make read-only"
                                : "Reactivate"}
                            </button>
                          )}
                      </div>
                    ))}
                  </section>
                </>
              )}
            </>
          )}
        </div>
        <footer>ClassPulse · Human decisions. Clear next steps.</footer>
      </main>
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <div className="empty">
      <BriefcaseBusiness aria-hidden="true" />
      <p>{text}</p>
    </div>
  );
}
function PlacementTable({
  rows,
  open,
}: {
  rows: {
    id: string;
    candidate: string;
    client: string;
    status: string;
    planned: string;
    overdue: number;
  }[];
  open: (id: string) => Promise<void>;
}) {
  return rows.length ? (
    <div className="table-wrap">
      <table>
        <caption className="sr-only">Placement source records</caption>
        <thead>
          <tr>
            <th>Candidate</th>
            <th>Client</th>
            <th>Planned start</th>
            <th>Status</th>
            <th>Overdue</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>
                <button className="text-link" onClick={() => void open(r.id)}>
                  {r.candidate} <ArrowUpRight size={14} />
                </button>
              </td>
              <td>{r.client}</td>
              <td>{r.planned}</td>
              <td>
                <span className={"pill " + r.status}>
                  {r.status.replace("_", " ")}
                </span>
              </td>
              <td>{r.overdue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <Empty text="No placements yet. Record an accepted placement to create its first checklist." />
  );
}
