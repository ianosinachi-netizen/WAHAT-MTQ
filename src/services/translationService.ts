import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// In-memory cache for the current session
const translationCache: Record<string, Record<string, string>> = {};

async function withRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (error.message?.includes('quota') || error.status === 429)) {
      console.warn(`Quota exceeded, retrying in ${RETRY_DELAY}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return withRetry(fn, retries - 1);
    }
    
    // If it's a quota error, throw a cleaner one
    if (error.message?.includes('quota') || error.status === 429) {
      throw new Error("Translation error: Quota exceeded");
    }
    throw error;
  }
}

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  if (!text || targetLanguage === 'en' || targetLanguage === 'English') return text;

  // Check in-memory cache
  if (translationCache[targetLanguage]?.[text]) {
    return translationCache[targetLanguage][text];
  }

  try {
    const translated = await withRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Translate the following text to ${targetLanguage}. 
        Context: This is for a professional website for a chemical company (Wahat MTQ Chemicals).
        Return ONLY the translated text, no explanations, no quotes, no extra characters: "${text}"`,
      });

      return response.text?.trim() || text;
    });

    // Save to cache
    if (!translationCache[targetLanguage]) translationCache[targetLanguage] = {};
    translationCache[targetLanguage][text] = translated;

    return translated;
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
}

export async function translateBatch(texts: string[], targetLanguage: string): Promise<string[]> {
  if (!texts.length || targetLanguage === 'en' || targetLanguage === 'English') return texts;

  const results: Record<string, string> = {};
  const toTranslate: string[] = [];

  // Check cache first
  texts.forEach(text => {
    if (translationCache[targetLanguage]?.[text]) {
      results[text] = translationCache[targetLanguage][text];
    } else if (text.trim() !== '') {
      toTranslate.push(text);
    }
  });

  if (toTranslate.length === 0) {
    return texts.map(text => results[text] || text);
  }

  // Filter out duplicates in the toTranslate list
  const uniqueToTranslate = Array.from(new Set(toTranslate));

  // Limit batch size
  const BATCH_SIZE = 25;

  for (let i = 0; i < uniqueToTranslate.length; i += BATCH_SIZE) {
    const batch = uniqueToTranslate.slice(i, i + BATCH_SIZE);
    
    try {
      await withRetry(async () => {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Translate the following list of strings to ${targetLanguage}. 
          Context: These are UI labels, buttons, and content for a professional chemical company website.
          Return the translations as a JSON object where keys are the original strings and values are the translations. 
          Return ONLY the JSON object: ${JSON.stringify(batch)}`,
          config: {
            responseMimeType: "application/json"
          }
        });

        const batchResult = JSON.parse(response.text || "{}");
        Object.assign(results, batchResult);

        // Update cache
        if (!translationCache[targetLanguage]) translationCache[targetLanguage] = {};
        Object.assign(translationCache[targetLanguage], batchResult);
      });
    } catch (error) {
      console.error("Batch translation error for chunk:", error);
    }
  }

  // Map back to the original order
  return texts.map(text => results[text] || text);
}
