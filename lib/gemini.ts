const groqApiKey = process.env.GROQ_API_KEY?.trim();
const groqModelName = process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile";

type GenerateTextOptions = {
  generationConfig?: {
    maxOutputTokens?: number;
    temperature?: number;
  };
  maxRetries?: number;
};

type GroqChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  error?: {
    message?: string;
  };
};

function getGroqRetryDelay(errorMessage: string) {
  const retryAfterMatch = errorMessage.match(/try again in ([\d.]+)s/i);
  if (retryAfterMatch?.[1]) {
    return `${Math.ceil(Number(retryAfterMatch[1]))} seconds`;
  }

  return null;
}

export async function generateText(prompt: string, options: GenerateTextOptions = {}) {
  if (!groqApiKey) {
    return "Groq is not configured yet. Add GROQ_API_KEY to enable AI generation.";
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${groqApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: groqModelName,
      messages: [{ role: "user", content: prompt }],
      temperature: options.generationConfig?.temperature,
      max_tokens: options.generationConfig?.maxOutputTokens,
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as GroqChatCompletionResponse;
  const errorMessage = payload.error?.message || response.statusText || "Groq request failed.";

  if (!response.ok) {
    if (response.status === 429 || /quota|rate limit|too many requests/i.test(errorMessage)) {
      const retryDelay = getGroqRetryDelay(errorMessage);
      throw new Error(
        retryDelay
          ? `Groq rate limit or quota was reached. Please try again in ${retryDelay}.`
          : "Groq rate limit or quota was reached. Please wait and try again.",
      );
    }

    throw new Error(errorMessage);
  }

  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Groq returned an empty response.");
  }

  return content;
}
