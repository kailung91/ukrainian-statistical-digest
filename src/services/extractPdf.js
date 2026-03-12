// src/services/extractPdf.js
import { toBase64 }   from "../utils/pdfToBase64.js";
import { parseJSON }  from "../utils/parseJSON.js";
import { callGemini } from "./providers/gemini.js";
import { callClaude } from "./providers/claude.js";

const EXTRACTION_PROMPT = `Ти — аналітик Держстату України. Проаналізуй цей PDF і поверни ТІЛЬКИ валідний JSON, без жодного тексту до або після.

Формат відповіді:
{
  "topic": "labor|trade|gdp|population",
  "period": "наприклад Q1 2025",
  "title": "коротка назва документу",
  "unit": "одиниця виміру",
  "description": "назва показника для легенди карти",
  "oblastData": { "vinnytsia": число },
  "stats": [{"label": "назва", "value": "текст", "delta": "+X% або null"}],
  "summary": "3-4 речення аналізу українською, офіційний тон"
}

Допустимі ключі oblastData (тільки ці, snake_case):
vinnytsia, volyn, dnipro, donetsk, zhytomyr, zakarpattia, zaporizhzhia,
ivanofrankivsk, kyiv_obl, kirovohrad, luhansk, lviv, mykolaiv, odessa,
poltava, rivne, sumy, ternopil, kharkiv, kherson, khmelnytsky,
cherkasy, chernivtsi, chernihiv, kyiv_city, crimea

Якщо даних по області немає — не включай її. Якщо delta невідома — null.
Тільки JSON, нічого більше.`;

const CANONICAL_KEYS = new Set([
  "vinnytsia","volyn","dnipro","donetsk","zhytomyr","zakarpattia","zaporizhzhia",
  "ivanofrankivsk","kyiv_obl","kirovohrad","luhansk","lviv","mykolaiv","odessa",
  "poltava","rivne","sumy","ternopil","kharkiv","kherson","khmelnytsky",
  "cherkasy","chernivtsi","chernihiv","kyiv_city","crimea",
]);

function validateOblastData(raw) {
  if (!raw || typeof raw !== "object") return {};
  return Object.fromEntries(
    Object.entries(raw).filter(([k, v]) =>
      CANONICAL_KEYS.has(k) && typeof v === "number" && isFinite(v)
    )
  );
}

function resolveProvider() {
  const provider = import.meta.env.VITE_AI_PROVIDER ?? "gemini";
  if (provider === "claude") return callClaude;
  if (provider === "gemini") return callGemini;
  console.warn(`Невідомий провайдер "${provider}", використовуємо gemini`);
  return callGemini;
}

export async function extractPdf(file, onProgress) {
  onProgress?.("Зчитую PDF…");
  const b64 = await toBase64(file);

  const provider = resolveProvider();
  const providerName = import.meta.env.VITE_AI_PROVIDER ?? "gemini";
  onProgress?.(`${providerName === "claude" ? "Claude" : "Gemini"} аналізує документ…`);

  // In production: route through /api/extract proxy (provider handled server-side)
  // In dev with key set: call provider directly
  const isDev = import.meta.env.DEV;
  const hasGeminiKey = !!import.meta.env.VITE_GEMINI_API_KEY;
  const hasClaudeKey = !!import.meta.env.VITE_ANTHROPIC_API_KEY;

  let rawText;
  if (isDev && (hasGeminiKey || hasClaudeKey)) {
    rawText = await provider(b64, EXTRACTION_PROMPT);
  } else {
    const response = await fetch("http://localhost:5173/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        base64: b64,
        mimeType: "application/pdf",
        provider: providerName,
      }),
    });
    const json = await response.json();
    if (json.error) throw new Error(json.error.message ?? "Помилка API проксі");
    rawText = json.text;
  }

  onProgress?.("Будую карту…");

  const parsed = parseJSON(rawText);
  if (!parsed) throw new Error(`AI повернув невалідний JSON:\n${rawText.slice(0, 400)}`);

  return {
    topic:       ["labor","trade","gdp","population"].includes(parsed.topic) ? parsed.topic : "labor",
    period:      parsed.period      ?? "",
    title:       parsed.title       ?? parsed.description ?? "",
    unit:        parsed.unit        ?? "%",
    description: parsed.description ?? "",
    oblastData:  validateOblastData(parsed.oblastData),
    stats:       Array.isArray(parsed.stats) ? parsed.stats.slice(0, 4) : [],
    summary:     parsed.summary     ?? "",
  };
}
