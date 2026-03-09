// src/components/elements/Polygon.tsx

import React from "react";
import { Label } from "./Label";
import { type PolygonProps } from "./types";
import { normalizeLabel } from "../../utils/type";
import { LAYOUT } from "../../constants";

export const Polygon: React.FC<PolygonProps> = ({
  vertices,
  fill = "none",
  stroke = LAYOUT.DEFAULT_COLOR,
  strokeWidth = LAYOUT.DEFAULT_STROKE_WIDTH,
  label,
}) => {
  const labelObj = normalizeLabel(label);
  // 若未提供 pos，預設取頂點的幾何中心（傳進來的 vertices 已經是像素座標）
  const center = vertices.reduce(
    (acc, v) => [acc[0] + v[0], acc[1] + v[1]],
    [0, 0],
  );
  const pxX = labelObj?.pos?.[0] ?? center[0] / vertices.length;
  const pxY = labelObj?.pos?.[1] ?? center[1] / vertices.length;

  return (
    <g>
      <polygon
        points={vertices.map((p) => `${p[0]},${p[1]}`).join(" ")}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      {labelObj && <Label pos={[pxX, pxY]} {...labelObj} />}
    </g>
  );
};
