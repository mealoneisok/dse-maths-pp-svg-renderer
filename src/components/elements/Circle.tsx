// src/components/elements/Circle.tsx
import React from "react";
import { Label } from "./Label";
import { type CircleProps } from "./types";
import { normalizeLabel, normalizeDash } from "../../utils/type";
import { LAYOUT } from "../../constants";

export const Circle: React.FC<
  CircleProps & {
    project?: (pt: [number, number]) => [number, number];
    scaleX?: (v: number) => number;
  }
> = ({
  center,
  radius,
  fill = "none",
  stroke = LAYOUT.DEFAULT_COLOR,
  strokeWidth = LAYOUT.DEFAULT_STROKE_WIDTH,
  dash,
  label,
  project,
  scaleX,
}) => {
  const labelObj = normalizeLabel(label);
  const dashArray = normalizeDash(dash);

  // 🌟 處理座標與長度的轉換
  const pxCenter = project ? project(center) : center;
  const pxRadius = scaleX
    ? Math.abs(scaleX(center[0] + radius) - scaleX(center[0]))
    : radius;

  return (
    <g>
      <circle
        cx={pxCenter[0]}
        cy={pxCenter[1]}
        r={pxRadius}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dashArray}
      />
      {labelObj && <Label pos={labelObj.pos!} {...labelObj} />}
    </g>
  );
};
