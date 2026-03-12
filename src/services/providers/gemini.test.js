import { describe, it, expect } from "vitest";
import { server } from "../../test/mocks/server.js";
import { http, HttpResponse } from "msw";
import { callGemini } from "./gemini.js";

// Mock env
import.meta.env.VITE_GEMINI_API_KEY = "test-key";
import.meta.env.VITE_GEMINI_MODEL   = "gemini-2.5-flash-lite";

const GEMINI_URL = /generativelanguage\.googleapis\.com/;

describe("callGemini", () => {
  it("returns text from successful response", async () => {
    server.use(http.post(GEMINI_URL, () => HttpResponse.json({
      candidates: [{ content: { parts: [{ text: '{"topic":"labor"}' }] }, finishReason: "STOP" }],
    })));
    const result = await callGemini("base64data", "prompt");
    expect(result).toBe('{"topic":"labor"}');
  });

  it("throws on API error", async () => {
    server.use(http.post(GEMINI_URL, () => HttpResponse.json({
      error: { message: "API key invalid", status: "INVALID_ARGUMENT" },
    })));
    await expect(callGemini("base64data", "prompt")).rejects.toThrow("Gemini: API key invalid");
  });

  it("throws when candidates array is empty", async () => {
    server.use(http.post(GEMINI_URL, () => HttpResponse.json({ candidates: [] })));
    await expect(callGemini("base64data", "prompt")).rejects.toThrow("порожню відповідь");
  });

  it("throws on SAFETY finishReason", async () => {
    server.use(http.post(GEMINI_URL, () => HttpResponse.json({
      candidates: [{ content: { parts: [{ text: "" }] }, finishReason: "SAFETY" }],
    })));
    await expect(callGemini("base64data", "prompt")).rejects.toThrow("фільтром безпеки");
  });
});
