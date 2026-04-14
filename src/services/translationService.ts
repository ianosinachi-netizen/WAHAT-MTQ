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
    const batchResult = await translateBatch([text], targetLanguage);
    return batchResult[0] || text;
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
        const response = await fetch('/api/ai/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            texts: batch,
            targetLanguage
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Translation failed');
        }

        const batchResult = await response.json();
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
