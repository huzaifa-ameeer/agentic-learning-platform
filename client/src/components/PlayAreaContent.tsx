"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiError, getAgents, type Agent } from "@/lib/api";
import { AgentGlyph } from "./AgentGlyph";

export function PlayAreaContent() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getAgents()
      .then((data) => {
        if (active) {
          setAgents(data.agents);
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof ApiError ? err.message : "could not load agents",
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
  }, []);

  return (
    <section className="w-full border-t-4 border-crt-line px-4 py-10 sm:px-6 sm:py-15">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex items-center gap-2 border-2 border-crt-line bg-crt-panel px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-crt-dim">
            <span className="h-2 w-2 animate-pulse rounded-full bg-crt-green" />
            play_area.exe
          </span>

          <h1 className="font-mono text-3xl font-bold uppercase tracking-widest text-crt-ink sm:text-4xl">
            pick your mentor
          </h1>

          <p className="max-w-md font-mono text-xs leading-relaxed text-crt-dim">
            every agent below is a specialist with its own system prompt. choose
            one, hit start, and let it cook.
          </p>
        </div>

        {loading ? (
          <div className="mt-12 flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin border-4 border-crt-line border-t-crt-blue" />
            <p className="font-mono text-xs uppercase tracking-widest text-crt-dim">
              loading agents...
            </p>
          </div>
        ) : error && agents.length === 0 ? (
          <div className="mx-auto mt-12 max-w-lg border-4 border-crt-line bg-crt-panel p-6 text-center shadow-[6px_6px_0_0_#000]">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-crt-blue">
              &gt;! {error}
            </p>
          </div>
        ) : agents.length === 0 ? (
          <div className="mx-auto mt-12 max-w-lg border-4 border-crt-line bg-crt-panel p-6 text-center shadow-[6px_6px_0_0_#000]">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-crt-ink">
              no agents available
            </p>
            <p className="mt-2 font-mono text-xs text-crt-dim">
              ask an admin to create one, then reload this page.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {agents.map((agent) => (
                <article
                  key={agent._id}
                  className="group flex flex-col items-center border-4 border-crt-line bg-crt-panel p-5 text-center shadow-[6px_6px_0_0_#000] transition-all duration-100 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#000]"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-crt-line bg-crt-bg transition-colors duration-100 group-hover:bg-crt-blue group-hover:text-white">
                    <AgentGlyph agent={agent} />
                  </span>

                  <span className="mt-3 max-w-full truncate border-2 border-crt-line bg-crt-bg px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-crt-dim">
                    /{agent.slug}
                  </span>

                  <h2 className="mt-3 font-mono text-lg font-bold uppercase tracking-wider text-crt-ink">
                    {agent.name}
                  </h2>

                  <p className="mt-2 flex-1 font-mono text-xs leading-relaxed text-crt-dim">
                    {agent.description}
                  </p>

                  <Link
                    href={`/sessions?agent=${agent._id}`}
                    className="mt-5 w-full border-2 border-crt-line bg-crt-panel px-4 py-2.5 text-center font-mono text-xs font-bold uppercase tracking-wider text-crt-ink shadow-[3px_3px_0_0_#000] transition-all duration-100 hover:bg-crt-blue hover:text-white hover:shadow-[1px_1px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
                  >
                    chat with me!
                  </Link>
                </article>
              ))}
            </div>

            <p className="mt-12 text-center font-mono text-xs uppercase tracking-widest text-crt-dim">
              pick a mentor, then chat. each one keeps its own sessions.
            </p>

            {error ? (
              <div
                role="alert"
                className="mx-auto mt-4 flex max-w-2xl items-center justify-center gap-2 border-2 border-crt-line bg-crt-blue/10 px-4 py-3 text-center"
              >
                <span className="font-mono text-xs font-bold text-crt-blue">
                  &gt;!
                </span>
                <span className="font-mono text-xs leading-relaxed text-crt-ink">
                  {error}
                </span>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}

export default PlayAreaContent;