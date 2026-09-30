"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ApiError,
  deleteSession,
  getMySessions,
  type LearningSession,
} from "@/lib/api";

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

export function SessionsContent({ agentId }: { agentId: string }) {
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [agentName, setAgentName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

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

        setSessions(kept);

        const populated = kept.find((session) => session.agent);

        setAgentName(populated?.agent ? populated.agent.name : "");
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof ApiError ? err.message : "could not load sessions",
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [agentId]);

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
      <section className="flex flex-1 items-center justify-center px-4 py-20 sm:px-6">
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
    <section className="w-full border-t-4 border-crt-line px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-5xl">
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

          <Link
            href="/play-area"
            className="mt-1 flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-crt-dim underline decoration-2 underline-offset-2 transition-colors duration-100 hover:text-crt-blue"
          >
            <span aria-hidden="true">&lt;</span> back to agents
          </Link>

          <Link
            href={`/sessions/new?agent=${agentId}`}
            className="mt-2 border-2 border-crt-line bg-crt-blue px-6 py-3 text-center font-mono text-sm font-bold uppercase tracking-wider text-white shadow-[4px_4px_0_0_#000] transition-all duration-100 hover:bg-crt-green hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
          >
            create session
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => {
            const agent = session.agent;

            return (
              <article
                key={session._id}
                className="group flex flex-col items-center border-4 border-crt-line bg-crt-panel p-5 text-center shadow-[6px_6px_0_0_#000] transition-all duration-100 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#000]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-crt-line bg-crt-bg font-mono text-xs font-bold uppercase text-crt-blue transition-colors duration-100 group-hover:bg-crt-blue group-hover:text-white">
                  {agent ? agent.name.charAt(0) : "?"}
                </span>

                <span className="mt-3 max-w-full truncate border-2 border-crt-line bg-crt-bg px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-crt-dim">
                  {agent ? `/${agent.slug}` : "/session"}
                </span>

                <h2 className="mt-3 font-mono text-sm font-bold uppercase leading-relaxed tracking-wider text-crt-ink">
                  {session.title}
                </h2>

                {agent ? (
                  <p className="mt-2 flex-1 font-mono text-xs leading-relaxed text-crt-dim">
                    {agent.description}
                  </p>
                ) : (
                  <p className="mt-2 flex-1 font-mono text-xs leading-relaxed text-crt-dim">
                    agent no longer available
                  </p>
                )}

                <span className="mt-4 font-mono text-[10px] uppercase tracking-wider text-crt-dim">
                  {formatDate(session.updatedAt)}
                </span>

                <Link
                  href={`/sessions/${session._id}`}
                  className="mt-4 w-full border-2 border-crt-line bg-crt-bg px-4 py-2.5 text-center font-mono text-xs font-bold uppercase tracking-wider text-crt-ink shadow-[3px_3px_0_0_#000] transition-all duration-100 hover:bg-crt-blue hover:text-white hover:shadow-[1px_1px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
                >
                  open session
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default SessionsContent;