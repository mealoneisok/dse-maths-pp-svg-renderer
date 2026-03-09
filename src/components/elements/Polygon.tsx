// src/components/elements/Polygon.tsx
import React from "react";
import { Label } from "./Label";
import {
  type PolygonProps,
  type ProjectFunctionType,
  type Vector2,
} from "./types";
import { normalizeLabel } from "../../utils/type";
import { LAYOUT } from "../../constants";

export const Polygon: React.FC<
  PolygonProps & { project?: ProjectFunctionType }
> = ({
  vertices,
  fill = "none",
  stroke = LAYOUT.DEFAULT_COLOR,
  strokeWidth = LAYOUT.DEFAULT_STROKE_WIDTH,
  label,
  project,
}) => {
  const labelObj = normalizeLabel(label);

  // 🌟 1. 投影所有頂點
  const pxVertices = project ? vertices.map(project) : (vertices as Vector2[]);

  // 🌟 2. 計算投影後的多邊形幾何中心 (作為標籤的 fallback 位置)
  const pxCenter = pxVertices
    .reduce((acc, v) => [acc[0] + v[0], acc[1] + v[1]], [0, 0])
    .map((v) => v / pxVertices.length) as Vector2;

  // 🌟 3. 決定標籤位置：優先使用指定的 pos 並投影，否則放在幾何中心
  const pxLabelPos = labelObj?.pos
    ? project
      ? project(labelObj.pos)
      : labelObj.pos
    : pxCenter;

  return (
    <g>
      <polygon
        points={pxVertices.map((p) => `${p[0]},${p[1]}`).join(" ")}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      {labelObj && <Label pos={pxLabelPos} {...labelObj} />}
    </g>
  );
};
