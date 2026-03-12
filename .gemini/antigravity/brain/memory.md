# Architectural Memory & Decisions

## Key Architectural Decisions
- **Map Library:** SVG chosen over Leaflet for artifact compatibility and complete styling control, specifically for print A4 output.
- **Styling:** Inline styles and modular CSS chosen over Tailwind CSS for portability. No external CSS frameworks allowed.
- **PDF Extraction:** Anthropic Messages API with Document Blocks is used for parsing Держстат PDF reports.

## Known Gotchas
- Template literal syntax inside JSX can sometimes cause escaping issues in artifacts.
- `JSON.parse()` often fails on LLM responses due to markdown formatting fences; always strip them before parsing.
- SVG Tooltips often render outside the viewport; absolute positioning with clamp logic is required to maintain visibility within bounds.

## Performance Notes
- Long chat sessions may require context window restarts to maintain responsiveness.
- Use `max_tokens: 1000` for Anthropic extraction prompts predicting JSON payloads to save context safely.

## Locale Settings
- Default and only locale: `uk-UA`.
- UI Text: All user-facing text strictly in Ukrainian language.
- Specifically use `toLocaleString('uk-UA')` for numbers and currency.

## Open Questions
- None currently flagged.

## 2026-03-12 — Vite SPA core scaffold

**Decision:** Split App.jsx into 8 focused components (UploadScreen, MapView, Legend, Top5Bars, StatsGrid, SummaryBlock, Disclaimer, PrintSheet).
**Rationale:** Each component has a single responsibility. PrintSheet composes all display components — easy to replace for future PDF export or email variants.
**Gotchas:**
- MapView injects .ob:hover style via <style> tag — no CSS modules.
- EB Garamond loaded imperatively in main.jsx to avoid FOUC.
- processPDF in App.jsx calls /api/extract in production, falls back to direct Anthropic call when VITE_ANTHROPIC_API_KEY is set (dev only).
**File count:** 15 source files, 2 test files, ~900 lines total.

## 2026-03-12 — PDF→API integration wired

**Decision:** extractPdf() lives in src/services/, not in App.jsx.
**Rationale:** Separation of concern — App.jsx manages state, service manages I/O.
  Easier to mock in tests, easier to swap transport (direct vs proxy).
**Dev/prod routing:** DEV + VITE_ANTHROPIC_API_KEY → direct Anthropic call.
  Production → /api/extract proxy (not yet deployed).
**OBLASTS:** 25 paths confirmed canonical. Source: ukraine_stats_map.jsx session.
  Do not modify oblasts.js manually — use geojson-to-svg-paths skill to regenerate.
**Gotcha:** TOPIC_META mutation in App.jsx (overwriting unit/description from API)
  is intentional but impure — if this causes bugs with topic switching,
  refactor to derived state instead.

## [today] — Gemini API added as primary provider

**Decision:** Multi-provider architecture. VITE_AI_PROVIDER selects active provider.
  Default: gemini (educational subscription, free quota).
  Fallback: claude (Anthropic, needs paid key).

**Gemini API specifics:**
  - Endpoint: generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key=KEY
  - Auth: query param `key=` (NOT a header like Claude)
  - PDF: inlineData.mimeType = "application/pdf", data = base64
  - Response path: candidates[0].content.parts[0].text
  - Error path: json.error.message
  - Max inline PDF: 20MB. Larger files need File API (not implemented yet).
  - finishReason "SAFETY" = content blocked — throw user-friendly error

**Default model: gemini-2.5-flash**
  - Free tier on Google AI Studio (aistudio.google.com)
  - Sufficient for JSON extraction from text-layer PDFs
  - Switch to gemini-2.5-pro via VITE_GEMINI_MODEL for scanned/complex PDFs

**Gotcha:** Gemini temperature should be low (0.1) for JSON extraction.
  At default temperature (1.0) the model occasionally adds commentary before the JSON.

## [today] — SVG paths regenerated from GADM 4.1

**Source:** stat/data/gadm41_UKR_1.json (GADM 4.1 Ukraine)
**Script:** scripts/geojson-to-svg.js — zero npm deps, Node 18+, idempotent
**Projection:** WGS84 → Mercator, viewBox -20 40 910 510
**Key mapping:** GADM NAME_1 field → snake_case oblast keys (see NAME_TO_KEY in script)
**License:** GADM data is free for non-commercial use — do not redistribute raw GeoJSON
**Regenerate:** node scripts/geojson-to-svg.js (from repo root)
**Gotcha:** GADM uses "Kiev" / "Kiev City" (not "Kyiv") — mapping handles both spellings
**Gotcha:** MultiPolygon → takes largest ring by vertex count (works for all Ukrainian oblasts)
