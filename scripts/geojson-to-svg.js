#!/usr/bin/env node
// scripts/geojson-to-svg.js
// Converts GADM GeoJSON (level 1) → src/data/oblasts.js
// Zero npm dependencies — Node.js built-ins only
// Usage: node scripts/geojson-to-svg.js

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = resolve(__dirname, "..");

// ── Sources ───────────────────────────────────────────────────────────────────
const INPUT  = resolve(ROOT, "data/gadm41_UKR_1.json");
const OUTPUT = resolve(ROOT, "src/data/oblasts.js");

// ── ViewBox ───────────────────────────────────────────────────────────────────
const VB = { x: -20, y: 40, w: 910, h: 510 };

// ── Ukraine bounding box (WGS84) ──────────────────────────────────────────────
const LON_MIN = 22.1, LON_MAX = 40.2;
const LAT_MIN = 44.4, LAT_MAX = 52.4;

// ── Mercator projection ───────────────────────────────────────────────────────
function mercLat(deg) {
  const r = (deg * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + r / 2));
}
const LAT_M_MIN = mercLat(LAT_MIN);
const LAT_M_MAX = mercLat(LAT_MAX);

function project(lon, lat) {
  const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * VB.w + VB.x;
  const y = (1 - (mercLat(lat) - LAT_M_MIN) / (LAT_M_MAX - LAT_M_MIN)) * VB.h + VB.y;
  return [+x.toFixed(1), +y.toFixed(1)];
}

// ── Path builders ─────────────────────────────────────────────────────────────
function ringToPath(ring) {
  return (
    ring
      .map(([lon, lat], i) => {
        const [x, y] = project(lon, lat);
        return `${i === 0 ? "M" : "L"} ${x},${y}`;
      })
      .join(" ") + " Z"
  );
}

function geometryToPath(geometry) {
  if (geometry.type === "Polygon") {
    return ringToPath(geometry.coordinates[0]);
  }
  if (geometry.type === "MultiPolygon") {
    // Use the largest polygon by vertex count
    const rings = geometry.coordinates.map((p) => p[0]);
    const largest = rings.reduce((a, b) => (a.length >= b.length ? a : b));
    return ringToPath(largest);
  }
  throw new Error(`Unsupported geometry: ${geometry.type}`);
}

function centroid(ring) {
  const pts = ring.map(([lon, lat]) => project(lon, lat));
  const cx = pts.reduce((s, [x]) => s + x, 0) / pts.length;
  const cy = pts.reduce((s, [, y]) => s + y, 0) / pts.length;
  return [+cx.toFixed(1), +cy.toFixed(1)];
}

function getCentroidRing(geometry) {
  if (geometry.type === "Polygon") return geometry.coordinates[0];
  const rings = geometry.coordinates.map((p) => p[0]);
  return rings.reduce((a, b) => (a.length >= b.length ? a : b));
}

// ── GADM NAME_1 → project key mapping ────────────────────────────────────────
// Source: GADM 4.1 Ukraine, NAME_1 field values
const NAME_TO_KEY = {
  "Cherkasy":              "cherkasy",
  "Chernihiv":             "chernihiv",
  "Chernivtsi":            "chernivtsi",
  "Crimea":                "crimea",
  "Dnipropetrovsk":        "dnipro",
  "Donetsk":               "donetsk",
  "Ivano-Frankivsk":       "ivanofrankivsk",
  "Kharkiv":               "kharkiv",
  "Kherson":               "kherson",
  "Khmelnytskyi":          "khmelnytsky",
  "Kiev":                  "kyiv_obl",
  "Kiev City":             "kyiv_city",
  "Kirovohrad":            "kirovohrad",
  "Luhansk":               "luhansk",
  "Lviv":                  "lviv",
  "Mykolaiv":              "mykolaiv",
  "Odessa":                "odessa",
  "Poltava":               "poltava",
  "Rivne":                 "rivne",
  "Sumy":                  "sumy",
  "Ternopil":              "ternopil",
  "Vinnytsia":             "vinnytsia",
  "Volyn":                 "volyn",
  "Zakarpattia":           "zakarpattia",
  "Zaporizhzhia":          "zaporizhzhia",
  // VARNAME_1 alternates — add below if NAME_1 lookup fails
  "Khmel'nyts'ka":         "khmelnytsky",
  "Kyiv":                  "kyiv_obl",
  "Kyiv City":             "kyiv_city",
  "Vinnyts'ka":            "vinnytsia",
  "Volyns'ka":             "volyn",
  "Dnipropetrovs'ka":      "dnipro",
  "Dnipropetrovs'k":       "dnipro",
  "Zhytomyr":              "zhytomyr",
  "Zhytomyrs'ka":          "zhytomyr",
  "Donets'k":              "donetsk",
  "Ivano-Frankivs'k":      "ivanofrankivsk",
  "Khmel'nyts'kyy":        "khmelnytsky",
  "KievCity":              "kyiv_city",
  "L'viv":                 "lviv",
  "Luhans'k":              "luhansk",
  "Mykolayiv":             "mykolaiv",
  "Ternopil'":             "ternopil",
  "Vinnytsya":             "vinnytsia",
  "Zaporizhia":            "zaporizhzhia"
};

