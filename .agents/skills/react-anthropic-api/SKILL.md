---
name: react-anthropic-api
description: Call Anthropic Messages API from React artifacts
---

# Skill: React Anthropic API Integration

## Fetch Pattern
- Use the native `fetch` API directly from React artifacts to call the backend proxy or Anthropic API.
- Do not use bloated external SDKs. Ensure CORS safety if calling directly from client, though going via proxy is standard.

## File Encoding
- For reading local PDFs or uploads, encode files as Base64 strings.
- Provide them as `document` blocks to the Messages API.

## JSON Response Parsing
- Configure API to output strict JSON where possible.
- Safely strip markdown formatting fences (e.g. ` ```json...``` `) before calling `JSON.parse()`.

## Error State Management
- Manage `loading`, `error`, and `idle` states explicitly.
- Display user-friendly localized (`uk-UA`) error messages.

## Token Guidance
- Set `max_tokens: 1000` (or appropriate limit) for structured JSON data extraction to ensure efficiency.
