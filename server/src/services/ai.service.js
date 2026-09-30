import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODELS = ["gemini-3.5-flash", "gemini-flash-lite-latest"];

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
          systemInstruction: systemPrompt,
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