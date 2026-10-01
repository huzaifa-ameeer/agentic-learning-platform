"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiError,
  createAgent,
  deleteAgent,
  getAgent,
  getAgents,
  logout,
  regenerateAgentIcon,
  updateAgent,
  type Agent,
} from "@/lib/api";
import { AgentGlyph } from "./AgentGlyph";

type View = "create" | "edit" | "delete";

const NAV: { id: View; label: string; hint: string }[] = [
  { id: "create", label: "create agent", hint: "add a new mentor" },
  { id: "edit", label: "edit agent", hint: "tweak an existing one" },
  { id: "delete", label: "delete agent", hint: "remove it for good" },
];

const EMPTY_FORM = {
  name: "",
  slug: "",
  description: "",
  systemPrompt: "",
  isActive: true,
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const inputClass =
  "w-full border-2 border-crt-line bg-crt-bg px-3 py-2.5 font-mono text-sm text-crt-ink outline-none transition-colors duration-100 placeholder:text-crt-dim/60 focus:border-crt-blue focus:bg-crt-blue/10";

const labelClass =
  "font-mono text-[10px] font-bold uppercase tracking-wider text-crt-dim";

const panelClass = "border-4 border-crt-line bg-crt-panel p-5 shadow-[6px_6px_0_0_#000] sm:p-6";

const buttonBase =
  "border-2 border-crt-line px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider shadow-[3px_3px_0_0_#000] transition-all duration-100 hover:shadow-[1px_1px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] disabled:cursor-not-allowed disabled:opacity-60";

const ghostButton = `${buttonBase} bg-crt-panel text-crt-blue hover:bg-crt-blue hover:text-white`;

const blueButton = `${buttonBase} bg-crt-blue text-white hover:bg-crt-green`;

const greenButton = `${buttonBase} bg-crt-green text-white hover:bg-crt-blue`;

const redButton = `${buttonBase} bg-crt-red text-white hover:bg-crt-blue`;

const noticeClass =
  "border-2 px-3 py-2 font-mono text-xs leading-relaxed";

function Banner({
  tone,
  text,
}: {
  tone: "ok" | "bad";
  text: string;
}) {
  return (
    <p
      role="status"
      className={`${noticeClass} ${
        tone === "ok"
          ? "border-crt-green bg-crt-green/10 text-crt-green"
          : "border-crt-blue bg-crt-blue/10 text-crt-blue"
      }`}
    >
      {tone === "ok" ? ">" : ">!"} {text}
    </p>
  );
}

export function AdminPanel() {
  const router = useRouter();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [view, setView] = useState<View>("create");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [okMessage, setOkMessage] = useState("");

  const [editId, setEditId] = useState("");
  const [loadingEdit, setLoadingEdit] = useState(false);

  const [deleteId, setDeleteId] = useState("");
  const [confirmSlug, setConfirmSlug] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Agent | null>(null);

  const mainRef = useRef<HTMLElement>(null);

  const load = useCallback(async () => {
    try {
      const data = await getAgents();
      setAgents(data.agents);
      setLoadError("");
    } catch (err) {
      setLoadError(
        err instanceof ApiError ? err.message : "could not load agents",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // the server upgrades new icons in the background, so give it a moment
  const loadSoon = useCallback(() => {
    setTimeout(() => {
      void load();
    }, 4000);
  }, [load]);

  useEffect(() => {
    let active = true;

    getAgents()
      .then((data) => {
        if (active) {
          setAgents(data.agents);
          setLoadError("");
        }
      })
      .catch((err) => {
        if (active) {
          setLoadError(
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

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [view]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!sidebarOpen) {
      return;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen]);

  const pickView = (next: View) => {
    setView(next);
    setSidebarOpen(false);
    setFormError("");
    setOkMessage("");
  };

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setSlugTouched(false);
  };

  const updateField =
    (key: keyof typeof EMPTY_FORM) =>
    (value: string | boolean) => {
      setForm((prev) => {
        const next = { ...prev, [key]: value } as typeof EMPTY_FORM;

        if (key === "name" && !slugTouched) {
          next.slug = slugify(String(value));
        }

        if (key === "slug") {
          next.slug = slugify(String(value));
        }

        return next;
      });
    };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    setFormError("");
    setOkMessage("");

    if (!form.name.trim() || !form.description.trim() || !form.systemPrompt.trim()) {
      setFormError("name, description and system prompt are required");
      return;
    }

    setSaving(true);

    try {
      const data = await createAgent({
        name: form.name.trim(),
        slug: form.slug.trim() || slugify(form.name),
        description: form.description.trim(),
        systemPrompt: form.systemPrompt.trim(),
      });

      setOkMessage(
        `created ${data.agent.name} (/${data.agent.slug}). icon will upgrade itself in a moment.`,
      );
      resetForm();
      await load();
      loadSoon();
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "could not create the agent",
      );
    } finally {
      setSaving(false);
    }
  };

  const beginEdit = async (agent: Agent) => {
    setEditId(agent._id);
    setLoadingEdit(true);
    setFormError("");
    setOkMessage("");

    try {
      const data = await getAgent(agent._id);

      setForm({
        name: data.agent.name,
        slug: data.agent.slug,
        description: data.agent.description,
        systemPrompt: data.agent.systemPrompt ?? "",
        isActive: data.agent.isActive,
      });
      setSlugTouched(true);
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "could not load that agent",
      );
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (saving || !editId) {
      return;
    }

    setFormError("");
    setOkMessage("");

    setSaving(true);

    try {
      const data = await updateAgent(editId, {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        systemPrompt: form.systemPrompt.trim(),
        isActive: form.isActive,
      });

      setOkMessage(`saved ${data.agent.name}`);
      await load();
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "could not save the agent",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerateIcon = async () => {
    if (!editId || saving) {
      return;
    }

    setSaving(true);
    setFormError("");
    setOkMessage("");

    try {
      const data = await regenerateAgentIcon(editId);

      setOkMessage(
        `icon rolled: ${data.agent.icon}${
          data.agent.iconSource === "ai" ? " (ai)" : " (fallback)"
        }`,
      );
      await load();
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "could not roll the icon",
      );
    } finally {
      setSaving(false);
    }
  };

  const beginDelete = (agent: Agent) => {
    setPendingDelete(agent);
    setConfirmSlug("");
    setFormError("");
    setOkMessage("");
  };

  const handleDelete = async () => {
    if (!pendingDelete || deleting) {
      return;
    }

    setFormError("");

    if (confirmSlug.trim() !== pendingDelete.slug) {
      setFormError(`type /${pendingDelete.slug} exactly to confirm`);
      return;
    }

    setDeleting(true);

    try {
      const data = await deleteAgent(pendingDelete._id);

      setOkMessage(
        `deleted ${pendingDelete.name} and ${data.deletedSessions} linked session${
          data.deletedSessions === 1 ? "" : "s"
        }`,
      );
      setPendingDelete(null);
      setConfirmSlug("");
      await load();
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "could not delete the agent",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // drop local state anyway
    }

    router.push("/admin/login");
    router.refresh();
  };

  const selectedEditAgent = agents.find((agent) => agent._id === editId) ?? null;
  const selectedDeleteAgent =
    agents.find((agent) => agent._id === deleteId) ?? null;

  const renderFormFields = (idPrefix: string) => (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className={labelClass}>name</span>
          <input
            id={`${idPrefix}-name`}
            value={form.name}
            onChange={(event) => updateField("name")(event.target.value)}
            placeholder="Code Sage"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className={labelClass}>slug</span>
          <input
            id={`${idPrefix}-slug`}
            value={form.slug}
            onChange={(event) => {
              setSlugTouched(true);
              updateField("slug")(event.target.value);
            }}
            placeholder="code-sage"
            className={inputClass}
          />
          <span className="font-mono text-[10px] text-crt-dim">
            auto-fills from the name until you edit it. lowercase letters,
            numbers and dashes only.
          </span>
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className={labelClass}>description</span>
        <textarea
          id={`${idPrefix}-description`}
          rows={3}
          value={form.description}
          onChange={(event) => updateField("description")(event.target.value)}
          placeholder="one or two lines shown on the agent card."
          className={`${inputClass} resize-y`}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className={labelClass}>system prompt</span>
        <textarea
          id={`${idPrefix}-system-prompt`}
          rows={10}
          value={form.systemPrompt}
          onChange={(event) =>
            updateField("systemPrompt")(event.target.value)
          }
          placeholder="you are a patient mentor who explains hard ideas with small concrete examples..."
          className={`${inputClass} resize-y leading-relaxed`}
        />
        <span className="font-mono text-[10px] text-crt-dim">
          this is the only field the model reads as its own instructions.
        </span>
      </label>
    </>
  );

  return (
    <div className="flex w-full flex-1 flex-col lg:flex-row">
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        aria-label="open console menu"
        className="sticky top-4 z-30 mx-4 mt-4 flex w-fit items-center gap-2 border-2 border-crt-line bg-crt-panel px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-crt-ink shadow-[3px_3px_0_0_#000] transition-all duration-100 hover:bg-crt-blue hover:text-white active:shadow-none lg:hidden"
      >
        <span className="flex flex-col gap-[3px]">
          <span className="block h-[3px] w-4 bg-current" />
          <span className="block h-[3px] w-4 bg-current" />
          <span className="block h-[3px] w-4 bg-current" />
        </span>
        menu
      </button>

      <div
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-30 bg-black/60 transition-opacity duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        aria-label="console menu"
        className={`fixed inset-y-0 left-0 z-40 flex w-72 shrink-0 flex-col border-r-4 border-crt-line bg-crt-bg transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:z-10 lg:h-screen lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b-4 border-crt-line px-4 py-4">
          <div className="min-w-0">
            <p className="font-mono text-sm font-bold uppercase tracking-widest text-crt-blue">
              mentor ops
            </p>
            <p className="truncate font-mono text-[10px] uppercase tracking-wider text-crt-dim">
              admin console
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="close console menu"
            className="flex h-8 w-8 items-center justify-center border-2 border-crt-line bg-crt-panel font-mono text-xs text-crt-ink transition-colors duration-100 hover:bg-crt-blue hover:text-white lg:hidden"
          >
            x
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <p className={labelClass}>agents</p>

          <ul className="mt-3 flex flex-col gap-3">
            {NAV.map((item) => {
              const active = view === item.id;

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => pickView(item.id)}
                    aria-current={active ? "page" : undefined}
                    className={`flex w-full flex-col items-start gap-1 border-2 px-3 py-2.5 text-left transition-all duration-100 ${
                      active
                        ? "border-crt-blue bg-crt-blue text-white shadow-[3px_3px_0_0_#000]"
                        : "border-crt-line bg-crt-panel text-crt-ink hover:bg-crt-blue hover:text-white"
                    }`}
                  >
                    <span className="font-mono text-xs font-bold uppercase tracking-wider">
                      {item.label}
                    </span>
                    <span
                      className={`font-mono text-[10px] ${
                        active ? "text-white/80" : "text-crt-dim"
                      }`}
                    >
                      {item.hint}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <p className={`${labelClass} mt-6`}>links</p>

          <ul className="mt-3 flex flex-col gap-2">
            <li>
              <Link
                href="/play-area"
                className="block border-2 border-crt-line bg-crt-panel px-3 py-2 text-center font-mono text-[11px] font-bold uppercase tracking-wider text-crt-ink transition-all duration-100 hover:bg-crt-blue hover:text-white"
              >
                view play area
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full border-2 border-crt-line bg-crt-panel px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-crt-ink transition-all duration-100 hover:bg-crt-blue hover:text-white"
              >
                sign out
              </button>
            </li>
          </ul>
        </nav>

        <div className="border-t-4 border-crt-line px-4 py-3">
          <p className="font-mono text-[10px] uppercase leading-relaxed tracking-wider text-crt-dim">
            {agents.length} agent{agents.length === 1 ? "" : "s"} registered
          </p>
        </div>
      </aside>

      <main
        ref={mainRef}
        className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:max-h-screen lg:overflow-y-auto lg:py-10"
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
          <header className="flex flex-col gap-2 border-b-4 border-crt-line pb-4">
            <span className="flex w-fit items-center gap-2 border-2 border-crt-line bg-crt-panel px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-crt-dim">
              <span className="h-2 w-2 animate-pulse rounded-full bg-crt-green" />
              {view}_agent.exe
            </span>

            <h1 className="font-mono text-2xl font-bold uppercase tracking-widest text-crt-ink sm:text-3xl">
              {view} agent
            </h1>

            <p className="font-mono text-xs leading-relaxed text-crt-dim">
              {view === "create"
                ? "name, description, slug and the system prompt. the icon gets picked automatically."
                : view === "edit"
                  ? "load an agent, change what you need, save. the icon stays unless you roll it."
                  : "removing an agent also removes every session that points at it."}
            </p>
          </header>

          {loadError ? <Banner tone="bad" text={loadError} /> : null}
          {okMessage ? <Banner tone="ok" text={okMessage} /> : null}

          {loading ? (
            <div className="flex items-center gap-3 border-4 border-crt-line bg-crt-panel p-6">
              <span className="h-8 w-8 animate-spin border-4 border-crt-line border-t-crt-blue" />
              <span className="font-mono text-xs uppercase tracking-widest text-crt-dim">
                loading agents...
              </span>
            </div>
          ) : null}

          {view === "create" ? (
            <form onSubmit={handleCreate} className={`${panelClass} flex flex-col gap-5`}>
              {renderFormFields("create")}

              {formError ? <Banner tone="bad" text={formError} /> : null}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className={greenButton}
                >
                  {saving ? "creating..." : "create agent"}
                </button>

                <button type="button" onClick={resetForm} className={ghostButton}>
                  clear
                </button>
              </div>
            </form>
          ) : null}

          {view === "edit" ? (
            <div className="flex flex-col gap-5">
              <div className={`${panelClass} flex flex-col gap-4`}>
                <p className={labelClass}>pick an agent</p>

                {agents.length === 0 ? (
                  <p className="font-mono text-xs text-crt-dim">
                    no agents yet. create one first.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {agents.map((agent) => {
                      const active = agent._id === editId;

                      return (
                        <li key={agent._id}>
                          <button
                            type="button"
                            onClick={() => beginEdit(agent)}
                            disabled={loadingEdit}
                            className={`flex w-full items-center gap-3 border-2 px-3 py-2.5 text-left transition-all duration-100 ${
                              active
                                ? "border-crt-blue bg-crt-blue text-white shadow-[3px_3px_0_0_#000]"
                                : "border-crt-line bg-crt-bg hover:border-crt-blue"
                            }`}
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-current">
                              <AgentGlyph
                                agent={agent}
                                className="h-4 w-4"
                                accentClassName="text-current"
                              />
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-mono text-xs font-bold uppercase tracking-wider">
                                {agent.name}
                              </span>
                              <span
                                className={`block truncate font-mono text-[10px] ${
                                  active ? "text-white/80" : "text-crt-dim"
                                }`}
                              >
                                /{agent.slug}
                                {agent.isActive ? "" : " (inactive)"}
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {loadingEdit ? (
                <div className={`${panelClass} flex items-center gap-3`}>
                  <span className="h-6 w-6 animate-spin border-4 border-crt-line border-t-crt-blue" />
                  <span className="font-mono text-xs uppercase tracking-widest text-crt-dim">
                    loading...
                  </span>
                </div>
              ) : null}

              {!loadingEdit && selectedEditAgent ? (
                <form
                  onSubmit={handleUpdate}
                  className={`${panelClass} flex flex-col gap-5`}
                >
                  <div className="flex items-center gap-3 border-b-4 border-crt-line pb-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-crt-line bg-crt-bg">
                      <AgentGlyph agent={selectedEditAgent} />
                    </span>

                    <div className="min-w-0">
                      <p className="truncate font-mono text-sm font-bold uppercase tracking-wider text-crt-ink">
                        {selectedEditAgent.name}
                      </p>
                      <p className="truncate font-mono text-[10px] uppercase tracking-wider text-crt-dim">
                        icon {selectedEditAgent.icon} /{" "}
                        {selectedEditAgent.iconSource}
                      </p>
                    </div>
                  </div>

                  {renderFormFields("edit")}

                  <label className="flex items-center gap-3 border-2 border-crt-line bg-crt-bg px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(event) =>
                        updateField("isActive")(event.target.checked)
                      }
                      className="h-4 w-4 accent-crt-green"
                    />
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-crt-ink">
                      active (visible in the play area)
                    </span>
                  </label>

                  {formError ? <Banner tone="bad" text={formError} /> : null}

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className={blueButton}
                    >
                      {saving ? "saving..." : "save changes"}
                    </button>

                    <button
                      type="button"
                      onClick={handleRegenerateIcon}
                      disabled={saving}
                      className={ghostButton}
                    >
                      roll icon
                    </button>
                  </div>
                </form>
              ) : null}

              {!loadingEdit && !selectedEditAgent ? (
                <div className={`${panelClass} text-center`}>
                  <p className="font-mono text-xs uppercase tracking-widest text-crt-dim">
                    select an agent above to edit it
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}

          {view === "delete" ? (
            <div className="flex flex-col gap-5">
              <div className={`${panelClass} flex flex-col gap-4`}>
                <p className={labelClass}>pick an agent to remove</p>

                {agents.length === 0 ? (
                  <p className="font-mono text-xs text-crt-dim">
                    no agents to delete.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {agents.map((agent) => {
                      const active = agent._id === deleteId;

                      return (
                        <li key={agent._id}>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteId(agent._id);
                              setPendingDelete(null);
                              setFormError("");
                              setOkMessage("");
                            }}
                            className={`flex w-full items-center gap-3 border-2 px-3 py-2.5 text-left transition-all duration-100 ${
                              active
                                ? "border-crt-blue bg-crt-blue text-white shadow-[3px_3px_0_0_#000]"
                                : "border-crt-line bg-crt-bg hover:border-crt-blue"
                            }`}
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-current">
                              <AgentGlyph
                                agent={agent}
                                className="h-4 w-4"
                                accentClassName="text-current"
                              />
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-mono text-xs font-bold uppercase tracking-wider">
                                {agent.name}
                              </span>
                              <span
                                className={`block truncate font-mono text-[10px] ${
                                  active ? "text-white/80" : "text-crt-dim"
                                }`}
                              >
                                /{agent.slug}
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {selectedDeleteAgent ? (
                <div className={`${panelClass} flex flex-col gap-5`}>
                  <div className="flex items-center gap-3 border-b-4 border-crt-line pb-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-crt-line bg-crt-bg text-crt-blue">
                      <AgentGlyph agent={selectedDeleteAgent} />
                    </span>

                    <div className="min-w-0">
                      <p className="truncate font-mono text-sm font-bold uppercase tracking-wider text-crt-ink">
                        {selectedDeleteAgent.name}
                      </p>
                      <p className="truncate font-mono text-[10px] uppercase tracking-wider text-crt-dim">
                        created {formatDate(selectedDeleteAgent.createdAt)}
                      </p>
                    </div>
                  </div>

                  <p className="font-mono text-xs leading-relaxed text-crt-dim">
                    this is permanent. the agent and every session attached to
                    it will be removed from the database.
                  </p>

                  <button
                    type="button"
                    onClick={() => beginDelete(selectedDeleteAgent)}
                    className={`${redButton} px-4 py-2.5 text-xs`}
                  >
                    delete this agent
                  </button>

                  {pendingDelete?._id === selectedDeleteAgent._id ? (
                    <div className="flex flex-col gap-3 border-2 border-crt-red bg-crt-red/10 p-4">
                      <label className="flex flex-col gap-2">
                        <span className={labelClass}>
                          type /{pendingDelete.slug} to confirm
                        </span>
                        <input
                          value={confirmSlug}
                          onChange={(event) =>
                            setConfirmSlug(event.target.value)
                          }
                          placeholder={pendingDelete.slug}
                          className={inputClass}
                        />
                      </label>

                      {formError ? <Banner tone="bad" text={formError} /> : null}

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={handleDelete}
                          disabled={deleting}
                          className={redButton}
                        >
                          {deleting ? "deleting..." : "yes, delete it"}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setPendingDelete(null);
                            setConfirmSlug("");
                            setFormError("");
                          }}
                          className={ghostButton}
                        >
                          cancel
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className={`${panelClass} text-center`}>
                  <p className="font-mono text-xs uppercase tracking-widest text-crt-dim">
                    select an agent above
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default AdminPanel;
