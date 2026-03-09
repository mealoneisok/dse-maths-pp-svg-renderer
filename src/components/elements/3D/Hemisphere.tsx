// src/components/elements/3D/Hemisphere.tsx

import React from "react";
import type { HemisphereProps } from "../types";
import { LAYOUT, PROJ_ELLIPSE_RATIO } from "@/constants";
import { normalizeDash, normalizeFill } from "@/utils/type";
import { PatternFill } from "../PatternFill";

export const Hemisphere: React.FC<HemisphereProps> = ({
  centerBase,
  radius,
  color = LAYOUT.DEFAULT_COLOR,
  fill = "none",
  strokeWidth = LAYOUT.DEFAULT_STROKE_WIDTH,
  project,
  scale = 20,
  dash = "dashed",
}) => {
  if (!project) return null;

  const [cx, cy] = project(centerBase);
  const r2d = radius * scale;
  const ry = r2d * PROJ_ELLIPSE_RATIO;

  // 解析 fill
  const { fillValue, patternDef } = normalizeFill(fill);

  return (
    <g>
      {/* 渲染 Pattern 定義 */}
      {patternDef && (
        <defs>
          <PatternFill {...patternDef} />
        </defs>
      )}

      {/* 1. 填色層 */}
      {fill !== "none" && fillValue !== "transparent" && (
        <g stroke="none" fill={fillValue}>
          {/* 底面填充 */}
          <ellipse cx={cx} cy={cy} rx={r2d} ry={ry} />
          {/* 圓頂輪廓填充 (完美的上半圓弧 -> 下半橢圓弧) */}
          <path
            d={`M ${cx - r2d} ${cy} 
                A ${r2d} ${r2d} 0 0 1 ${cx + r2d} ${cy} 
                A ${r2d} ${ry} 0 0 1 ${cx - r2d} ${cy} Z`}
          />
        </g>
      )}

      {/* 2. 線框層 */}
      <path
        d={`M ${cx - r2d} ${cy} A ${r2d} ${ry} 0 0 1 ${cx + r2d} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={normalizeDash(dash)}
      />
      <path
        d={`M ${cx - r2d} ${cy} A ${r2d} ${ry} 0 0 0 ${cx + r2d} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <path
        d={`M ${cx - r2d} ${cy} A ${r2d} ${r2d} 0 0 1 ${cx + r2d} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
      />
    </g>
  );
};
