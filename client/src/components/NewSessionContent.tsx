"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ApiError, createSession } from "@/lib/api";

const DEFAULT_TITLE = "New Learning Session";

export function NewSessionContent({ agentId }: { agentId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError("title cannot be empty");
      return;
    }

    setSaving(true);

    try {
      const result = await createSession(agentId, trimmedTitle);
      router.push(`/sessions/${result.session._id}`);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "could not create session",
      );
      setSaving(false);
    }
  };

  return (
    <section className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex w-full max-w-md flex-col items-center">
        <div className="flex w-full flex-col items-center text-center">
          <span className="border-2 border-crt-line bg-crt-panel px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-crt-dim">
            new_session.exe
          </span>

          <h1 className="mt-6 font-mono text-3xl font-bold uppercase tracking-widest text-crt-ink sm:text-4xl">
            new session
          </h1>

          <p className="mt-3 max-w-sm font-mono text-xs leading-relaxed text-crt-dim">
            name it something you will actually remember. or just leave the
            default.
          </p>

          <Link
            href="/play-area"
            className="mt-4 flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-crt-dim underline decoration-2 underline-offset-2 transition-colors duration-100 hover:text-crt-blue"
          >
            <span aria-hidden="true">&lt;</span> back to agents
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 flex w-full flex-col gap-4 border-4 border-crt-line bg-crt-panel p-5 shadow-[6px_6px_0_0_#000] sm:p-7"
        >
          <div className="flex flex-col gap-2">
            <label
              htmlFor="title"
              className="font-mono text-[11px] font-bold uppercase tracking-wider text-crt-ink"
            >
              title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={DEFAULT_TITLE}
              className="border-2 border-crt-line bg-crt-bg px-3 py-2.5 font-mono text-sm text-crt-ink outline-none placeholder:text-crt-dim/60 focus:bg-white focus:shadow-[3px_3px_0_0_#000]"
            />
          </div>

          {error ? (
            <div
              role="alert"
              className="flex items-center justify-center gap-2 border-2 border-crt-line bg-crt-blue/10 px-3 py-2.5 text-center"
            >
              <span className="font-mono text-xs font-bold text-crt-blue">
                &gt;!
              </span>
              <span className="font-mono text-xs leading-relaxed text-crt-ink">
                {error}
              </span>
            </div>
          ) : null}

          <button
            type="submit"
            className="mt-1 w-full border-2 border-crt-line bg-crt-blue px-6 py-3 font-mono text-sm font-bold uppercase tracking-wider text-white shadow-[4px_4px_0_0_#000] transition-all duration-100 hover:bg-crt-green hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
          >
            {saving ? "creating..." : "create session"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => router.back()}
          className="mt-6 font-mono text-xs uppercase tracking-wider text-crt-dim underline decoration-2 underline-offset-2 transition-colors duration-100 hover:text-crt-blue"
        >
          cancel
        </button>
      </div>
    </section>
  );
}

export default NewSessionContent;