// src/services/providers/claude.js
// Anthropic Messages API — no SDK, pure fetch

const CLAUDE_ENDPOINT = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL    = import.meta.env.VITE_CLAUDE_MODEL ?? "claude-sonnet-4-6";

export async function callClaude(b64, prompt) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("VITE_ANTHROPIC_API_KEY не встановлено в .env.local");

  const response = await fetch(CLAUDE_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: [
          { type: "document", source: { type: "base64", media_type: "application/pdf", data: b64 } },
          { type: "text", text: prompt },
        ],
      }],
    }),
  });

  const json = await response.json();
  if (json.error) throw new Error(`Claude: ${json.error.message}`);

  const text = json.content?.find(b => b.type === "text")?.text;
  if (!text) throw new Error("Claude повернув порожню відповідь");

  return text;
}
