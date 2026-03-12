import { useState, useRef, useEffect } from "react";
import { obColor } from "../utils/colorRamp";
import { UI_STRINGS } from "../constants/mapConfig";

export default function MapView({ oblastData, ramp, unit, minV, maxV, OBLASTS }) {
  const [hovered, setHovered] = useState(null);
  const [ttPos, setTtPos] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  const handleMouseMove = (e, key) => {
    if (!svgRef.current) return;
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svgRef.current.getScreenCTM().inverse());
    
    // Clamp tooltip
    const clampX = Math.min(Math.max(svgP.x, -10), 800);
    const clampY = Math.max(svgP.y - 40, 50);
    
    setHovered(key);
    setTtPos({ x: clampX, y: clampY });
  };

  const handleMouseLeave = () => setHovered(null);

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <style>{`
        .ob { transition: opacity 0.2s, stroke 0.2s; cursor: crosshair; }
        .ob:hover { stroke: #000; stroke-width: 2; opacity: 0.9; }
        @media print { .tt { display: none; } }
      `}</style>
      
      <svg ref={svgRef} viewBox="-20 40 930 510" width="100%">
        <rect x="-20" y="40" width="930" height="510" fill="#ddd8ca" />
        
        {Object.entries(OBLASTS).map(([key, info]) => {
          const rawVal = oblastData[key];
          const val = typeof rawVal === "object" ? rawVal.value : rawVal;
          const fill = obColor(val, ramp, minV, maxV);
          return (
            <path
              key={key}
              data-key={key}
              className="ob"
              d={info.d}
              fill={fill}
              stroke="#fff"
              strokeWidth="0.5"
              onMouseMove={(e) => handleMouseMove(e, key)}
              onMouseLeave={handleMouseLeave}
            />
          );
        })}

        {hovered && OBLASTS[hovered] && (
          <g className="tt" transform={`translate(${ttPos.x}, ${ttPos.y})`}>
            <rect x="-10" y="-30" width="160" height="45" fill="#172017" rx="4" opacity="0.9" />
            <text x="0" y="-14" fill="#fff" fontSize="14" fontWeight="600">
              {OBLASTS[hovered].name}
            </text>
            <text x="0" y="5" fill="#e8d5a3" fontSize="14">
              {oblastData[hovered]?.value != null 
                ? `${oblastData[hovered].value.toLocaleString("uk-UA")} ${unit}`
                : UI_STRINGS.no_data}
            </text>
          </g>
        )}

        <text x="10" y="540" fontSize="12" fill="#888" fontFamily="'EB Garamond', serif">
          * АР Крим та окремі райони включно, статус: тимчасово окуповані.
        </text>
      </svg>
      {Object.keys(oblastData).length === 0 && (
        <div style={{
          fontSize: 10,
          color: "#8a8070",
          fontStyle: "italic",
          textAlign: "center",
          marginTop: 4,
          padding: "6px 0",
        }}>
          Регіональна розбивка у цьому документі відсутня — карта не забарвлена
        </div>
      )}
    </div>
  );
}
