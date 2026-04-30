import { GoogleGenerativeAI } from "@google/generative-ai";

const gemini = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;
const geminiModelName = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
const GEMINI_MAX_RETRIES = 3;
const GEMINI_RETRY_DELAYS_MS = [600, 1200, 2400] as const;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableGeminiError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.message.includes("[503 Service Unavailable]") || error.message.includes("high demand");
}

export async function generateText(prompt: string) {
  if (!gemini) {
    return "Gemini is not configured yet. Add a GEMINI_API_KEY to enable AI generation.";
  }

  const model = gemini.getGenerativeModel({ model: geminiModelName });

  for (let attempt = 0; attempt <= GEMINI_MAX_RETRIES; attempt += 1) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      const shouldRetry = attempt < GEMINI_MAX_RETRIES && isRetryableGeminiError(error);

      if (!shouldRetry) {
        if (isRetryableGeminiError(error)) {
          throw new Error("Gemini is temporarily busy right now. Please try again in a moment.");
        }

        throw error;
      }

      await sleep(GEMINI_RETRY_DELAYS_MS[attempt] ?? GEMINI_RETRY_DELAYS_MS[GEMINI_RETRY_DELAYS_MS.length - 1]);
    }
  }

  throw new Error("Gemini is temporarily busy right now. Please try again in a moment.");
}
