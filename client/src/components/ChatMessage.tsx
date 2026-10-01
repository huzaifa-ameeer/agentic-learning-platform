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
  p: ({ children }) => <p className="break-words leading-relaxed">{children}</p>,
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
    <pre className="mt-2 w-full min-w-0 max-w-full overflow-x-auto border-2 border-crt-line bg-crt-bg p-3 text-crt-ink">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="mt-2 w-full min-w-0 max-w-full overflow-x-auto">
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

const countToken = (text: string, token: string) => {
  let count = 0;
  let index = 0;

  while (index < text.length) {
    if (text[index] === "\\") {
      index += 2;
      continue;
    }

    if (text.startsWith(token, index)) {
      count += 1;
      index += token.length;
      continue;
    }

    index += 1;
  }

  return count;
};

const closeOpenMarkers = (text: string) => {
  if (!text) {
    return text;
  }

  if (countToken(text, "```") % 2 === 1) {
    return `${text}\n\`\`\``;
  }

  let result = text;

  if (countToken(result, "`") % 2 === 1) {
    result += "`";
  }

  if (countToken(result, "**") % 2 === 1) {
    result += "**";
  }

  return result;
};

export function ChatMessage({
  message,
  agentLabel,
  revealed,
  streaming = false,
}: ChatMessageProps) {
  const fromUser = message.sender === "user";
  const raw = streaming ? (revealed ?? "") : message.content;
  const caret = streaming && raw.length < message.content.length;
  const source = streaming ? closeOpenMarkers(raw) : raw;

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
            ? "border-crt-blue self-end max-w-full whitespace-pre-wrap break-all bg-crt-blue/10 text-crt-ink sm:max-w-[80%] sm:break-words"
            : "border-crt-green self-start max-w-full break-words bg-crt-green/10 text-crt-ink sm:max-w-[90%]"
        }`}
      >
        {fromUser ? (
          raw
        ) : source ? (
          <div className="min-w-0 max-w-full [&>*+*]:mt-2 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_li]:break-words [&_td]:break-words [&_th]:break-words">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {source}
            </ReactMarkdown>

            {caret ? (
              <span className="-mt-1 ml-0.5 inline-block h-3 w-[2px] translate-y-[2px] animate-pulse bg-crt-green align-middle" />
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ChatMessage;