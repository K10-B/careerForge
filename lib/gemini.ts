import { GoogleGenerativeAI } from "@google/generative-ai";

const gemini = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;
const geminiModelName = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";

export async function generateText(prompt: string) {
  if (!gemini) {
    return "Gemini is not configured yet. Add a GEMINI_API_KEY to enable AI generation.";
  }

  const model = gemini.getGenerativeModel({ model: geminiModelName });
  const result = await model.generateContent(prompt);
  return result.response.text();
}
