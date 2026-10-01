"use client";

import type { Message } from "@/lib/api";

type ChatMessageProps = {
  message: Message;
  agentLabel: string;
  revealed?: string;
  streaming?: boolean;
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
        className={`border-2 px-3 py-2 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words sm:text-sm ${
          fromUser
            ? "border-crt-blue self-end bg-crt-blue/10 text-crt-ink"
            : "border-crt-green self-start bg-crt-green/10 text-crt-ink"
        }`}
      >
        {content}
        {caret ? (
          <span className="ml-0.5 inline-block h-3 w-[2px] translate-y-[2px] animate-pulse bg-crt-green" />
        ) : null}
      </div>
    </div>
  );
}

export default ChatMessage;