import { useState } from "react";
import { UI_STRINGS } from "../constants/mapConfig";

export default function UploadScreen({ onFile, stage, progress, fileName, onRetry }) {
  const [drag, setDrag] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    if (stage !== "upload") return;
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") onFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (stage === "upload") setDrag(true);
  };

  const handleDragLeave = () => setDrag(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") onFile(file);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "#0f0f0f",
        color: "#555",
        fontFamily: "'EB Garamond', serif",
      }}
    >
      <style>{`
        @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          width: 400,
          padding: 40,
          border: \`2px dashed \${drag ? "#e8d5a3" : "#333"}\`,
          borderRadius: 8,
          textAlign: "center",
          animation: "fade 0.5s ease-in",
          position: "relative",
          cursor: stage === "upload" ? "pointer" : "default",
          background: drag ? "#1a1a1a" : "transparent",
        }}
        onClick={() => stage === "upload" && document.getElementById("pdf-upload").click()}
      >
        {stage === "upload" && (
          <>
            <h2 style={{ color: "#e8d5a3", marginBottom: 10 }}>{UI_STRINGS.uploadTitle}</h2>
            <p>{UI_STRINGS.uploadDesc}</p>
            <input
              id="pdf-upload"
              type="file"
              accept="application/pdf"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </>
        )}

        {stage === "processing" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                width: 30,
                height: 30,
                border: "3px solid #333",
                borderTopColor: "#e8d5a3",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                marginBottom: 20,
              }}
            />
            <p style={{ color: "#e8d5a3", marginBottom: 5 }}>{progress}</p>
            <p style={{ fontSize: 14 }}>{fileName}</p>
          </div>
        )}

        {stage === "error" && (
          <div style={{ color: "#ef4444" }}>
            <p style={{ marginBottom: 20 }}>{progress}</p>
            <button
              onClick={onRetry}
              style={{
                background: "#ef4444",
                color: "#fff",
                border: "none",
                padding: "8px 16px",
                borderRadius: 4,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {UI_STRINGS.retry}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
