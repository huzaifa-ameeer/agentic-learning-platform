"use client";

import { useEffect, useState } from "react";

const CHARS_PER_TICK = 3;
const TICK_MS = 24;
const LINE_PAUSE_MS = 140;

const buildRevealSteps = (text: string) => {
  const lineEnds: number[] = [];

  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === "\n") {
      lineEnds.push(index + 1);
    }
  }

  const steps: number[] = [];

  let cursor = 0;
  let lineIndex = 0;

  while (cursor < text.length) {
    const lineEnd = lineEnds[lineIndex];

    cursor =
      lineEnd !== undefined && lineEnd - cursor <= CHARS_PER_TICK * 5
        ? lineEnd
        : Math.min(cursor + CHARS_PER_TICK, text.length);

    steps.push(cursor);

    if (lineEnd !== undefined && cursor >= lineEnd) {
      lineIndex += 1;
    }
  }

  return steps;
};

export function useTypewriter(text: string, enabled: boolean) {
  const [progress, setProgress] = useState({ text: "", cursor: 0 });

  useEffect(() => {
    if (!enabled || !text) {
      return;
    }

    const steps = buildRevealSteps(text);

    if (steps.length === 0) {
      return;
    }

    let stepIndex = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const advance = () => {
      if (cancelled) {
        return;
      }

      const cursor = steps[stepIndex];
      const pausedOnLineEnd = text[cursor - 1] === "\n";

      setProgress({ text, cursor });

      stepIndex += 1;

      if (stepIndex >= steps.length) {
        return;
      }

      timer = setTimeout(advance, pausedOnLineEnd ? LINE_PAUSE_MS : TICK_MS);
    };

    timer = setTimeout(advance, TICK_MS);

    return () => {
      cancelled = true;

      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [text, enabled]);

  const active = enabled && text.length > 0;
  const cursor = progress.text === text ? progress.cursor : 0;
  const revealed = active ? text.slice(0, cursor) : text;
  const done = !active || cursor >= text.length;

  return { revealed, done };
}