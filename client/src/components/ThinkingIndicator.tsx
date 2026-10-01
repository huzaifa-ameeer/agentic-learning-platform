"use client";

export function ThinkingIndicator() {
  return (
    <div className="flex flex-col gap-1 self-start">
      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-crt-green">
        mentor
      </span>

      <div className="flex items-center gap-2 border-2 border-crt-green bg-crt-green/10 px-3 py-2">
        <span className="h-3 w-3 animate-spin border-2 border-crt-green border-t-transparent" />
        <span className="font-mono text-[11px] uppercase tracking-widest text-crt-green">
          agent is thinking
        </span>
      </div>
    </div>
  );
}

export default ThinkingIndicator;