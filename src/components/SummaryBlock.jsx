import { UI_STRINGS } from "../constants/mapConfig";

export default function SummaryBlock({ summary, aiLabel }) {
  return (
    <div style={{ background: "#ede8da", padding: 20, borderRadius: 8, marginTop: 20 }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 15 }}>
        <h3 style={{ fontSize: 18, margin: 0 }}>Аналітичний підсумок</h3>
        {aiLabel && (
          <span style={{ 
            marginLeft: 10, fontSize: 11, background: "#d1c9b6", padding: "2px 6px", 
            borderRadius: 4, textTransform: "uppercase", letterSpacing: 0.5 
          }}>
            {UI_STRINGS.ai_label}
          </span>
        )}
      </div>
      
      {summary ? (
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "#222" }}>
          {summary}
        </p>
      ) : (
        <p style={{ fontSize: 15, color: "#888", fontStyle: "italic" }}>
          {UI_STRINGS.no_summary}
        </p>
      )}
    </div>
  );
}
