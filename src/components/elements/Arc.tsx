// src/components/elements/Arc.tsx

import React from "react";
import { Label } from "./Label";
import { type ArcProps } from "./types";
import { normalizeLabel, normalizeDash } from "../../utils/type";
import { LAYOUT } from "../../constants";

// 擴充一個內部專用的繪圖參數介面
export interface PixelArcProps extends ArcProps {
  _svgParams?: {
    sx: number;
    sy: number;
    ex: number;
    ey: number;
    rx: number;
    ry: number;
    largeArc: number;
    sweep: number;
  };
}

export const Arc: React.FC<PixelArcProps> = ({
  _svgParams,
  fill = "none",
  stroke = LAYOUT.DEFAULT_COLOR,
  strokeWidth = LAYOUT.DEFAULT_STROKE_WIDTH,
  dash,
  label,
  center,
}) => {
  const labelObj = normalizeLabel(label);
  const dashArray = normalizeDash(dash);

  return (
    <g>
      {_svgParams && (
        <path
          d={`M ${_svgParams.sx} ${_svgParams.sy} A ${_svgParams.rx} ${_svgParams.ry} 0 ${_svgParams.largeArc} ${_svgParams.sweep} ${_svgParams.ex} ${_svgParams.ey}`}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={dashArray}
        />
      )}
      {labelObj && <Label pos={labelObj.pos ?? center} {...labelObj} />}
    </g>
  );
};
