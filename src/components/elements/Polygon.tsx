// src/components/elements/Polygon.tsx
import React from "react";
import { Label } from "./Label";
import { type PolygonProps, type Vector2 } from "./types";
import { normalizeLabel } from "../../utils/type";
import { LAYOUT } from "../../constants";

export const Polygon: React.FC<
  PolygonProps & { project?: (pt: Vector2) => Vector2 }
> = ({
  vertices,
  fill = "none",
  stroke = LAYOUT.DEFAULT_COLOR,
  strokeWidth = LAYOUT.DEFAULT_STROKE_WIDTH,
  label,
  project,
}) => {
  const labelObj = normalizeLabel(label);

  // 🌟 如果有傳入 project，就在這裡轉換；否則直接用原座標
  const pxVertices = project ? vertices.map(project) : vertices;

  return (
    <g>
      <polygon
        points={pxVertices.map((p) => `${p[0]},${p[1]}`).join(" ")}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      {labelObj && <Label pos={labelObj.pos!} {...labelObj} />}
    </g>
  );
};
