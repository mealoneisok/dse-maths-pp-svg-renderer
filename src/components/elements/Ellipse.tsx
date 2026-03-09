// src/components/elements/Ellipse.tsx

import React from "react";
import { Label } from "./Label";
import { type EllipseProps, type Vector2 } from "./types";
import { normalizeLabel, normalizeDash, normalizeFill } from "../../utils/type";
import { PatternFill } from "./PatternFill";
import { LAYOUT } from "../../constants";

export const Ellipse: React.FC<
  EllipseProps & {
    project?: (pt: Vector2) => Vector2;
    scale?: number;
  }
> = ({
  center,
  radius,
  rx,
  ry,
  rotation = 0,
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

  // 處理長短軸回退邏輯 (Fallback)
  // 如果傳了 radius，就當作 rx 與 ry；如果只傳了 rx 沒傳 ry，也預設為正圓
  const actualRx = rx ?? radius ?? 0;
  const actualRy = ry ?? radius ?? actualRx;

  // 投影與縮放
  const pxCenter = project ? project(center) : center;
  const pxRx = actualRx * scale;
  const pxRy = actualRy * scale;

  const pxLabelPos = labelObj?.pos
    ? project
      ? project(labelObj.pos)
      : labelObj.pos
    : pxCenter;

  // 處理橢圓旋轉 (Math space 到 SVG space 的轉換)
  // 數學坐標系中，逆時針旋轉為正。但 SVG 的 Y 軸是朝下的，所以我們加上負號來抵銷 Y 軸反轉的影響
  const transformStr =
    rotation !== 0
      ? `rotate(${-rotation} ${pxCenter[0]} ${pxCenter[1]})`
      : undefined;

  return (
    <g>
      {patternDef && (
        <defs>
          <PatternFill {...patternDef} />
        </defs>
      )}

      <ellipse
        cx={pxCenter[0]}
        cy={pxCenter[1]}
        rx={pxRx}
        ry={pxRy}
        fill={fillValue}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dashArray}
        transform={transformStr}
      />

      {labelObj && <Label pos={pxLabelPos} {...labelObj} />}
    </g>
  );
};
