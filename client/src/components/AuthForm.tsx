"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ApiError, login, register } from "@/lib/api";
import { useSession } from "./SessionProvider";

type Mode = "login" | "signup";

const titles: Record<Mode, string> = {
  login: "welcome back",
  signup: "create account",
};

const blurbs: Record<Mode, string> = {
  login: "sign in and pick up right where you left off.",
  signup: "no credit card, no gatekeeping, just vibes.",
};

const validate = (mode: Mode, name: string, email: string, password: string) => {
  if (mode === "signup" && !name.trim()) {
    return "name is required";
  }

  if (!email.trim()) {
    return "email is required";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return "that email looks off, check it again";
  }

  if (!password) {
    return "password is required";
  }

  if (mode === "signup" && password.length < 6) {
    return "password needs at least 6 characters";
  }

  return null;
};

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { refresh } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    const validationError = validate(
      mode,
      trimmedName,
      trimmedEmail,
      password,
    );

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        await register({ name: trimmedName, email: trimmedEmail, password });
        await login({ email: trimmedEmail, password });
        await refresh();
        router.push("/");
        router.refresh();
        return;
      }

      await login({ email: trimmedEmail, password });
      await refresh();
      router.push("/");
      router.refresh();
    } catch (err) {
      setNotice("");
      setError(
        err instanceof ApiError ? err.message : "something broke, try again",
      );
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <h1 className="font-mono text-3xl font-bold uppercase tracking-widest text-crt-ink sm:text-4xl">
          {titles[mode]}
        </h1>

        <p className="mt-3 max-w-sm font-mono text-xs leading-relaxed text-crt-dim">
          {blurbs[mode]}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 flex w-full max-w-md flex-col gap-4 border-4 border-crt-line bg-crt-panel p-5 shadow-[6px_6px_0_0_#000] sm:p-7"
      >
        {mode === "signup" ? (
          <div className="flex flex-col gap-2">
            <label
              htmlFor="name"
              className="font-mono text-[11px] font-bold uppercase tracking-wider text-crt-ink"
            >
              name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="your name"
              className="border-2 border-crt-line bg-crt-bg px-3 py-2.5 font-mono text-sm text-crt-ink outline-none placeholder:text-crt-dim/60 focus:bg-white focus:shadow-[3px_3px_0_0_#000]"
            />
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <label
            htmlFor="email"
            className="font-mono text-[11px] font-bold uppercase tracking-wider text-crt-ink"
          >
            email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="border-2 border-crt-line bg-crt-bg px-3 py-2.5 font-mono text-sm text-crt-ink outline-none placeholder:text-crt-dim/60 focus:bg-white focus:shadow-[3px_3px_0_0_#000]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="password"
            className="font-mono text-[11px] font-bold uppercase tracking-wider text-crt-ink"
          >
            password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={
              mode === "signup" ? "new-password" : "current-password"
            }
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className="border-2 border-crt-line bg-crt-bg px-3 py-2.5 font-mono text-sm text-crt-ink outline-none placeholder:text-crt-dim/60 focus:bg-white focus:shadow-[3px_3px_0_0_#000]"
          />
          {mode === "signup" ? (
            <p className="font-mono text-[10px] uppercase tracking-wider text-crt-dim">
              min 6 characters
            </p>
          ) : null}
        </div>

        {error ? (
          <div
            role="alert"
            className="flex items-start gap-2 border-2 border-crt-line bg-crt-blue/10 px-3 py-2.5"
          >
            <span className="font-mono text-xs font-bold text-crt-blue">&gt;!</span>
            <span className="font-mono text-xs leading-relaxed text-crt-ink">
              {error}
            </span>
          </div>
        ) : null}

        {notice ? (
          <div
            role="status"
            className="flex items-start gap-2 border-2 border-crt-line bg-crt-green/10 px-3 py-2.5"
          >
            <span className="font-mono text-xs font-bold text-crt-green">
              &gt;ok
            </span>
            <span className="font-mono text-xs leading-relaxed text-crt-ink">
              {notice}
            </span>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 w-full border-2 border-crt-line bg-crt-blue px-6 py-3 font-mono text-sm font-bold uppercase tracking-wider text-white shadow-[4px_4px_0_0_#000] transition-all duration-100 hover:bg-crt-green hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none disabled:translate-x-[4px] disabled:translate-y-[4px]"
        >
          {loading
            ? mode === "signup"
              ? "creating account..."
              : "logging in..."
            : mode === "signup"
              ? "sign up"
              : "login"}
        </button>
      </form>

      <p className="mt-6 text-center font-mono text-xs text-crt-dim">
        {mode === "login" ? "not a member?" : "already have an account?"}{" "}
        <Link
          href={mode === "login" ? "/signup" : "/login"}
          className="font-bold uppercase text-crt-blue underline decoration-2 underline-offset-2 transition-colors duration-100 hover:text-crt-green"
        >
          {mode === "login" ? "signup" : "login"}
        </Link>
      </p>
    </div>
  );
}

export default AuthForm;