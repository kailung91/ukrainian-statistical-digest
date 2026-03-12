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
