"use client";

import React, { useState } from "react";

type ChartDataPoint = {
  label: string;
  value: number;
};

type TelemetryChartProps = {
  title: string;
  subtitle: string;
  data: ChartDataPoint[];
};

export default function TelemetryChart({
  title,
  subtitle,
  data,
}: TelemetryChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState(data.length - 1);

  const width = 620;
  const height = 210;
  const padX = 28;
  const padY = 24;
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  const points = data.map((d, i) => {
    const x = padX + (i * (width - padX * 2)) / Math.max(data.length - 1, 1);
    const y = height - padY - (d.value / maxVal) * (height - padY * 2);
    return { ...d, x, y };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${
          height - padY
        } L ${points[0].x} ${height - padY} Z`
      : "";

  const activePoint = points[hoveredIdx] || points[0];

  return (
    <div className="rounded-2xl specular-card p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          <p className="text-xs text-[var(--text-secondary)]">{subtitle}</p>
        </div>

        {activePoint && (
          <div className="rounded-xl border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/10 px-3.5 py-1.5 text-right">
            <div className="text-[11px] text-[var(--text-secondary)]">
              {activePoint.label}
            </div>
            <div className="font-mono text-sm font-bold text-[var(--accent-cyan)]">
              ${activePoint.value.toLocaleString()}
            </div>
          </div>
        )}
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full overflow-visible"
      >
        <defs>
          <linearGradient id="aetherisArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7aa2f7" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#7aa2f7" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = height - padY - ratio * (height - padY * 2);

          return (
            <line
              key={ratio}
              x1={padX}
              y1={y}
              x2={width - padX}
              y2={y}
              stroke="var(--border-hairline)"
              strokeDasharray="4 4"
            />
          );
        })}

        <path d={areaPath} fill="url(#aetherisArea)" />
        <path
          d={linePath}
          fill="none"
          stroke="#7aa2f7"
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        {points.map((p, idx) => (
          <g
            key={p.label}
            className="cursor-pointer"
            onMouseEnter={() => setHoveredIdx(idx)}
          >
            <circle
              cx={p.x}
              cy={p.y}
              r={hoveredIdx === idx ? 6.5 : 4}
              fill={hoveredIdx === idx ? "#7dcfff" : "#0a0e14"}
              stroke="#7aa2f7"
              strokeWidth="2.5"
            />
            <text
              x={p.x}
              y={height - 4}
              textAnchor="middle"
              className="fill-[var(--text-secondary)] font-mono text-[11px]"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
