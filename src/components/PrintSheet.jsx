import MapView from "./MapView";
import Legend from "./Legend";
import Top5Bars from "./Top5Bars";
import StatsGrid from "./StatsGrid";
import SummaryBlock from "./SummaryBlock";
import Disclaimer from "./Disclaimer";

export default function PrintSheet({ topic, oblastData, stats, summary, period, docTitle, fileName, OBLASTS, RAMPS, TOPIC_META }) {
  const meta = TOPIC_META[topic];
  const ramp = RAMPS[topic];

  const vals = Object.values(oblastData).map(d => d?.value).filter(v => typeof v === "number" && !isNaN(v));
  const minV = vals.length ? Math.min(...vals) : 0;
  const maxV = vals.length ? Math.max(...vals) : 0;

  return (
    <div id="sheet" style={{ 
      background: "#fff", 
      color: "#111", 
      maxWidth: 960, 
      margin: "0 auto", 
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      fontFamily: "'EB Garamond', serif"
    }}>
      <style>{`
        @media print {
          body { background: #fff; }
          #ctrl { display: none; }
          #sheet { width: 210mm; box-shadow: none; max-width: none; margin: 0; }
        }
      `}</style>
      
      {/* Header */}
      <div style={{ background: "#172017", color: "#f0ede4", padding: "30px 40px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 32, margin: "0 0 5px 0", fontWeight: "600", color: "#e8d5a3" }}>
            {docTitle || "Статистичний дайджест"}
          </h1>
          <div style={{ fontSize: 18, opacity: 0.9 }}>
            {meta.label} · {period || "Дані відсутні"}
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: 14, opacity: 0.8 }}>
          <div>Документ: {fileName}</div>
          <div>Згенеровано: {new Date().toLocaleDateString("uk-UA")}</div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: "flex", padding: 40, gap: 40 }}>
        
        {/* Left Col (Map + Legend + Bars) */}
        <div style={{ width: 480, flexShrink: 0 }}>
          <h2 style={{ fontSize: 22, borderBottom: "2px solid #333", paddingBottom: 10, marginBottom: 20 }}>
            {meta.description}
          </h2>
          
          <MapView oblastData={oblastData} ramp={ramp} unit={meta.unit} OBLASTS={OBLASTS} />
          <Legend ramp={ramp} minV={minV} maxV={maxV} unit={meta.unit} />
          <Top5Bars oblastData={oblastData} ramp={ramp} unit={meta.unit} OBLASTS={OBLASTS} />
        </div>

        {/* Right Col (Stats + Summary + Disclaimer) */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <StatsGrid stats={stats} />
          
          <div style={{ flex: 1 }}>
            <SummaryBlock summary={summary} aiLabel={true} />
          </div>
          
          <Disclaimer />
        </div>
      </div>
      
      {/* Footer */}
      <div style={{ background: "#172017", padding: "15px 40px", color: "#888", fontSize: 13, display: "flex", justifyContent: "space-between" }}>
        <span>Аналітична платформа Державної служби статистики України</span>
        <span>© {new Date().getFullYear()} Держстат</span>
      </div>
    </div>
  );
}
