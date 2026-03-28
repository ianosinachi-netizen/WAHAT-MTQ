import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function getAIResponse(messages: ChatMessage[], language: string = 'English'): Promise<string> {
  // 1. Try Gemini first
  try {
    const model = "gemini-3-flash-preview";
    const prompt = messages.map(m => `${m.role}: ${m.content}`).join("\n");
    
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: `You are an AI assistant for WAHAT MTQ Chemicals named MRS SUSAN. You help users with information about industrial chemicals, products, and procurement. Be professional, technical, and helpful. IMPORTANT: Respond in ${language}.`,
      }
    });

    if (response.text) {
      return response.text;
    }
    throw new Error("Empty response from Gemini");
  } catch (geminiError) {
    console.warn("Gemini API failed, falling back to Groq:", geminiError);

    // 2. Fallback to Groq via server proxy
    try {
      const response = await fetch("/api/ai/groq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "You are an AI assistant for WAHAT MTQ Chemicals. You help users with information about industrial chemicals, products, and procurement. Be professional, technical, and helpful." },
            ...messages.map(m => ({
              role: m.role === "assistant" ? "assistant" : "user",
              content: m.content
            }))
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Groq proxy failed");
      }

      const data = await response.json();
      return data.text;
    } catch (groqError) {
      console.error("Both AI services failed:", groqError);
      return "I'm sorry, I'm having trouble connecting to my AI services right now. Please try again later or contact our support team.";
    }
  }
}