const DISPLAY_NAMES = {
  vinnytsia:      "Вінницька",
  volyn:          "Волинська",
  dnipro:         "Дніпропетровська",
  donetsk:        "Донецька",
  zhytomyr:       "Житомирська",
  zakarpattia:    "Закарпатська",
  zaporizhzhia:   "Запорізька",
  ivanofrankivsk: "Івано-Франківська",
  kyiv_obl:       "Київська",
  kirovohrad:     "Кіровоградська",
  luhansk:        "Луганська",
  lviv:           "Львівська",
  mykolaiv:       "Миколаївська",
  odessa:         "Одеська",
  poltava:        "Полтавська",
  rivne:          "Рівненська",
  sumy:           "Сумська",
  ternopil:       "Тернопільська",
  kharkiv:        "Харківська",
  kherson:        "Херсонська",
  khmelnytsky:    "Хмельницька",
  cherkasy:       "Черкаська",
  chernivtsi:     "Чернівецька",
  chernihiv:      "Чернігівська",
  kyiv_city:      "м. Київ",
  crimea:         "АР Крим",
};

// ── Main ──────────────────────────────────────────────────────────────────────
const geojson = JSON.parse(readFileSync(INPUT, "utf8"));
const result  = {};
const missing = [];
const matched = [];

for (const feature of geojson.features) {
  const p    = feature.properties;
  // GADM 4.1 uses NAME_1 — try multiple fallbacks
  const name = p.NAME_1 ?? p.name ?? p.NAME ?? p.shapeName;
  const key  = NAME_TO_KEY[name];

  if (!key) {
    missing.push(`"${name}" (GID: ${p.GID_1 ?? "?"})`);
    continue;
  }

  const ring = getCentroidRing(feature.geometry);
  result[key] = {
    name:   DISPLAY_NAMES[key],
    center: centroid(ring),
    d:      geometryToPath(feature.geometry),
  };
  matched.push(`  ${key.padEnd(16)} ← "${name}"`);
}

// ── Validation ────────────────────────────────────────────────────────────────
const CANONICAL = Object.keys(DISPLAY_NAMES);
const generated = Object.keys(result);
const absent    = CANONICAL.filter((k) => !generated.includes(k));

console.log("\n── Matched ──────────────────────────────");
matched.forEach((m) => console.log(m));

if (missing.length) {
  console.warn("\n⚠ Unmatched GeoJSON names — add to NAME_TO_KEY:");
  missing.forEach((m) => console.warn("  ", m));
}
if (absent.length) {
  console.warn("\n⚠ Missing oblast keys in output:");
  absent.forEach((k) => console.warn("  ", k));
}

console.log(`\n✓ Generated ${generated.length} / 25 oblasts`);
if (generated.length < 25) {
  console.error("✗ INCOMPLETE — fix NAME_TO_KEY mapping and re-run");
  process.exit(1);
}
console.log("✓ All 25 present\n");

// ── Write output ──────────────────────────────────────────────────────────────
const header = `// src/data/oblasts.js
// AUTO-GENERATED — do not edit manually
// Source: GADM 4.1 Ukraine (gadm41_UKR_1.json)
// Projection: WGS84 → Mercator, viewBox ${VB.x} ${VB.y} ${VB.w} ${VB.h}
// Borders: internationally recognized per UNGA Resolution 68/262
// Generated: ${new Date().toISOString()}
`;

const body = `export const OBLASTS = ${JSON.stringify(result, null, 2)};\n`;

writeFileSync(OUTPUT, header + "\n" + body, "utf8");
console.log(`✓ Written → ${OUTPUT}\n`);
