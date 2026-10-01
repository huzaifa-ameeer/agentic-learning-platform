import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODELS = ["gemini-3.5-flash", "gemini-flash-lite-latest"];

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