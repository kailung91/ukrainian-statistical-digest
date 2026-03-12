import { useState } from "react";
import { OBLASTS } from "./data/oblasts";
import { toBase64 } from "./utils/pdfToBase64";
import { parseJSON } from "./utils/parseJSON";
import { RAMPS, TOPIC_META, UI_STRINGS } from "./constants/mapConfig";

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
    setStage("processing");
    setFileName(file.name);
    setProgress("Аналіз документа...");
    
    try {
      const base64 = await toBase64(file);
      
      const apiKey = import.meta.env?.VITE_ANTHROPIC_API_KEY;
      
      if (!apiKey) {
        throw new Error("API ключ не знайдено (VITE_ANTHROPIC_API_KEY). Додайте ключ у .env.local.");
      }

      const prompt = `Витягни ключові статистичні показники (ринок праці, торгівля або ВВП) та підготуй підсумок у форматі JSON. 
Поля: topic (одне з: labor, trade, gdp, population), period, docTitle, summary, stats (масив об'єктів {label, value, delta}), oblastData (ключ - snake_case області, значення - {value: number, metric: string}).
Потрібні області: ${Object.keys(OBLASTS).join(", ")}.`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerously-allow-browser": "true"
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: [
                { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } },
                { type: "text", text: prompt }
              ]
            }
          ]
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || \`Помилка сервера: \${res.status}\`);
      }

      const data = await res.json();
      const rawMsg = data.content?.[0]?.text;
      const parsed = parseJSON(rawMsg);
      
      if (!parsed) throw new Error("Не вдалося розпізнати JSON-відповідь.");

      setTopic(parsed.topic || "labor");
      setPeriod(parsed.period || "");
      setDocTitle(parsed.docTitle || "Аналітичний звіт");
      setSummary(parsed.summary || "");
      setStats(parsed.stats || []);
      setOblastData(parsed.oblastData || {});
      
      setStage("ready");
    } catch (err) {
      console.error(err);
      setProgress(err.message || "Сталася помилка при обробці документа.");
      setStage("error");
    }
  };

  if (stage !== "ready") {
    return (
      <UploadScreen 
        onFile={processPDF} 
        stage={stage} 
        progress={progress} 
        fileName={fileName} 
        onRetry={reset} 
      />
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
        OBLASTS={OBLASTS}
        RAMPS={RAMPS}
        TOPIC_META={TOPIC_META}
      />
      
    </div>
  );
}
