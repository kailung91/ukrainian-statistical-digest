import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { server } from "../test/mocks/server.js";
import { http, HttpResponse } from "msw";
import { extractPdf } from "./extractPdf.js";

// Mock FileReader for toBase64
global.FileReader = class {
  readAsDataURL() { this.onload({ target: { result: "data:application/pdf;base64,dGVzdA==" } }); }
  get result() { return "data:application/pdf;base64,dGVzdA=="; }
  set onload(fn) { this._onload = fn; }
  get onload() { return this._onload; }
};

const MOCK_FILE = new File(["pdf"], "test.pdf", { type: "application/pdf" });

const VALID_RESPONSE = {
  topic: "labor", period: "Q1 2025", title: "Ринок праці",
  unit: "%", description: "Рівень безробіття, %",
  oblastData: { kyiv_city: 8.2, lviv: 10.1, INVALID_KEY: 99 },
  stats: [{ label: "Тест", value: "8,2%", delta: null }],
  summary: "Тестовий підсумок.",
};

describe("extractPdf", () => {
  const originalEnv = { ...import.meta.env };

  beforeEach(() => {
    // Force dev mode off, remove keys, force proxy behavior
    import.meta.env.DEV = false;
    delete import.meta.env.VITE_GEMINI_API_KEY;
    delete import.meta.env.VITE_ANTHROPIC_API_KEY;
    import.meta.env.VITE_AI_PROVIDER = "gemini";
  });

  afterEach(() => {
    Object.assign(import.meta.env, originalEnv);
  });

  it("returns parsed extraction result", async () => {
    server.use(http.post("http://localhost:5173/api/extract", () =>
      HttpResponse.json({ text: JSON.stringify(VALID_RESPONSE) })
    ));
    const result = await extractPdf(MOCK_FILE);
    expect(result.topic).toBe("labor");
    expect(result.period).toBe("Q1 2025");
    expect(result.oblastData.kyiv_city).toBe(8.2);
  });

  it("strips invalid oblast keys", async () => {
    server.use(http.post("http://localhost:5173/api/extract", () =>
      HttpResponse.json({ text: JSON.stringify(VALID_RESPONSE) })
    ));
    const result = await extractPdf(MOCK_FILE);
    expect(result.oblastData).not.toHaveProperty("INVALID_KEY");
  });

  it("throws on API error", async () => {
    server.use(http.post("http://localhost:5173/api/extract", () =>
      HttpResponse.json({ error: { message: "Test error" } })
    ));
    await expect(extractPdf(MOCK_FILE)).rejects.toThrow("Test error");
  });

  it("throws on invalid JSON response", async () => {
    server.use(http.post("http://localhost:5173/api/extract", () =>
      HttpResponse.json({ text: "не JSON" })
    ));
    await expect(extractPdf(MOCK_FILE)).rejects.toThrow("невалідний JSON");
  });

  it("defaults unknown topic to labor", async () => {
    const bad = { ...VALID_RESPONSE, topic: "unknown" };
    server.use(http.post("http://localhost:5173/api/extract", () =>
      HttpResponse.json({ text: JSON.stringify(bad) })
    ));
    const result = await extractPdf(MOCK_FILE);
    expect(result.topic).toBe("labor");
  });
});
