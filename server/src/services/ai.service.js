import { GoogleGenAI } from "@google/genai";
import {
  ACCENTS,
  GLYPH_PROMPT,
  fallbackIcon,
  isAccent,
  isGlyph,
} from "./icon.service.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODELS = [
  { name: "gemini-2.5-flash", disableThinking: true },
  { name: "gemini-3.5-flash", disableThinking: true },
  // flash-lite rejects thinkingConfig with a 400
  { name: "gemini-flash-lite-latest", disableThinking: false },
];

const ICON_DEADLINE_MS = 8000;
const MODEL_DEADLINE_MS = 8000;
const RESPONSE_DEADLINE_MS =
  Number(process.env.AI_RESPONSE_DEADLINE_MS) || 20000;

// after a failure a model is skipped instead of re-failing on every message
const MODEL_COOLDOWN_MS =
  Number(process.env.AI_MODEL_COOLDOWN_MS) || 60 * 1000;
const QUOTA_COOLDOWN_DEFAULT_MS = 60 * 60 * 1000;
const QUOTA_COOLDOWN_MAX_MS = 12 * 60 * 60 * 1000;

const cooldowns = new Map();

const isCoolingDown = (name) => (cooldowns.get(name) || 0) > Date.now();

// models that are free right now; if every model is cooling down, try them all
// in recovery order so one bad model can never fail the request outright
const availableModels = () => {
  const ready = MODELS.filter((model) => !isCoolingDown(model.name));

  if (ready.length > 0) {
    return ready;
  }

  return [...MODELS].sort(
    (a, b) => (cooldowns.get(a.name) || 0) - (cooldowns.get(b.name) || 0),
  );
};

const startCooldown = (name, error) => {
  const status = Number(error?.status);
  let waitMs = MODEL_COOLDOWN_MS;

  if (status === 429) {
    // the API tells us exactly when the quota resets: "retryDelay":"25304s"
    const retry = /"retryDelay":"(\d+)s"/.exec(String(error?.message || ""));
    const retryMs = retry ? Number(retry[1]) * 1000 : QUOTA_COOLDOWN_DEFAULT_MS;
    waitMs = Math.min(retryMs, QUOTA_COOLDOWN_MAX_MS);
  }

  cooldowns.set(name, Date.now() + waitMs);

  return waitMs;
};

const clearCooldown = (name) => cooldowns.delete(name);

const describeFailure = (error) => {
  const status = Number(error?.status);

  if (status === 429) {
    return "429 quota exhausted";
  }

  if (status === 503) {
    return "503 high demand";
  }

  if (Number.isFinite(status) && status > 0) {
    return `${status} upstream error`;
  }

  return String(error?.message || error).slice(0, 120);
};

const formatDuration = (ms) => {
  const minutes = Math.round(ms / 60000);

  if (minutes >= 60) {
    return `${Math.round(minutes / 60)}h`;
  }

  if (minutes >= 1) {
    return `${minutes}m`;
  }

  return `${Math.round(ms / 1000)}s`;
};

const buildConfig = (model, extra) => ({
  ...extra,
  ...(model.disableThinking
    ? { thinkingConfig: { thinkingBudget: 0 } }
    : {}),
});

const withDeadline = (work, deadline, label) => {
  let timer;

  const timeout = new Promise((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`${label} exceeded ${deadline}ms`)),
      deadline,
    );
  });

  return Promise.race([work(), timeout]).finally(() => clearTimeout(timer));
};

const FORMATTING_RULES = [
  "",
  "Output formatting rules (follow these):",
  "- Reply in markdown. never output raw markdown syntax as plain text.",
  "- Use ## headings to break the answer into scannable sections.",
  "- Use **bold** for key terms and the single most important takeaway.",
  "- Use - for bullet lists and 1. for ordered steps.",
  "- Put all code inside fenced code blocks tagged with a language.",
  "- Keep paragraphs short (2-3 sentences max). no walls of text.",
].join("\n");

export const generateAgentResponse = async ({
  systemPrompt,
  messages,
}) => {
  const contents = messages.map((message) => ({
    role: message.sender === "user" ? "user" : "model",
    parts: [{ text: message.content }],
  }));

  const startedAt = Date.now();
  const candidates = availableModels();
  let lastFailure = "no model available";

  for (const [index, model] of candidates.entries()) {
    const totalRemaining = RESPONSE_DEADLINE_MS - (Date.now() - startedAt);

    if (totalRemaining <= 500) {
      break;
    }

    // the last healthy model gets the whole remaining budget
    const deadline =
      index === candidates.length - 1
        ? totalRemaining
        : Math.min(MODEL_DEADLINE_MS, totalRemaining);

    try {
      const response = await withDeadline(
        () =>
          ai.models.generateContent({
            model: model.name,
            contents,
            config: buildConfig(model, {
              systemInstruction: `${systemPrompt}\n${FORMATTING_RULES}`,
            }),
          }),
        deadline,
        `AI response (${model.name})`,
      );

      if (response.text) {
        clearCooldown(model.name);
        return response.text;
      }

      lastFailure = "empty response";
      console.warn(
        `AI chat | ${model.name} returned an empty response | cooling down ${formatDuration(
          startCooldown(model.name, null),
        )}`,
      );
    } catch (error) {
      lastFailure = describeFailure(error);
      console.warn(
        `AI chat | ${model.name} failed: ${lastFailure} | cooling down ${formatDuration(
          startCooldown(model.name, error),
        )}`,
      );
    }
  }

  throw new Error(`AI service is currently unavailable (${lastFailure})`);
};

export const generateAgentIcon = async ({ name, description }) => {
  const fallback = fallbackIcon(`${name} ${description}`);

  const prompt = [
    "You choose an icon for an AI mentor agent card.",
    `Agent name: ${name}`,
    `Agent description: ${description}`,
    "",
    `Reply with raw JSON only, no prose and no code fences:`,
    `{"glyph":"<one of: ${GLYPH_PROMPT}>","accent":"<one of: ${ACCENTS.join(", ")}>"}`,
    "",
    "Pick the glyph whose meaning best matches the agent's subject matter, and",
    "pick accent 'green' only for creative or people-oriented mentors, otherwise 'blue'.",
  ].join("\n");

  const startedAt = Date.now();

  for (const model of availableModels()) {
    const remaining = ICON_DEADLINE_MS - (Date.now() - startedAt);

    if (remaining <= 500) {
      break;
    }

    try {
      const response = await withDeadline(
        () =>
          ai.models.generateContent({
            model: model.name,
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: buildConfig(model, {
              responseMimeType: "application/json",
              systemInstruction:
                "You are an icon designer. You only ever reply with a small JSON object.",
            }),
          }),
        remaining,
        `Icon generation (${model.name})`,
      );

      const parsed = JSON.parse(response.text);

      if (isGlyph(parsed.glyph) && isAccent(parsed.accent)) {
        clearCooldown(model.name);
        return { glyph: parsed.glyph, accent: parsed.accent, source: "ai" };
      }

      console.warn(
        `AI icon | ${model.name} returned an unusable payload | cooling down ${formatDuration(
          startCooldown(model.name, null),
        )}`,
      );
    } catch (error) {
      console.warn(
        `AI icon | ${model.name} failed: ${describeFailure(
          error,
        )} | cooling down ${formatDuration(startCooldown(model.name, error))}`,
      );
    }
  }

  return { ...fallback, source: "fallback" };
};
