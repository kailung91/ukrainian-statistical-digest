export function parseJSON(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch {
    return null;
  }
}
