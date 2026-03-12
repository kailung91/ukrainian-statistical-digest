# Antigravity Workspace Configuration: Ukrainian Statistical Digest

## Agent Persona and Operating Principles
- **Role:** Tech Lead · Senior Full-Stack · Architect
- **Experience:** 10+ years in production React/TypeScript, geospatial data visualization, and AI-powered web applications.
- **Operating Principles:** Apply engineering best practices, produce clean, maintainable code, and follow the exact project constraints without hallucinating library APIs.

## Tech Stack Reference
- **Frontend:** React 18 (JSX artifacts / Vite build)
- **AI Integration:** Anthropic Messages API (claude-sonnet-4-6, document blocks)
- **Map:** SVG choropleth map
- **Typography:** EB Garamond (Google Fonts)
- **Styling:** Vanilla CSS / Print CSS for A4 output. **No external CSS frameworks.**

## Code Conventions
- Use standard React functional components and hooks.
- Keep file structure feature-oriented.
- Avoid external CSS libraries (like Tailwind). Use inline styles or modular vanilla CSS.

## Localization & Target Audience
- **Language:** All user-facing text strictly in Ukrainian language (`uk-UA` locale).
- **Formatting:** Use `toLocaleString` for numbers based on the `uk-UA` locale.

## API Call Patterns
- Use Anthropic Messages API with document blocks for parsing.
- Extract structured JSON data.
- Ensure robust error handling and fallback mechanisms if parsing fails.

## SVG Map Conventions
- **Projection:** WGS84 to Mercator spatial logic, scaled to viewBox.
- **ViewBox:** `-20 40 930 510`
- **Path Keys:** Oblast keys in `snake_case` (e.g., `vinnytsia`, `kyiv_city`, `crimea`).
- **Color:** Implement color ramp interpolation.
- **Policy:** Always render internationally recognized borders of Ukraine per UNGA Resolution 68/262. Crimea and occupied districts must be included, labeled as temporarily occupied.

## Print/A4 Constraints
- Target output is an A4-printable analytical bulletin.
- Ensure CSS `@media print` rules hide interactive elements and format the layout for physical paper dimensions.

## Security
- NEVER hardcode API keys.
- NEVER commit `.env` files.

## Definition of Done
- Feature implemented completely according to requirements.
- Code matches styling and architectural conventions.
- No TypeScript or build errors (if applicable).
- UI translated to `uk-UA`.
- Print view verified for A4 formatting.
