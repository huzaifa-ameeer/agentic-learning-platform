"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ApiError,
  deleteSession,
  getMySessions,
  renameSession,
  type LearningSession,
} from "@/lib/api";

const NO_SESSIONS: LearningSession[] = [];

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "unknown date";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

type Loaded = {
  agentId: string;
  sessions: LearningSession[];
  agentName: string;
};

export function SessionsContent({ agentId }: { agentId: string }) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [loadError, setLoadError] = useState<{
    agentId: string;
    message: string;
  } | null>(null);
  const [editingId, setEditingId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [confirmId, setConfirmId] = useState("");
  const [busyId, setBusyId] = useState("");
  const [actionError, setActionError] = useState("");

  const loadedHere = loaded?.agentId === agentId ? loaded : null;
  const sessions = loadedHere?.sessions ?? NO_SESSIONS;
  const agentName = loadedHere?.agentName ?? "";
  const error =
    loadError?.agentId === agentId ? loadError.message : "";
  const loading = !loadedHere && error === "";

  useEffect(() => {
    let active = true;

    getMySessions(agentId)
      .then(async (data) => {
        if (!active) {
          return;
        }

        const orphans = data.sessions.filter((session) => !session.agent);

        if (orphans.length > 0) {
          await Promise.allSettled(
            orphans.map((session) => deleteSession(session._id)),
          );
        }

        const kept = data.sessions.filter((session) => session.agent);

        const populated = kept.find((session) => session.agent);

        if (!active) {
          return;
        }

        setLoaded({
          agentId,
          sessions: kept,
          agentName: populated?.agent ? populated.agent.name : "",
        });
      })
      .catch((err) => {
        if (active) {
          setLoadError({
            agentId,
            message:
              err instanceof ApiError ? err.message : "could not load sessions",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [agentId]);

  const startEdit = (session: LearningSession) => {
    setActionError("");
    setConfirmId("");
    setEditingId(session._id);
    setEditTitle(session.title);
  };

  const cancelEdit = () => {
    setEditingId("");
    setEditTitle("");
  };

  const saveEdit = async (sessionId: string) => {
    const title = editTitle.trim();

    if (!title) {
      setActionError("title cannot be empty");
      return;
    }

    setBusyId(sessionId);
    setActionError("");

    try {
      const result = await renameSession(sessionId, title);

      setLoaded((current) =>
        current
          ? {
              ...current,
              sessions: current.sessions.map((session) =>
                session._id === sessionId ? result.session : session,
              ),
            }
          : current,
      );

      cancelEdit();
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "could not rename session",
      );
    } finally {
      setBusyId("");
    }
  };

  const removeSession = async (sessionId: string) => {
    setBusyId(sessionId);
    setActionError("");

    try {
      await deleteSession(sessionId);

      setLoaded((current) =>
        current
          ? {
              ...current,
              sessions: current.sessions.filter(
                (session) => session._id !== sessionId,
              ),
            }
          : current,
      );

      setConfirmId("");
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "could not delete session",
      );
    } finally {
      setBusyId("");
    }
  };

  if (loading) {
    return (
      <section className="flex flex-1 items-center justify-center px-4 py-20 sm:px-6">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin border-4 border-crt-line border-t-crt-blue" />
          <p className="font-mono text-xs uppercase tracking-widest text-crt-dim">
            loading sessions...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex flex-1 items-center justify-center px-4 py-20 sm:px-6">
        <div className="w-full max-w-md border-4 border-crt-line bg-crt-panel p-6 text-center shadow-[6px_6px_0_0_#000]">
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-crt-blue">
            &gt;! {error}
          </p>
        </div>
      </section>
    );
  }

  if (sessions.length === 0) {
    return (
      <section className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center border-4 border-crt-line bg-crt-panel text-crt-dim shadow-[4px_4px_0_0_#000]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="square"
              className="h-7 w-7"
              aria-hidden="true"
            >
              <path d="M4 5h16v11H9l-5 4V5z" />
              <path d="M9 10h6" />
            </svg>
          </div>

          <div>
            <h1 className="font-mono text-2xl font-bold uppercase tracking-widest text-crt-ink">
              no session found
            </h1>
            <p className="mt-2 font-mono text-xs leading-relaxed text-crt-dim">
              {agentName
                ? `you have not talked to ${agentName.toLowerCase()} yet.`
                : "nothing here yet. start the first conversation."}
            </p>
          </div>

          <Link
            href={`/sessions/new?agent=${agentId}`}
            className="border-2 border-crt-line bg-crt-blue px-6 py-3 text-center font-mono text-sm font-bold uppercase tracking-wider text-white shadow-[4px_4px_0_0_#000] transition-all duration-100 hover:bg-crt-green hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
          >
            create session
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="flex w-full flex-1 items-center border-t-4 border-crt-line px-4 py-10 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex items-center gap-2 border-2 border-crt-line bg-crt-panel px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-crt-dim">
            <span className="h-2 w-2 animate-pulse rounded-full bg-crt-green" />
            sessions.db
          </span>

          <h1 className="font-mono text-3xl font-bold uppercase tracking-widest text-crt-ink sm:text-4xl">
            {agentName ? `${agentName} sessions` : "sessions"}
          </h1>

          <p className="max-w-md font-mono text-xs leading-relaxed text-crt-dim">
            {sessions.length} conversation{sessions.length === 1 ? "" : "s"} with
            this mentor. pick one to jump back in.
          </p>

          <div className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
            <Link
              href="/play-area"
              className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-crt-dim underline decoration-2 underline-offset-2 transition-colors duration-100 hover:text-crt-blue"
            >
              <span aria-hidden="true">&lt;</span> back to agents
            </Link>

            <Link
              href={`/sessions/new?agent=${agentId}`}
              className="border-2 border-crt-line bg-crt-blue px-6 py-3 text-center font-mono text-sm font-bold uppercase tracking-wider text-white shadow-[4px_4px_0_0_#000] transition-all duration-100 hover:bg-crt-green hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
            >
              create session
            </Link>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => {
            const agent = session.agent;
            const agentName = typeof agent?.name === "string" ? agent.name : "";
            const agentSlug = typeof agent?.slug === "string" ? agent.slug : "";
            const agentDescription =
              typeof agent?.description === "string" ? agent.description : "";
            const editing = editingId === session._id;
            const confirming = confirmId === session._id;
            const busy = busyId === session._id;

            return (
              <article
                key={session._id}
                className="group relative flex flex-col items-center border-4 border-crt-line bg-crt-panel p-5 text-center shadow-[6px_6px_0_0_#000] transition-all duration-100 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#000]"
              >
                {!editing ? (
                  <div className="absolute right-2 top-2 flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => startEdit(session)}
                      disabled={busy}
                      aria-label={`rename ${session.title}`}
                      title="rename session"
                      className="flex h-7 w-7 items-center justify-center border-2 border-crt-line bg-crt-bg text-crt-ink transition-colors duration-100 hover:bg-crt-ink hover:text-crt-panel disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.4}
                        strokeLinecap="square"
                        strokeLinejoin="miter"
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      >
                        <path d="M4 20h4L19 9l-4-4L4 16v4z" />
                        <path d="M14 6l4 4" />
                      </svg>
                    </button>

                    {confirming ? (
                      <span className="flex items-center gap-1 border-2 border-crt-line bg-crt-panel px-1.5">
                        <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-crt-ink">
                          sure?
                        </span>
                        <button
                          type="button"
                          onClick={() => removeSession(session._id)}
                          disabled={busy}
                          className="font-mono text-[10px] font-bold uppercase text-crt-green underline decoration-2 underline-offset-2 disabled:opacity-50"
                        >
                          yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmId("")}
                          disabled={busy}
                          className="font-mono text-[10px] font-bold uppercase text-crt-dim underline decoration-2 underline-offset-2 disabled:opacity-50"
                        >
                          no
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setActionError("");
                          setEditingId("");
                          setConfirmId(session._id);
                        }}
                        disabled={busy}
                        aria-label={`delete ${session.title}`}
                        title="delete session"
                        className="flex h-7 w-7 items-center justify-center border-2 border-crt-line bg-crt-bg text-red-600 transition-colors duration-100 hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.4}
                          strokeLinecap="square"
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        >
                          <path d="M4 7h16" />
                          <path d="M9 7V5h6v2" />
                          <path d="M6 7l1 13h10l1-13" />
                          <path d="M10 11v6M14 11v6" />
                        </svg>
                      </button>
                    )}
                  </div>
                ) : null}

                <span className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-crt-line bg-crt-bg font-mono text-xs font-bold uppercase text-crt-blue transition-colors duration-100 group-hover:bg-crt-blue group-hover:text-white">
                  {agentName ? agentName.charAt(0) : "?"}
                </span>

                <span className="mt-3 max-w-full truncate border-2 border-crt-line bg-crt-bg px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-crt-dim">
                  {agentSlug ? `/${agentSlug}` : "/session"}
                </span>

                {editing ? (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      saveEdit(session._id);
                    }}
                    className="mt-3 flex w-full flex-col gap-2"
                  >
                    <label
                      htmlFor={`title-${session._id}`}
                      className="sr-only"
                    >
                      session title
                    </label>
                    <input
                      id={`title-${session._id}`}
                      name="title"
                      type="text"
                      autoFocus
                      value={editTitle}
                      onChange={(event) => setEditTitle(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") {
                          cancelEdit();
                        }
                      }}
                      className="w-full border-2 border-crt-line bg-crt-bg px-2 py-1.5 text-center font-mono text-sm text-crt-ink outline-none focus:bg-white focus:shadow-[3px_3px_0_0_#000]"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={busy}
                        className="flex-1 border-2 border-crt-line bg-crt-blue px-2 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white transition-colors duration-100 hover:bg-crt-green disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {busy ? "saving..." : "save"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={busy}
                        className="flex-1 border-2 border-crt-line bg-crt-bg px-2 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-crt-ink transition-colors duration-100 hover:bg-crt-ink hover:text-crt-panel disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <h2 className="mt-3 font-mono text-sm font-bold uppercase leading-relaxed tracking-wider text-crt-ink">
                    {session.title}
                  </h2>
                )}

                {agentDescription ? (
                  <p className="mt-2 flex-1 font-mono text-xs leading-relaxed text-crt-dim">
                    {agentDescription}
                  </p>
                ) : (
                  <p className="mt-2 flex-1 font-mono text-xs leading-relaxed text-crt-dim">
                    agent no longer available
                  </p>
                )}

                <span className="mt-4 font-mono text-[10px] uppercase tracking-wider text-crt-dim">
                  {formatDate(session.updatedAt)}
                </span>

                {confirming ? (
                  <span className="mt-4 w-full border-2 border-crt-line bg-crt-blue/10 px-3 py-2.5 font-mono text-[10px] uppercase leading-relaxed tracking-wider text-crt-ink">
                    this wipes the chat forever. no undo.
                  </span>
                ) : (
                  <Link
                    href={`/sessions/${session._id}`}
                    className="mt-4 w-full border-2 border-crt-line bg-crt-bg px-4 py-2.5 text-center font-mono text-xs font-bold uppercase tracking-wider text-crt-ink shadow-[3px_3px_0_0_#000] transition-all duration-100 hover:bg-crt-blue hover:text-white hover:shadow-[1px_1px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
                  >
                    open session
                  </Link>
                )}
              </article>
            );
          })}
        </div>

        {actionError ? (
          <div
            role="alert"
            className="mx-auto mt-6 flex max-w-xl items-center justify-center gap-2 border-2 border-crt-line bg-crt-blue/10 px-4 py-3 text-center"
          >
            <span className="font-mono text-xs font-bold text-crt-blue">
              &gt;!
            </span>
            <span className="font-mono text-xs leading-relaxed text-crt-ink">
              {actionError}
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default SessionsContent;