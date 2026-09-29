import { GoogleGenAI } from "@google/genai";

console.log("Gemini key exists:", !!process.env.GEMINI_API_KEY);
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const generateAgentResponse = async ({
  systemPrompt,
  messages,
}) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: messages.map((message) => ({
      role: message.sender === "user" ? "user" : "model",
      parts: [{ text: message.content }],
    })),
    config: {
      systemInstruction: systemPrompt,
    },
  });

  return response.text;
};