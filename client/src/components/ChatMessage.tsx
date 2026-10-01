"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message } from "@/lib/api";

type ChatMessageProps = {
  message: Message;
  agentLabel: string;
  revealed?: string;
  streaming?: boolean;
};

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mt-3 font-mono text-sm font-bold uppercase tracking-wider text-crt-green">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-3 border-b border-crt-green/50 pb-1 font-mono text-sm font-bold uppercase tracking-wider text-crt-green">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-3 font-mono text-xs font-bold uppercase tracking-wider text-crt-blue">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-2 font-mono text-xs font-bold uppercase tracking-wider text-crt-blue">
      {children}
    </h4>
  ),
  p: ({ children }) => <p className="leading-relaxed">{children}</p>,
  strong: ({ children }) => (
    <strong className="bg-crt-blue/15 px-0.5 font-bold text-crt-ink">
      {children}
    </strong>
  ),
  em: ({ children }) => <em className="text-crt-dim italic">{children}</em>,
  ul: ({ children }) => (
    <ul className="mt-2 list-disc space-y-1 pl-5 marker:text-crt-green">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-2 list-decimal space-y-1 pl-5 marker:font-bold marker:text-crt-green">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="mt-2 border-l-4 border-crt-green pl-3 text-crt-dim italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-3 border-crt-line" />,
  a: ({ children, href }) => (
    <a
      href={href}
      className="text-crt-blue underline decoration-2 underline-offset-2 hover:text-crt-green"
    >
      {children}
    </a>
  ),
  code: ({ children, className }) =>
    className ? (
      <code className="font-mono text-crt-ink">{children}</code>
    ) : (
      <code className="border border-crt-line bg-crt-bg px-1 py-0.5 font-mono text-[0.9em] text-crt-blue">
        {children}
      </code>
    ),
  pre: ({ children }) => (
    <pre className="mt-2 overflow-x-auto border-2 border-crt-line bg-crt-bg p-3 text-crt-ink">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="mt-2 overflow-x-auto">
      <table className="w-full border-collapse text-xs">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-crt-line text-crt-panel">{children}</thead>,
  th: ({ children }) => (
    <th className="border-2 border-crt-line px-2 py-1 text-left font-mono text-[10px] uppercase tracking-wider">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-2 border-crt-line px-2 py-1">{children}</td>
  ),
};

export function ChatMessage({
  message,
  agentLabel,
  revealed,
  streaming = false,
}: ChatMessageProps) {
  const fromUser = message.sender === "user";
  const content = streaming ? (revealed ?? "") : message.content;
  const caret = streaming && content.length < message.content.length;

  return (
    <div className="flex flex-col gap-1">
      <span
        className={`font-mono text-[10px] font-bold uppercase tracking-widest ${
          fromUser ? "text-crt-blue" : "text-crt-green"
        }`}
      >
        {fromUser ? "you" : agentLabel}:
      </span>

      <div
        className={`border-2 px-3 py-2 font-mono text-xs leading-relaxed sm:text-sm ${
          fromUser
            ? "border-crt-blue self-end whitespace-pre-wrap break-words bg-crt-blue/10 text-crt-ink"
            : "border-crt-green self-start bg-crt-green/10 text-crt-ink"
        }`}
      >
        {streaming ? (
          <span className="whitespace-pre-wrap break-words">
            {content}
            {caret ? (
              <span className="ml-0.5 inline-block h-3 w-[2px] translate-y-[2px] animate-pulse bg-crt-green" />
            ) : null}
          </span>
        ) : fromUser ? (
          content
        ) : (
          <div className="[&>*+*]:mt-2 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatMessage;