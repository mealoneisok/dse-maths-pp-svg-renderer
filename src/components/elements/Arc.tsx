// src/components/elements/Arc.tsx
import React from "react";
import { Label } from "./Label";
import { type ArcProps, type Vector2 } from "./types";
import { normalizeLabel, normalizeDash } from "../../utils/type";
import { LAYOUT } from "../../constants";

export const Arc: React.FC<
  ArcProps & {
    project?: (pt: Vector2) => Vector2;
    scale?: number;
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
  scale,
}) => {
  const labelObj = normalizeLabel(label);
  const dashArray = normalizeDash(dash);

  // 轉換中心點與半徑
  const pxCenter = project ? project(center) : center;
  const rx = scale ? radius * scale : radius;
  const [sx, sy] = project
    ? project([
        center[0] + radius * Math.cos(startAngle),
        center[1] + radius * Math.sin(startAngle),
      ])
    : [
        center[0] + radius * Math.cos(startAngle),
        center[1] + radius * Math.sin(startAngle),
      ];

  const [ex, ey] = project
    ? project([
        center[0] + radius * Math.cos(endAngle),
        center[1] + radius * Math.sin(endAngle),
      ])
    : [
        center[0] + radius * Math.cos(endAngle),
        center[1] + radius * Math.sin(endAngle),
      ];

  // 標籤投影
  const pxLabelPos = labelObj?.pos
    ? project
      ? project(labelObj.pos)
      : labelObj.pos
    : pxCenter;

  // 計算弧形參數
  let diff = endAngle - startAngle;
  while (diff < 0) diff += 2 * Math.PI;
  const largeArc = diff > Math.PI ? 1 : 0;

  return (
    <g>
      <path
        d={`M ${sx} ${sy} A ${rx} ${rx} 0 ${largeArc} 0 ${ex} ${ey}`}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dashArray}
      />
      {labelObj && <Label pos={pxLabelPos} {...labelObj} />}
    </g>
  );
};
