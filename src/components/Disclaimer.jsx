import { UI_STRINGS } from "../constants/mapConfig";

export default function Disclaimer() {
  return (
    <div style={{ marginTop: 30, paddingTop: 15, borderTop: "1px solid #d4d0c8", fontSize: 12, color: "#666", lineHeight: 1.5 }}>
      {UI_STRINGS.disclaimer.text1}
      <strong style={{ color: "#333" }}>{UI_STRINGS.disclaimer.bold1}</strong>
      {UI_STRINGS.disclaimer.text2}
      <a href="https://ukrstat.gov.ua" style={{ color: "#333", fontWeight: "600", textDecoration: "none" }}>{UI_STRINGS.disclaimer.bold2}</a>
      {UI_STRINGS.disclaimer.text3}
    </div>
  );
}
