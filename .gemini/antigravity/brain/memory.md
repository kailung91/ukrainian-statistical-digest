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
