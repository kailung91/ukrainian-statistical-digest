import { UI_STRINGS } from "../constants/mapConfig";

export default function Legend({ ramp, minV, maxV, unit }) {
  const gradient = `linear-gradient(to right, ${ramp.join(", ")})`;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 15, fontSize: 13, marginTop: 10 }}>
      <span>{minV.toLocaleString("uk-UA")}</span>
      <div style={{ width: 150, height: 12, background: gradient, borderRadius: 2 }} />
      <span>{maxV.toLocaleString("uk-UA")} {unit}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginLeft: 20 }}>
        <div style={{ width: 12, height: 12, background: "#d4d0c8", borderRadius: 2 }} />
        <span>{UI_STRINGS.no_data}</span>
      </div>
    </div>
  );
}
