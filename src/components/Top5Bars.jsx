export default function Top5Bars({ top5, ramp, unit, minV, maxV, OBLASTS }) {
  if (!top5?.length) return null;

  const range = maxV === minV ? 1 : maxV - minV;

  return (
    <div style={{ marginTop: 25 }}>
      <h4 style={{ marginBottom: 15, fontSize: 16 }}>ТОП-5 Регіонів</h4>
      {top5.map((item, idx) => {
        const pct = ((item.val - minV) / range) * 100;
        const width = Math.max(5, pct); // min width 5%
        
        return (
          <div key={item.k} style={{ display: "flex", alignItems: "center", marginBottom: 8, fontSize: 14 }}>
            <span style={{ width: 20, color: "#888" }}>{idx + 1}.</span>
            <span style={{ width: 120, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {item.name}
            </span>
            <div style={{ flex: 1, height: 16, background: "#e5e5e5", borderRadius: 2, marginRight: 10, position: "relative" }}>
              <div 
                style={{ 
                  position: "absolute", top: 0, left: 0, height: "100%", width: `${width}%`, 
                  background: ramp[3], borderRadius: 2 
                }} 
              />
            </div>
            <span style={{ width: 60, textAlign: "right", fontWeight: "600" }}>
              {item.val.toLocaleString("uk-UA")}
            </span>
          </div>
        );
      })}
    </div>
  );
}
