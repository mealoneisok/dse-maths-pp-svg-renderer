// src/components/elements/Circle.tsx

import React from "react";
import { Label } from "./Label";
import { type CircleProps, type Vector2 } from "./types";
import { normalizeLabel, normalizeDash, normalizeFill } from "../../utils/type";
import { PatternFill } from "./PatternFill";
import { LAYOUT } from "../../constants";

export const Circle: React.FC<
  CircleProps & {
    fill?: any;
    project?: (pt: Vector2) => Vector2;
    scale?: number;
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
  scale,
}) => {
  const labelObj = normalizeLabel(label);
  const dashArray = normalizeDash(dash);
  const { fillValue, patternDef } = normalizeFill(fill);

  const pxCenter = project ? project(center) : center;
  const pxRadius = scale ? radius * scale : radius;
  const pxLabelPos = labelObj?.pos
    ? project
      ? project(labelObj.pos)
      : labelObj.pos
    : pxCenter;

  return (
    <g>
      {/* 🌟 定義區塊 */}
      {patternDef && (
        <defs>
          <PatternFill {...patternDef} />
        </defs>
      )}
      <circle
        cx={pxCenter[0]}
        cy={pxCenter[1]}
        r={pxRadius}
        fill={fillValue} // 🌟 套用解析後的值
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dashArray}
      />
      {labelObj && <Label pos={pxLabelPos} {...labelObj} />}
    </g>
  );
};
