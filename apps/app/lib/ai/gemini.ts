import "server-only";

/** Matches `document_embeddings.embedding vector(1536)` in Supabase. */
export const GEMINI_EMBEDDING_DIMENSIONS = 1536;

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export function getGeminiConfig() {
  return {
    apiKey: process.env.GEMINI_API_KEY?.trim() ?? "",
    model: process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash",
    embeddingModel:
      process.env.GEMINI_EMBEDDING_MODEL?.trim() || "text-embedding-004",
  };
}

function geminiUrl(model: string, action: "generateContent" | "embedContent") {
  const { apiKey } = getGeminiConfig();
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:${action}?key=${encodeURIComponent(apiKey)}`;
}

export async function geminiGenerateJson(input: {
  systemInstruction: string;
  userText: string;
  temperature?: number;
}): Promise<string | null> {
  const { apiKey, model } = getGeminiConfig();

  if (!apiKey) {
    return null;
  }

  const response = await fetch(geminiUrl(model, "generateContent"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: input.systemInstruction }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: input.userText }],
        },
      ],
      generationConfig: {
        temperature: input.temperature ?? 0.3,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  return payload.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}

export async function geminiEmbedText(text: string): Promise<number[] | null> {
  const { apiKey, embeddingModel } = getGeminiConfig();

  if (!apiKey) {
    return null;
  }

  const response = await fetch(geminiUrl(embeddingModel, "embedContent"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: `models/${embeddingModel}`,
      content: {
        parts: [{ text: text.slice(0, 8000) }],
      },
      outputDimensionality: GEMINI_EMBEDDING_DIMENSIONS,
    }),
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    embedding?: { values?: number[] };
  };

  const values = payload.embedding?.values;

  if (!values?.length || values.length !== GEMINI_EMBEDDING_DIMENSIONS) {
    return null;
  }

  return values;
}
