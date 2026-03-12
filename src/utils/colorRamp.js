export function hexRgb(h) {
  let ht = h.replace("#", "");
  if (ht.length === 3) ht = ht.split("").map((c) => c + c).join("");
  const num = parseInt(ht, 16);
  return [num >> 16, (num >> 8) & 255, num & 255];
}

export function lerpN(a, b, t) {
  return a + (b - a) * t;
}

export function rampColor(ramp, t) {
  const st = Math.max(0, Math.min(1, t));
  const segments = ramp.length - 1;
  const rawIdx = st * segments;
  const idx = Math.min(Math.floor(rawIdx), segments - 1);
  const factor = rawIdx - idx;
  
  const c1 = hexRgb(ramp[idx]);
  const c2 = hexRgb(ramp[idx + 1]);
  
  const r = Math.round(lerpN(c1[0], c2[0], factor));
  const g = Math.round(lerpN(c1[1], c2[1], factor));
  const b = Math.round(lerpN(c1[2], c2[2], factor));
  
  return `rgb(${r},${g},${b})`;
}

export function obColor(val, ramp, min, max) {
  if (val == null) return "#d4d0c8"; // no data
  if (min === max) return rampColor(ramp, 0.5);
  const t = (val - min) / (max - min);
  const clamped = Math.max(0, Math.min(1, t));
  return rampColor(ramp, clamped);
}
