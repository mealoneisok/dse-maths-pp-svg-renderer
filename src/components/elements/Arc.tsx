// src/components/elements/Arc.tsx
import React from "react";
import { Label } from "./Label";
import { type ArcProps } from "./types";
import { normalizeLabel, normalizeDash } from "../../utils/type";
import { LAYOUT } from "../../constants";

export const Arc: React.FC<
  ArcProps & {
    project?: (pt: [number, number]) => [number, number];
    scaleX?: (v: number) => number;
    scaleY?: (v: number) => number;
  }
> = ({
  center,
  radius,
  startAngle,
  endAngle,
  fill = "none",
  stroke = LAYOUT.DEFAULT_COLOR,
  strokeWidth = LAYOUT.DEFAULT_STROKE_WIDTH,
  dash,
  label,
  project,
  scaleX,
  scaleY,
}) => {
  const labelObj = normalizeLabel(label);
  const dashArray = normalizeDash(dash);

  // 🌟 1. 轉換中心點與半徑
  const pxCenter = project ? project(center) : center;
  const rx = scaleX
    ? Math.abs(scaleX(center[0] + radius) - scaleX(center[0]))
    : radius;
  const ry = scaleY
    ? Math.abs(scaleY(center[1] + radius) - scaleY(center[1]))
    : radius;

  // 🌟 2. 轉換起點與終點 (注意 Y 軸的翻轉，因為 scaleY 通常是反向的，但在 project 中已處理，這裡直接依賴 scale 即可)
  const sx = scaleX
    ? scaleX(center[0] + radius * Math.cos(startAngle))
    : center[0] + radius * Math.cos(startAngle);
  const sy = scaleY
    ? scaleY(center[1] + radius * Math.sin(startAngle))
    : center[1] + radius * Math.sin(startAngle);
  const ex = scaleX
    ? scaleX(center[0] + radius * Math.cos(endAngle))
    : center[0] + radius * Math.cos(endAngle);
  const ey = scaleY
    ? scaleY(center[1] + radius * Math.sin(endAngle))
    : center[1] + radius * Math.sin(endAngle);

  // 🌟 3. 計算弧形參數
  let diff = endAngle - startAngle;
  while (diff < 0) diff += 2 * Math.PI;
  const largeArc = diff > Math.PI ? 1 : 0;
  const sweep = 0; // 預設逆時針

  return (
    <g>
      <path
        d={`M ${sx} ${sy} A ${rx} ${ry} 0 ${largeArc} ${sweep} ${ex} ${ey}`}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dashArray}
      />
      {labelObj && <Label pos={labelObj.pos!} {...labelObj} />}
    </g>
  );
};
