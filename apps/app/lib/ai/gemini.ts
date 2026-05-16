import "server-only";

/** Matches `document_embeddings.embedding vector(1536)` in Supabase. */
export const GEMINI_EMBEDDING_DIMENSIONS = 1536;

const DEFAULT_GENERATION_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-2.0-flash-lite",
];

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export function getGeminiConfig() {
  const configuredModel = process.env.GEMINI_MODEL?.trim();

  return {
    apiKey: process.env.GEMINI_API_KEY?.trim() ?? "",
    model: configuredModel || DEFAULT_GENERATION_MODELS[0],
    embeddingModel:
      process.env.GEMINI_EMBEDDING_MODEL?.trim() || "text-embedding-004",
    generationModels: configuredModel
      ? [configuredModel, ...DEFAULT_GENERATION_MODELS.filter((m) => m !== configuredModel)]
      : DEFAULT_GENERATION_MODELS,
  };
}

function geminiUrl(model: string, action: "generateContent" | "embedContent") {
  const { apiKey } = getGeminiConfig();
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:${action}?key=${encodeURIComponent(apiKey)}`;
}

async function parseGeminiError(response: Response) {
  try {
    const body = (await response.json()) as {
      error?: { message?: string };
    };
    return body.error?.message ?? `Gemini API error (${response.status})`;
  } catch {
    return `Gemini API error (${response.status})`;
  }
}

export type GeminiJsonResult =
  | { ok: true; text: string; model: string }
  | { ok: false; error: string };

export async function geminiGenerateJson(input: {
  systemInstruction: string;
  userText: string;
  temperature?: number;
}): Promise<GeminiJsonResult> {
  const { apiKey, generationModels } = getGeminiConfig();

  if (!apiKey) {
    return {
      ok: false,
      error: "GEMINI_API_KEY is not set.",
    };
  }

  let lastError = "Gemini did not return a response.";

  for (const model of generationModels) {
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
      lastError = await parseGeminiError(response);
      continue;
    }

    const payload = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };

    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text?.trim()) {
      lastError = "Gemini returned an empty response.";
      continue;
    }

    return { ok: true, text, model };
  }

  return { ok: false, error: lastError };
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
