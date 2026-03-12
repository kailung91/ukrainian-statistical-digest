---
name: ukrstat-pdf-analyst
description: Extract structured JSON from Держстат PDF via Anthropic API
---

# Skill: Ukrstat PDF Analyst

## Objective
Extract structured JSON from Держстат (State Statistics Service of Ukraine) PDF reports via Anthropic API (claude-sonnet-4-6).

## Prompt Template
```
You are an expert data analyst specializing in Ukrainian statistical operations. 
Extract the following statistical domains from the provided document into a structured JSON format:
- Labor market
- Trade
- GDP/GRP
- Population

Map all regions to the corresponding snake_case oblast keys. Skip sections irrelevant to these domains.
```

## Expected JSON Schema
```json
{
  "domain": "string (e.g., 'labor_market')",
  "period": "string",
  "data": {
    "oblast_key": {
      "value": "number",
      "metric": "string",
      "notes": "string (optional)"
    }
  }
}
```

## Oblast Key Validation
Enforce these exact snake_case keys:
`vinnytsia`, `volyn`, `dnipro`, `donetsk`, `zhytomyr`, `zakarpattia`, `zaporizhzhia`, `ivanofrankivsk`, `kyiv_obl`, `kirovohrad`, `luhansk`, `lviv`, `mykolaiv`, `odessa`, `poltava`, `rivne`, `sumy`, `ternopil`, `kharkiv`, `kherson`, `khmelnytsky`, `cherkasy`, `chernivtsi`, `chernihiv`, `kyiv_city`, `crimea`.

## Error Handling & Fallbacks
- If a region's data is missing in the PDF, omit the key or set value to `null`.
- Catch JSON parsing errors and strip markdown fences before `JSON.parse`.
- Implement fallback values for missing structured data gracefully so the map does not hard crash.
