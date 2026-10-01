import { GoogleGenAI } from "@google/genai";
import {
  ACCENTS,
  GLYPH_PROMPT,
  fallbackIcon,
  isAccent,
  isGlyphKey,
} from "./icon.service.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODELS = ["gemini-3.5-flash", "gemini-flash-lite-latest"];

const ICON_DEADLINE_MS = 8000;

const withDeadline = (work, deadline) =>
  Promise.race([
    work(),
    new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error(`icon generation exceeded ${deadline}ms`)),
        deadline,
      );
    }),
  ]);

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

  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: `${systemPrompt}\n${FORMATTING_RULES}`,
        },
      });

      if (response.text) {
        return response.text;
      }

      console.error(`AI service error (${model}): empty response`);
    } catch (error) {
      console.error(`AI service error (${model}):`, error);
    }
  }

  throw new Error("AI service is currently unavailable");
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

  for (const model of MODELS) {
    const remaining = ICON_DEADLINE_MS - (Date.now() - startedAt);

    if (remaining <= 500) {
      break;
    }

    try {
      const response = await withDeadline(
        () =>
          ai.models.generateContent({
            model,
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
              responseMimeType: "application/json",
              systemInstruction:
                "You are an icon designer. You only ever reply with a small JSON object.",
            },
          }),
        remaining,
      );

      const parsed = JSON.parse(response.text);

      if (isGlyph(parsed.glyph) && isAccent(parsed.accent)) {
        return { glyph: parsed.glyph, accent: parsed.accent, source: "ai" };
      }

      console.error(`Icon service error (${model}): unusable payload`);
    } catch (error) {
      console.error(
        `Icon service error (${model}):`,
        error?.message || error,
      );
    }
  }

  return { ...fallback, source: "fallback" };
};
