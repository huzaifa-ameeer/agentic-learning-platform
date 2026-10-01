"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import {
  ApiError,
  getSession,
  getSessionMessages,
  sendMessage,
  type LearningSession,
  type Message,
} from "@/lib/api";
import { useTypewriter } from "@/lib/useTypewriter";
import { ChatMessage } from "./ChatMessage";
import { ThinkingIndicator } from "./ThinkingIndicator";

const NO_MESSAGES: Message[] = [];

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

const now = () => new Date().toISOString();

type Loaded = {
  id: string;
  session: LearningSession;
  messages: Message[];
};

export function SessionDetailContent() {
  const params = useParams<{ id: string }>();
  const sessionId = params.id;

  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [loadError, setLoadError] = useState<{ id: string; message: string } | null>(
    null,
  );
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [pendingReplyId, setPendingReplyId] = useState("");
  const [sendError, setSendError] = useState("");

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const loadedHere = loaded?.id === sessionId ? loaded : null;
  const session = loadedHere?.session ?? null;
  const messages = loadedHere?.messages ?? NO_MESSAGES;
  const loading = Boolean(sessionId) && !loadedHere && loadError?.id !== sessionId;

  const pendingReply = messages.find(
    (message) => message._id === pendingReplyId,
  );

  const { revealed, done } = useTypewriter(
    pendingReply?.content ?? "",
    pendingReplyId !== "" && !thinking,
  );

  const streamingId = pendingReply && !done ? pendingReplyId : "";

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    const node = scrollRef.current;

    if (node) {
      node.scrollTo({ top: node.scrollHeight, behavior });
    }
  }, []);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    let active = true;

    Promise.all([getSession(sessionId), getSessionMessages(sessionId)])
      .then(([sessionData, messageData]) => {
        if (!active) {
          return;
        }

        setLoaded({
          id: sessionId,
          session: sessionData.session,
          messages: messageData.messages,
        });
      })
      .catch((err) => {
        if (active) {
          setLoadError({
            id: sessionId,
            message:
              err instanceof ApiError ? err.message : "could not load session",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, revealed, thinking, scrollToBottom]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const content = draft.trim();

    if (!content || !sessionId || thinking || streamingId !== "") {
      return;
    }

    setSendError("");
    setDraft("");
    setThinking(true);

    const optimisticId = `pending-${Date.now()}`;
    const optimistic: Message = {
      _id: optimisticId,
      session: sessionId,
      sender: "user",
      content,
      createdAt: now(),
      updatedAt: now(),
    };

    setLoaded((current) =>
      current
        ? { ...current, messages: [...current.messages, optimistic] }
        : current,
    );

    try {
      const result = await sendMessage({ sessionId, content });

      setLoaded((current) =>
        current
          ? {
              ...current,
              messages: [
                ...current.messages.map((message) =>
                  message._id === optimisticId
                    ? result.data.userMessage
                    : message,
                ),
                result.data.agentMessage,
              ],
            }
          : current,
      );

      setThinking(false);
      setPendingReplyId(result.data.agentMessage._id);

      scrollToBottom("smooth");
    } catch (err) {
      setThinking(false);
      setDraft(content);

      setLoaded((current) =>
        current
          ? {
              ...current,
              messages: current.messages.filter(
                (message) => message._id !== optimisticId,
              ),
            }
          : current,
      );

      setSendError(
        err instanceof ApiError ? err.message : "could not send that message",
      );
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  if (!sessionId) {
    return <SessionError message="session not found" />;
  }

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

  if (!session) {
    return (
      <SessionError
        message={
          loadError?.id === sessionId
            ? loadError.message
            : "session not found"
        }
      />
    );
  }

  const agent = session.agent;
  const agentLabel = agent ? agent.name.toLowerCase() : "mentor";
  const locked = session.status === "completed";
  const busy = thinking || streamingId !== "";

  return (
    <section className="flex w-full min-h-0 flex-1 flex-col overflow-hidden px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full min-h-0 max-w-3xl flex-1 flex-col gap-3 sm:gap-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link
            href={agent ? `/sessions?agent=${agent._id}` : "/play-area"}
            className="font-mono text-xs uppercase tracking-wider text-crt-dim underline decoration-2 underline-offset-2 transition-colors duration-100 hover:text-crt-blue"
          >
            &lt; back to sessions
          </Link>

          {agent ? (
            <span className="border-2 border-crt-line bg-crt-panel px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-crt-dim">
              /{agent.slug}
            </span>
          ) : null}

          <span className="font-mono text-[10px] uppercase tracking-wider text-crt-dim">
            started {formatDate(session.createdAt)}
          </span>
        </div>

        <h1 className="font-mono text-xl font-bold uppercase leading-tight tracking-wider text-crt-ink sm:text-2xl">
          {session.title}
        </h1>

        <div className="flex min-h-0 flex-1 flex-col border-2 border-crt-line bg-crt-panel shadow-[6px_6px_0_0_#000]">
          <div className="flex items-center gap-2 border-b-2 border-crt-line bg-crt-line px-4 py-2.5">
            <span className="h-3 w-3 border-2 border-crt-panel bg-crt-blue" />
            <span className="h-3 w-3 border-2 border-crt-panel bg-crt-green" />
            <span className="h-3 w-3 border-2 border-crt-panel bg-crt-dim" />
            <span className="ml-2 font-mono text-[11px] font-bold uppercase tracking-widest text-crt-panel">
              {agentLabel}.exe
            </span>
            {busy ? (
              <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-crt-panel">
                <span className="h-1.5 w-1.5 animate-pulse bg-crt-green" />
                live
              </span>
            ) : null}
          </div>

          <div
            ref={scrollRef}
            className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain p-4"
          >
            {messages.length === 0 && !thinking ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
                <p className="font-mono text-xs uppercase tracking-widest text-crt-dim">
                  no messages yet
                </p>
                <p className="max-w-sm font-mono text-xs leading-relaxed text-crt-dim/80">
                  ask {agent ? agent.name.toLowerCase() : "the mentor"} anything.
                  it answers line by line, no walls of text.
                </p>
              </div>
            ) : null}

            {messages.map((message) => (
              <ChatMessage
                key={message._id}
                message={message}
                agentLabel={agentLabel}
                streaming={message._id === streamingId}
                revealed={message._id === streamingId ? revealed : undefined}
              />
            ))}

            {thinking ? <ThinkingIndicator /> : null}
          </div>

          {sendError ? (
            <div
              role="alert"
              className="flex items-center justify-center gap-2 border-t-2 border-crt-line bg-crt-blue/10 px-4 py-2.5 text-center"
            >
              <span className="font-mono text-xs font-bold text-crt-blue">
                &gt;!
              </span>
              <span className="font-mono text-xs leading-relaxed text-crt-ink">
                {sendError}
              </span>
            </div>
          ) : null}

          <form
            onSubmit={handleSubmit}
            className="flex items-start gap-2 border-t-2 border-crt-line px-4 py-3"
          >
            <span className="pt-2 font-mono text-xs text-crt-green">&gt;</span>

            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              disabled={locked || busy}
              rows={1}
              placeholder={
                locked
                  ? "this session is completed"
                  : busy
                    ? "agent is replying..."
                    : "ask anything..."
              }
              className="max-h-32 min-h-[2.5rem] min-w-0 flex-1 resize-none bg-transparent py-2 font-mono text-xs text-crt-ink outline-none placeholder:text-crt-dim disabled:cursor-not-allowed"
            />

            <button
              type="submit"
              disabled={locked || busy || draft.trim().length === 0}
              className="shrink-0 border-2 border-crt-line bg-crt-blue px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-white shadow-[3px_3px_0_0_#000] transition-all duration-100 hover:bg-crt-green hover:shadow-[1px_1px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] disabled:cursor-not-allowed disabled:bg-crt-line disabled:text-crt-dim disabled:shadow-none disabled:hover:translate-x-0 disabled:hover:translate-y-0"
            >
              send
            </button>

            {!busy && !locked ? (
              <span className="hidden h-5 w-[2px] shrink-0 self-center animate-pulse bg-crt-blue sm:block" />
            ) : null}
          </form>
        </div>

        <p className="text-center font-mono text-[10px] uppercase tracking-widest text-crt-dim">
          enter to send &middot; shift + enter for a new line
        </p>
      </div>
    </section>
  );
}

function SessionError({ message }: { message: string }) {
  return (
    <section className="flex flex-1 items-center justify-center px-4 py-20 sm:px-6">
      <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
        <div className="w-full border-4 border-crt-line bg-crt-panel p-6 shadow-[6px_6px_0_0_#000]">
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-crt-blue">
            &gt;! {message}
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

export default SessionDetailContent;