"use client";

import type { AgentIconGlyph } from "@/lib/api";

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "square",
  strokeLinejoin: "miter",
} as const;

const GLYPHS: Record<AgentIconGlyph, { d: string }[]> = {
  code: [{ d: "M9 18l-5-6 5-6" }, { d: "M15 6l5 6-5 6" }],
  terminal: [
    { d: "M4 5h16v14H4z" },
    { d: "M8 10l3 2-3 2" },
    { d: "M13 14h4" },
  ],
  math: [{ d: "M4 8h16M4 16h16M8 4v16M16 4v16" }],
  sigma: [{ d: "M18 6H7l6 6-6 6h11" }],
  atom: [
    { d: "M12 12m-3 0a3 3 0 106 0a3 3 0 10-6 0" },
    { d: "M12 12m-9 0a9 4 0 1018 0a9 4 0 10-18 0" },
    { d: "M12 12m-9 0a9 4 0 100 0a9 4 0 100 0" },
  ],
  dna: [{ d: "M8 3c0 6 8 6 8 12M16 3c0 6-8 6-8 12M8 3h8M6 9h12M6 15h12M8 21h8" }],
  book: [{ d: "M4 5h7v14H4zM13 5h7v14h-7z" }, { d: "M11 5v14" }],
  pen: [{ d: "M4 20l4-1L19 8l-3-3L5 16l-1 4z" }, { d: "M14 6l4 4" }],
  globe: [
    { d: "M12 3a9 9 0 100 18 9 9 0 000-18z" },
    { d: "M3 12h18M12 3c3 4 3 14 0 18M12 3c-3 4-3 14 0 18" },
  ],
  palette: [
    { d: "M12 3a9 9 0 000 18h2a2 2 0 002-2 2 2 0 012-2h2a1 1 0 001-1 9 9 0 00-9-13z" },
    { d: "M8 10h.01" },
    { d: "M12 7.5h.01" },
    { d: "M16 10h.01" },
  ],
  music: [
    { d: "M9 18V6l10-2v12" },
    { d: "M6.5 18a2.5 2.5 0 105 0 2.5 2.5 0 10-5 0" },
    { d: "M16.5 16a2.5 2.5 0 105 0 2.5 2.5 0 10-5 0" },
  ],
  shield: [{ d: "M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3z" }],
  cpu: [
    { d: "M7 7h10v10H7z" },
    {
      d: "M4 10h3M4 14h3M17 10h3M17 14h3M10 4v3M14 4v3M10 17v3M14 17v3",
    },
  ],
  chart: [{ d: "M4 20V4M4 20h16" }, { d: "M8 16v-5M12 16V7M16 16v-3" }],
  rocket: [
    { d: "M12 3c3 2 5 6 5 9l-3 3H10l-3-3c0-3 2-7 5-9z" },
    { d: "M12 8a2 2 0 100 4 2 2 0 100-4" },
    { d: "M9 15l-3 5 4-1M15 15l3 5-4-1" },
  ],
  robot: [
    { d: "M5 9h14v9H5z" },
    { d: "M12 5v4M8 13h.01M16 13h.01M9 18v2M15 18v2" },
  ],
  lock: [{ d: "M6 11h12v9H6z" }, { d: "M9 11V8a3 3 0 016 0v3" }],
  key: [{ d: "M14 7a4 4 0 11-3.5 5.9L4 19.5V17h2v-2h2l1.5-1.5A4 4 0 0114 7z" }],
  puzzle: [
    { d: "M5 5h5v2a2 2 0 104 0V5h5v5h-2a2 2 0 100 4h2v5h-5v-2a2 2 0 10-4 0v2H5v-5h2a2 2 0 100-4H5V5z" },
  ],
  lightbulb: [
    { d: "M9 17h6M10 21h4" },
    { d: "M12 3a6 6 0 013.5 10.9c-.5.4-.8 1-.8 1.6H9.3c0-.6-.3-1.2-.8-1.6A6 6 0 0112 3z" },
  ],
  scale: [
    { d: "M12 4v16M8 20h8" },
    { d: "M6 8h12M4 8l-2 6h4L4 8zM20 8l-2 6h4l-2-6z" },
  ],
};

// every agent falls back to the <> glyph
const resolveGlyph = (agent: { icon?: string }): AgentIconGlyph => {
  const stored = agent.icon as AgentIconGlyph | undefined;

  if (stored && Object.hasOwn(GLYPHS, stored)) {
    return stored;
  }

  return "code";
};

export const accentClass = (accent?: string) =>
  accent === "green" ? "text-crt-green" : "text-crt-blue";

type Props = {
  agent: { name: string; icon?: string; iconAccent?: string };
  className?: string;
  accentClassName?: string;
};

export function AgentGlyph({
  agent,
  className = "h-6 w-6",
  accentClassName,
}: Props) {
  const glyph = GLYPHS[resolveGlyph(agent)];

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`${className} ${
        // the card flips its icon tile to blue on hover, so the glyph follows it
        accentClassName ?? `${accentClass(agent.iconAccent)} group-hover:text-white`
      }`}
    >
      {glyph.map((path, index) => (
        <path key={`${path.d}-${index}`} {...STROKE} d={path.d} />
      ))}
    </svg>
  );
}

export default AgentGlyph;
