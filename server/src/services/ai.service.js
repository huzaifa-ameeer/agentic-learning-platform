import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const generateAgentResponse = async ({
  systemPrompt,
  messages,
}) => {
  try {
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

    if (!response.text) {
      throw new Error("AI returned an empty response");
    }

    return response.text;
  } catch (error) {
    console.error("AI service error:", error);

    throw new Error("AI service is currently unavailable");
  }
};