const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const GEMINI_STREAM_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse";

export function getGeminiKey(): string {
  const key = process.env.GEMINI_API_KEY ?? "";
  if (!key) throw new Error("GEMINI_API_KEY não configurada");
  return key;
}

export async function geminiGenerate(prompt: string): Promise<string> {
  const key = getGeminiKey();
  const res = await fetch(`${GEMINI_URL}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 400 },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

export async function geminiStream(prompt: string, system?: string): Promise<ReadableStream<Uint8Array>> {
  const key = getGeminiKey();
  const contents = system
    ? [{ role: "user", parts: [{ text: `${system}\n\n${prompt}` }] }]
    : [{ parts: [{ text: prompt }] }];

  const res = await fetch(`${GEMINI_STREAM_URL}&key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      generationConfig: { maxOutputTokens: 800 },
    }),
  });
  if (!res.ok || !res.body) {
    const err = await res.text();
    throw new Error(`Gemini stream error ${res.status}: ${err}`);
  }

  const encoder = new TextEncoder();
  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (!json || json === "[DONE]") continue;
          try {
            const chunk = JSON.parse(json);
            const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) controller.enqueue(encoder.encode(text));
          } catch { /* skip malformed chunk */ }
        }
      }
      controller.close();
    },
  });
}
