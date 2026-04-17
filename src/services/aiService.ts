export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function getAIResponse(messages: ChatMessage[], language: string = 'English'): Promise<string> {
  // Use Groq via server proxy exclusively
  try {
    const response = await fetch("/api/ai/groq", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { 
            role: "system", 
            content: `You are an AI assistant for WAHAT MTQ Chemicals named MRS SUSAN. You help users with information about industrial chemicals, products, and procurement. Be professional, technical, and helpful. IMPORTANT: Respond in ${language}.` 
          },
          ...messages.map(m => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.content
          }))
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "AI service failed");
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("AI service failure:", error);
    return "I'm sorry, I'm having trouble connecting to my AI services right now. Please try again later or contact our support team.";
  }
}
