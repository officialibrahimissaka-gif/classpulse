"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "./http";
export default function Invitation({ development }: { development: boolean }) {
  const [error, setError] = useState(""),
    [ready, setReady] = useState(false),
    [busy, setBusy] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const fragment = location.hash.slice(1);
    if (fragment) {
      history.replaceState(null, "", "/invite");
      const context = Object.fromEntries(new URLSearchParams(fragment));
      void api("/api/invitation", { action: "remember", context })
        .then(() => setReady(true))
        .catch((e) => setError(e.message));
    } else queueMicrotask(() => setReady(true));
  }, []);
  async function accept() {
    setError("");
    setBusy(true);
    try {
      await api("/api/invitation", { action: "accept" });
      router.push("/workspace");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to accept invitation");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main id="main" className="content" style={{ maxWidth: 650 }}>
      <section className="card">
        <span className="eyebrow">CLASS PULSE · CLIENT COORDINATION</span>
        <h1>You have a part in a good start.</h1>
        <p>
          Sign in with the invited email address, then accept access to the
          selected placement fields and assigned tasks.
        </p>
        <div role="alert">{error}</div>
        {development ? (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                await api(
                  "/api/auth/development",
                  Object.fromEntries(new FormData(e.currentTarget)),
                );
                await accept();
              } catch (e) {
                setError(e instanceof Error ? e.message : "Sign in failed");
              } finally {
                setBusy(false);
              }
            }}
          >
            <p className="notice">
              Local, unverified development identity. Production uses verified
              OIDC identities.
            </p>
            <label>
              Name
              <input name="name" required />
            </label>
            <label>
              Invited email
              <input name="email" type="email" required />
            </label>
            <button disabled={busy || !ready}>
              Sign in locally and accept
            </button>
          </form>
        ) : (
          <>
            <form action="/api/auth/login" method="GET">
              <button>Sign in with your identity provider</button>
            </form>
            <p>After sign-in, return to this page to accept the invitation.</p>
            <button disabled={busy || !ready} onClick={() => void accept()}>
              Accept invitation
            </button>
          </>
        )}
      </section>
    </main>
  );
}
