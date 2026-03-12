// src/services/providers/gemini.js
// Google Generative Language API — no SDK, pure fetch
// Docs: https://ai.google.dev/gemini-api/docs/document-processing
// PDF inline base64 supported up to 20MB

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_MODEL    = import.meta.env.VITE_GEMINI_MODEL ?? "gemini-2.5-flash";

export async function callGemini(b64, prompt) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("VITE_GEMINI_API_KEY не встановлено в .env.local");

  const url = `${GEMINI_ENDPOINT}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [
          { inlineData: { mimeType: "application/pdf", data: b64 } },
          { text: prompt },
        ],
      }],
      generationConfig: {
        temperature:     0.1,    // low temp for deterministic JSON
        maxOutputTokens: 1500,
      },
    }),
  });

  const json = await response.json();

  // Gemini error format: { error: { code, message, status } }
  if (json.error) throw new Error(`Gemini: ${json.error.message ?? json.error.status}`);

  // Gemini response path: candidates[0].content.parts[0].text
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  
  // Safety check — sometimes model refuses
  const finishReason = json.candidates?.[0]?.finishReason;
  if (finishReason === "SAFETY") throw new Error("Gemini: запит заблоковано фільтром безпеки");

  if (!text) throw new Error("Gemini повернув порожню відповідь");

  return text;
}
