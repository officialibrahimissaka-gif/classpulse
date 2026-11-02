"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "./http";
type Summary = {
  mode: string;
  syncedAt: string | null;
  payments: {
    reference: string;
    status: string;
    currency: string;
    amountMinor: string;
    paidAt: string | null;
    syncedAt: string;
  }[];
};
function money(minor: string, currency: string) {
  const n = BigInt(minor);
  return `${currency} ${(n / 100n).toString()}.${(n % 100n).toString().padStart(2, "0")}`;
}
export default function BillingPanel() {
  const [data, setData] = useState<Summary>(),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  async function load() {
    setLoading(true);
    setError("");
    try {
      setData(await api("/api/v1/billing"));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to load billing records.",
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    let canceled = false;
    void api<Summary>("/api/v1/billing")
      .then((value) => {
        if (!canceled) setData(value);
      })
      .catch((e) => {
        if (!canceled)
          setError(
            e instanceof Error ? e.message : "Unable to load billing records.",
          );
      })
      .finally(() => {
        if (!canceled) setLoading(false);
      });
    return () => {
      canceled = true;
    };
  }, []);
  return (
    <main id="main" className="launch-page">
      <Link href="/workspace">Back to workspace</Link>
      <h1>Billing records</h1>
      <p className="notice">
        Paystack test-mode observations only. This page does not collect a
        payment or change a subscription. Reviewed orders remain the source of
        entitlements. Invoice issuance, tax, live recurring collection and
        payment disputes require an approved merchant setup.
      </p>
      <button type="button" disabled={loading} onClick={() => void load()}>
        Refresh records
      </button>
      <p role="alert">{error}</p>
      {loading ? (
        <p role="status">Loading records…</p>
      ) : (
        data && (
          <>
            <p>
              Last provider reconciliation:{" "}
              {data.syncedAt ?? "No verified test records imported"}. Showing up
              to the latest 100 observations; this is not a financial ledger.
            </p>
            <div className="table-scroll">
              <table>
                <caption>
                  Verified Paystack test transaction observations
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Reference</th>
                    <th scope="col">Status</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Paid at</th>
                  </tr>
                </thead>
                <tbody>
                  {data.payments.map((p) => (
                    <tr key={p.reference}>
                      <td>{p.reference}</td>
                      <td>{p.status}</td>
                      <td>{money(p.amountMinor, p.currency)}</td>
                      <td>{p.paidAt ?? "Not confirmed"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!data.payments.length && <p>No payment observations yet.</p>}
          </>
        )
      )}
    </main>
  );
}
