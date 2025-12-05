import React from "react";

/*
  Props:
   - data: array of numbers
   - labels: array of labels (optional)
   - height, width
*/
export default function LineChart({ data = [], labels = [], height = 180, width = 800 }) {
  if (!data || data.length === 0) return <div className="text-gray-400">No data</div>;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const padding = 20;
  const w = width;
  const h = height;
  const stepX = (w - padding * 2) / (data.length - 1 || 1);

  const toX = (i) => padding + i * stepX;
  const toY = (v) => {
    if (max === min) return h / 2;
    return padding + (1 - (v - min) / (max - min)) * (h - padding * 2);
  };

  const points = data.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="xMidYMid meet">
      <rect x="0" y="0" width={w} height={h} fill="transparent" />
      {/* grid lines */}
      {[0.25,0.5,0.75].map((t, idx) => (
        <line key={idx} x1={padding} x2={w-padding} y1={padding + t*(h - padding*2)} y2={padding + t*(h - padding*2)} stroke="#e6e7ea" strokeDasharray="4 4" />
      ))}
      {/* polyline */}
      <polyline points={points} fill="none" stroke="#177a3a" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {/* dots */}
      {data.map((v,i)=>(
        <circle key={i} cx={toX(i)} cy={toY(v)} r="3.5" fill="#177a3a" />
      ))}
      {/* labels */}
      {labels && labels.length > 0 && labels.map((lab,i)=>(
        <text key={i} x={toX(i)} y={h - 6} textAnchor="middle" fontSize="10" fill="#9ca3af">{lab}</text>
      ))}
    </svg>
  );
}
