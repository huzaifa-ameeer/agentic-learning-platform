"use client";

import { useEffect, useState } from "react";
import {
  ApiError,
  createSession,
  getAgents,
  type Agent,
} from "@/lib/api";

function AgentIcon({ name }: { name: string }) {
  const slug = name.toLowerCase();

  const stroke = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "square",
  } as const;

  const common = { viewBox: "0 0 24 24", "aria-hidden": true } as const;

  if (slug.includes("code") || slug.includes("dev") || slug.includes("js")) {
    return (
      <svg {...common} className="h-6 w-6">
        <path {...stroke} d="M9 18l-5-6 5-6" />
        <path {...stroke} d="M15 6l5 6-5 6" />
      </svg>
    );
  }

  if (slug.includes("math") || slug.includes("calc")) {
    return (
      <svg {...common} className="h-6 w-6">
        <path {...stroke} d="M4 8h16M4 16h16M8 4v16M16 4v16" />
      </svg>
    );
  }

  if (slug.includes("sci") || slug.includes("bio") || slug.includes("chem")) {
    return (
      <svg {...common} className="h-6 w-6">
        <circle {...stroke} cx="12" cy="12" r="3" />
        <ellipse {...stroke} cx="12" cy="12" rx="9" ry="4" />
        <ellipse {...stroke} cx="12" cy="12" rx="9" ry="4" transform="rotate(60 12 12)" />
      </svg>
    );
  }

  if (slug.includes("lang") || slug.includes("writ") || slug.includes("eng")) {
    return (
      <svg {...common} className="h-6 w-6">
        <path {...stroke} d="M3 5h10v9H5l-2 3V5z" />
        <path {...stroke} d="M10 18h8l3 2V9h-4" />
      </svg>
    );
  }

  if (slug.includes("hist") || slug.includes("geo")) {
    return (
      <svg {...common} className="h-6 w-6">
        <circle {...stroke} cx="12" cy="12" r="9" />
        <path {...stroke} d="M3 12h18M12 3v18" />
      </svg>
    );
  }

  if (slug.includes("design") || slug.includes("art")) {
    return (
      <svg {...common} className="h-6 w-6">
        <path {...stroke} d="M12 3l9 7-9 7-9-7 9-7z" />
        <path {...stroke} d="M3 17l9 5 9-5" />
      </svg>
    );
  }

  return (
    <svg {...common} className="h-6 w-6">
      <rect {...stroke} x="4" y="6" width="16" height="12" />
      <path {...stroke} d="M12 3v3M12 18v3M4 12h-2M22 12h-2" />
    </svg>
  );
}

export function PlayAreaContent() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState("");
  const [notice, setNotice] = useState("");

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

  const handleStart = async (agent: Agent) => {
    if (pending) {
      return;
    }

    setPending(agent._id);
    setNotice("");
    setError("");

    try {
      const result = await createSession(agent._id);
      setNotice(
        `session started with ${agent.name.toLowerCase()} (${result.session._id})`,
      );
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "could not start session",
      );
    } finally {
      setPending("");
    }
  };

  return (
    <section className="w-full border-t-4 border-crt-line px-4 py-14 sm:px-6 sm:py-20">
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

        {notice ? (
          <div
            role="status"
            className="mx-auto mt-8 flex max-w-2xl items-center justify-center gap-2 border-2 border-crt-line bg-crt-green/10 px-4 py-3 text-center"
          >
            <span className="font-mono text-xs font-bold text-crt-green">
              &gt;ok
            </span>
            <span className="font-mono text-xs leading-relaxed text-crt-ink">
              {notice}
            </span>
          </div>
        ) : null}

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
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-crt-line bg-crt-bg text-crt-blue transition-colors duration-100 group-hover:bg-crt-blue group-hover:text-white">
                    <AgentIcon name={agent.name} />
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

                  <button
                    type="button"
                    onClick={() => handleStart(agent)}
                    disabled={Boolean(pending)}
                    className="mt-5 w-full border-2 border-crt-line bg-crt-panel px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-crt-ink shadow-[3px_3px_0_0_#000] transition-all duration-100 hover:bg-crt-blue hover:text-white hover:shadow-[1px_1px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {pending === agent._id ? "starting..." : "start session"}
                  </button>
                </article>
              ))}
            </div>

            <p className="mt-12 text-center font-mono text-xs uppercase tracking-widest text-crt-dim">
              select one, your choice. start session
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