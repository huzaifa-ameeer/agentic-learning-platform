"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, getSession, type LearningSession } from "@/lib/api";

const formatDate = (value: string) => {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "unknown date"
    : date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
};

export function SessionDetailContent() {
  const params = useParams<{ id: string }>();
  const [session, setSession] = useState<LearningSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const id = params.id;

    if (!id) {
      setLoading(false);
      setError("session not found");
      return;
    }

    getSession(id)
      .then((data) => {
        if (active) {
          setSession(data.session);
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof ApiError ? err.message : "could not load session",
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
  }, [params.id]);

  if (loading) {
    return (
      <section className="flex flex-1 items-center justify-center px-4 py-20 sm:px-6">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin border-4 border-crt-line border-t-crt-blue" />
          <p className="font-mono text-xs uppercase tracking-widest text-crt-dim">
            loading session...
          </p>
        </div>
      </section>
    );
  }

  if (error || !session) {
    return (
      <section className="flex flex-1 items-center justify-center px-4 py-20 sm:px-6">
        <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
          <div className="w-full border-4 border-crt-line bg-crt-panel p-6 shadow-[6px_6px_0_0_#000]">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-crt-blue">
              &gt;! {error ?? "session not found"}
            </p>
          </div>

          <Link
            href="/sessions"
            className="border-2 border-crt-line bg-crt-blue px-6 py-3 text-center font-mono text-sm font-bold uppercase tracking-wider text-white shadow-[4px_4px_0_0_#000] transition-all duration-100 hover:bg-crt-green hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
          >
            back to sessions
          </Link>
        </div>
      </section>
    );
  }

  const agent = session.agent;

  return (
    <section className="w-full border-t-4 border-crt-line px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <Link
          href={agent ? `/sessions?agent=${agent._id}` : "/play-area"}
          className="self-start font-mono text-xs uppercase tracking-wider text-crt-dim underline decoration-2 underline-offset-2 transition-colors duration-100 hover:text-crt-blue"
        >
          &lt; back to sessions
        </Link>

        <div className="flex w-full flex-col items-center border-4 border-crt-line bg-crt-panel p-6 text-center shadow-[6px_6px_0_0_#000] sm:p-8">
          <span className="flex h-12 w-12 items-center justify-center border-2 border-crt-line bg-crt-bg font-mono text-sm font-bold uppercase text-crt-blue">
            {agent ? agent.name.charAt(0) : "?"}
          </span>

          {agent ? (
            <span className="mt-3 max-w-full truncate border-2 border-crt-line bg-crt-bg px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-crt-dim">
              /{agent.slug}
            </span>
          ) : null}

          <h1 className="mt-3 font-mono text-2xl font-bold uppercase leading-relaxed tracking-wider text-crt-ink sm:text-3xl">
            {session.title}
          </h1>

          <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-crt-dim">
            started {formatDate(session.createdAt)}
          </p>

          {agent ? (
            <p className="mt-4 font-mono text-xs leading-relaxed text-crt-dim">
              {agent.description}
            </p>
          ) : null}
        </div>

        <p className="font-mono text-xs uppercase tracking-widest text-crt-dim">
          conversation coming soon
        </p>
      </div>
    </section>
  );
}

export default SessionDetailContent;