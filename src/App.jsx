import { useState } from "react";
import { OBLASTS } from "./data/oblasts";
import { toBase64 } from "./utils/pdfToBase64";
import { parseJSON } from "./utils/parseJSON";
import { RAMPS, TOPIC_META, UI_STRINGS } from "./constants/mapConfig";

import { extractPdf } from "./services/extractPdf.js";
import UploadScreen from "./components/UploadScreen";
import PrintSheet from "./components/PrintSheet";

export default function App() {
  const [stage, setStage] = useState("upload");
  const [progress, setProgress] = useState("");
  const [fileName, setFileName] = useState("");
  const [topic, setTopic] = useState("labor");
  const [oblastData, setOblastData] = useState({});
  const [stats, setStats] = useState([]);
  const [summary, setSummary] = useState("");
  const [period, setPeriod] = useState("");
  const [docTitle, setDocTitle] = useState("");

  const ramp = RAMPS[topic] ?? RAMPS.labor;
  const meta = TOPIC_META[topic] ?? TOPIC_META.labor;

  const vals = Object.values(oblastData)
    .map(d => (typeof d === "object" ? d.value : d))
    .filter(v => typeof v === "number" && isFinite(v));
    
  const minV = vals.length ? Math.min(...vals) : 0;
  const maxV = vals.length ? Math.max(...vals) : 0;

  const top5 = Object.entries(oblastData)
    .map(([k, d]) => ({ 
      k, 
      val: typeof d === "object" ? d.value : d, 
      name: OBLASTS[k]?.name || k 
    }))
    .filter(({k, val}) => typeof val === "number" && isFinite(val) && OBLASTS[k])
    .sort((a, b) => b.val - a.val)
    .slice(0, 5);

  const reset = () => {
    setStage("upload");
    setFileName("");
    setProgress("");
    setOblastData({});
    setStats([]);
    setSummary("");
    setPeriod("");
    setDocTitle("");
  };

  const processPDF = async (file) => {
    setFileName(file.name);
    setStage("processing");
    try {
      const result = await extractPdf(file, setProgress);

      setTopic(result.topic);
      setPeriod(result.period);
      setDocTitle(result.title);
      setOblastData(result.oblastData);
      setStats(result.stats);
      setSummary(result.summary);

      // Override TOPIC_META display values if model returned them
      if (TOPIC_META[result.topic]) {
        if (result.unit)        TOPIC_META[result.topic].unit        = result.unit;
        if (result.description) TOPIC_META[result.topic].description = result.description;
        if (result.title)       TOPIC_META[result.topic].label       = result.title;
      }

      setStage("ready");
    } catch (err) {
      console.error(err);
      setProgress(err.message ?? "Невідома помилка");
      setStage("error");
    }
  };

  const handleMockDevTest = () => {
    setTopic("labor");
    setPeriod("Q1 2025 (тест)");
    setDocTitle("Тестові дані");
    setOblastData({
      kyiv_city: 8.2, lviv: 10.1, dnipro: 12.4, kharkiv: 9.8,
      odessa: 11.3, poltava: 13.1, sumy: 15.6, chernihiv: 14.2,
      vinnytsia: 10.9, ternopil: 12.0,
    });
    setStats([
      { label: "Середній рівень", value: "11,8%", delta: "+0,4%" },
      { label: "Мін. значення",   value: "8,2%",  delta: null   },
      { label: "Макс. значення",  value: "15,6%", delta: null   },
      { label: "Охоплено областей", value: "10",  delta: null   },
    ]);
    setSummary("Тестовий підсумок. Карта рендериться з мок-даними для перевірки всіх компонентів.");
    setStage("ready");
  };

  if (stage !== "ready") {
    return (
      <div style={{ position: "relative" }}>
        {import.meta.env.DEV && stage === "upload" && (
          <button
            onClick={handleMockDevTest}
            style={{ position: "absolute", top: 16, left: 16, padding: "6px 16px", background: "#2a4a2c", color: "#8aaa8c",
                     border: "1px solid #3a6a3c", borderRadius: 3, fontSize: 11, cursor: "pointer", zIndex: 10 }}
          >
            [DEV] Тест з мок-даними
          </button>
        )}
        <UploadScreen 
          onFile={processPDF} 
          stage={stage} 
          progress={progress} 
          fileName={fileName} 
          onRetry={reset} 
        />
      </div>
    );
  }

  return (
    <div style={{ background: "#0f0f0f", minHeight: "100vh", padding: "40px 20px" }}>
      
      {/* Controls Bar */}
      <div id="ctrl" style={{ 
        maxWidth: 960, margin: "0 auto 20px auto", padding: "15px 20px", 
        background: "#1a1a1a", border: "1px solid #333", borderRadius: 8,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontFamily: "'EB Garamond', serif"
      }}>
        <div style={{ color: "#aaa" }}>
          <div><strong style={{ color: "#e8d5a3", fontSize: 16 }}>Файл:</strong> {fileName}</div>
        </div>
        <div style={{ display: "flex", gap: 15 }}>
          <button 
            onClick={reset}
            style={{ background: "transparent", color: "#e8d5a3", border: "1px solid #e8d5a3", padding: "8px 16px", borderRadius: 4, cursor: "pointer", fontFamily: "inherit" }}
          >
            {UI_STRINGS.btn_new}
          </button>
          <button 
            onClick={() => window.print()}
            style={{ background: "#e8d5a3", color: "#111", border: "none", padding: "8px 16px", borderRadius: 4, cursor: "pointer", fontFamily: "inherit", fontWeight: "600" }}
          >
            {UI_STRINGS.btn_print}
          </button>
        </div>
      </div>

      <PrintSheet 
        topic={topic} 
        oblastData={oblastData} 
        stats={stats} 
        summary={summary} 
        period={period} 
        docTitle={docTitle} 
        fileName={fileName}
        ramp={ramp}
        meta={meta}
        minV={minV}
        maxV={maxV}
        top5={top5}
        OBLASTS={OBLASTS}
      />
      
    </div>
  );
}
