"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ApiError, adminLogin } from "@/lib/api";
import { useSession } from "./SessionProvider";

export function AdminLoginForm() {
  const router = useRouter();
  const { user, status, refresh } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isAdmin = status === "authenticated" && user?.role === "admin";

  // an already-authenticated admin should never see this form
  useEffect(() => {
    if (isAdmin) {
      router.replace("/admin");
    }
  }, [isAdmin, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (busy) {
      return;
    }

    setError("");
    setBusy(true);

    try {
      await adminLogin({ email: email.trim(), password });
      // the cookie is shared with the main site, so pick it up before navigating
      await refresh();
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "could not reach the admin api, is the server running?",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full max-w-md border-4 border-crt-line bg-crt-panel p-6 shadow-[6px_6px_0_0_#000] sm:p-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex items-center gap-2 border-2 border-crt-line bg-crt-bg px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-crt-dim">
          <span className="h-2 w-2 animate-pulse rounded-full bg-crt-blue" />
          admin_gate.exe
        </span>

        <h1 className="font-mono text-2xl font-bold uppercase tracking-widest text-crt-ink">
          restricted area
        </h1>

        <p className="font-mono text-xs leading-relaxed text-crt-dim">
          mentor operations console. one account only.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-crt-dim">
            email
          </span>
          <input
            type="email"
            name="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="enter admin email"
            className="w-full border-2 border-crt-line bg-crt-bg px-3 py-2.5 font-mono text-sm text-crt-ink outline-none transition-colors duration-100 focus:bg-crt-blue/10 focus:border-crt-blue"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-crt-dim">
            password
          </span>
          <input
            type="password"
            name="password"
            placeholder="enter admin password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full border-2 border-crt-line bg-crt-bg px-3 py-2.5 font-mono text-sm text-crt-ink outline-none transition-colors duration-100 focus:bg-crt-blue/10 focus:border-crt-blue"
          />
        </label>

        {error ? (
          <p
            role="alert"
            className="border-2 border-crt-blue bg-crt-blue/10 px-3 py-2 font-mono text-xs leading-relaxed text-crt-blue"
          >
            &gt;! {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="border-2 border-crt-line bg-crt-blue px-4 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white shadow-[3px_3px_0_0_#000] transition-all duration-100 hover:shadow-[1px_1px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "authenticating..." : "enter console"}
        </button>
      </form>
    </div>
  );
}

export default AdminLoginForm;
