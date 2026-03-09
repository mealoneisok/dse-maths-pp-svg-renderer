// src/components/elements/Sector.tsx

import React from "react";
import { Label } from "./Label";
import { type SectorProps, type Vector2 } from "./types";
import { normalizeLabel, normalizeDash, normalizeFill } from "../../utils/type";
import { PatternFill } from "./PatternFill";
import { LAYOUT } from "../../constants";

export const Sector: React.FC<
  SectorProps & {
    project?: (pt: Vector2) => Vector2;
    scale?: number;
  }
> = ({
  center,
  radius,
  rx,
  ry,
  startAngle,
  endAngle,
  fill = "none",
  stroke = LAYOUT.DEFAULT_COLOR,
  strokeWidth = LAYOUT.DEFAULT_STROKE_WIDTH,
  dash,
  label,
  project,
  scale = 1,
}) => {
  const labelObj = normalizeLabel(label);
  const dashArray = normalizeDash(dash);
  const { fillValue, patternDef } = normalizeFill(fill);

  // 1. 解析長短軸與投影中心點
  const actualRx = rx ?? radius ?? 0;
  const actualRy = ry ?? radius ?? actualRx;
  const pxCenter = project ? project(center) : center;
  const pxRx = actualRx * scale;
  const pxRy = actualRy * scale;

  // 2. 計算 2D 畫布上的起終點 (與 Arc 邏輯相同)
  const [sx, sy] = project
    ? project([
        center[0] + actualRx * Math.cos(startAngle),
        center[1] + actualRy * Math.sin(startAngle),
      ])
    : [
        center[0] + actualRx * Math.cos(startAngle),
        center[1] + actualRy * Math.sin(startAngle),
      ];

  const [ex, ey] = project
    ? project([
        center[0] + actualRx * Math.cos(endAngle),
        center[1] + actualRy * Math.sin(endAngle),
      ])
    : [
        center[0] + actualRx * Math.cos(endAngle),
        center[1] + actualRy * Math.sin(endAngle),
      ];

  // 3. 計算弧形參數
  let diff = endAngle - startAngle;
  while (diff < 0) diff += 2 * Math.PI;
  const largeArc = diff > Math.PI ? 1 : 0;
  // SVG 的 sweep-flag，因為我們已經交給 project 處理 Y 軸翻轉，這裡通常設為 0 (逆時針)
  const sweep = 0;

  // 構建扇形 Path (從圓心出發 -> 畫直線到起點 -> 畫圓弧到終點 -> 封閉回到圓心)
  const pathD = `M ${pxCenter[0]} ${pxCenter[1]} L ${sx} ${sy} A ${pxRx} ${pxRy} 0 ${largeArc} ${sweep} ${ex} ${ey} Z`;

  // 標籤預設放在扇形幾何中心 (角平分線上，距離圓心約 2/3 半徑處)
  const midAngle = startAngle + diff / 2;
  const pxLabelPos = labelObj?.pos
    ? project
      ? project(labelObj.pos)
      : labelObj.pos
    : project
      ? project([
          center[0] + actualRx * 0.6 * Math.cos(midAngle),
          center[1] + actualRy * 0.6 * Math.sin(midAngle),
        ])
      : [
          center[0] + actualRx * 0.6 * Math.cos(midAngle),
          center[1] + actualRy * 0.6 * Math.sin(midAngle),
        ];

  return (
    <g>
      {patternDef && (
        <defs>
          <PatternFill {...patternDef} />
        </defs>
      )}
      <path
        d={pathD}
        fill={fillValue}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dashArray}
        strokeLinejoin="round" // 讓圓心尖角更滑順
      />
      {labelObj && <Label pos={pxLabelPos as Vector2} {...labelObj} />}
    </g>
  );
};
