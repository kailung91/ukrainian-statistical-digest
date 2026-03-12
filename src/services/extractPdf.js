import { toBase64 } from "../utils/pdfToBase64.js";
import { parseJSON } from "../utils/parseJSON.js";

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

export async function extractPdf(file, onProgress) {
  onProgress?.("Зчитую PDF…");
  const b64 = await toBase64(file);

  onProgress?.("AI аналізує документ…");

  // In dev: use VITE_ANTHROPIC_API_KEY directly (never in production)
  // In prod: route through /api/extract proxy
  const isDev = import.meta.env.DEV && import.meta.env.VITE_ANTHROPIC_API_KEY;

  let response;
  if (isDev) {
    response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: [
            { type: "document", source: { type: "base64", media_type: "application/pdf", data: b64 } },
            { type: "text", text: EXTRACTION_PROMPT },
          ],
        }],
      }),
    });
  } else {
    response = await fetch("/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64: b64, mimeType: "application/pdf" }),
    });
  }

  const json = await response.json();
  if (json.error) throw new Error(json.error.message ?? "Помилка Anthropic API");

  onProgress?.("Будую карту…");

  const raw = json.content?.find(b => b.type === "text")?.text ?? "";
  const parsed = parseJSON(raw);
  if (!parsed) throw new Error(`AI повернув невалідний JSON:\n${raw.slice(0, 400)}`);

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
