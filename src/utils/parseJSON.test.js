import { describe, it, expect } from "vitest";
import { parseJSON } from "./parseJSON";

describe("parseJSON util", () => {
  it("parses clean JSON", () => {
    const raw = '{"test": 123}';
    expect(parseJSON(raw)).toEqual({ test: 123 });
  });

  it("strips markdown json fences", () => {
    const raw = \`\`\`\`json
{
  "key": "value"
}
\`\`\`\`;
    expect(parseJSON(raw)).toEqual({ key: "value" });
  });

  it("handles empty or invalid string gracefully", () => {
    expect(parseJSON("")).toBeNull();
    expect(parseJSON(null)).toBeNull();
    expect(parseJSON(undefined)).toBeNull();
    expect(parseJSON("invalid json string")).toBeNull();
  });
});
