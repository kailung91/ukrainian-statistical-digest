export default function StatsGrid({ stats }) {
  if (!stats || !stats.length) return null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginBottom: 20 }}>
      {stats.map((s, i) => {
        const isMain = i === 0;
        const bg = isMain ? "#172017" : "#ede8da";
        const fg = isMain ? "#f0ede4" : "#111";
        const valCol = isMain ? "#e8d5a3" : "#333";
        let deltaColor = "#666";
        if (s.delta?.includes("+")) deltaColor = isMain ? "#4ade80" : "#16a34a";
        if (s.delta?.includes("-")) deltaColor = isMain ? "#f87171" : "#dc2626";

        return (
          <div key={i} style={{ background: bg, color: fg, padding: 20, borderRadius: 8 }}>
            <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 5 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: "600", color: valCol }}>{s.value}</div>
            {s.delta && (
              <div style={{ fontSize: 13, color: deltaColor, marginTop: 5, fontWeight: "500" }}>
                {s.delta}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
