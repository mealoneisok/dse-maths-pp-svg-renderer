// src/components/elements/3D/Sphere.tsx

import React from "react";
import type { SphereProps } from "../types";
import { LAYOUT, PROJ_ELLIPSE_RATIO } from "@/constants";
import { normalizeDash, normalizeFill } from "@/utils/type";
import { PatternFill } from "../PatternFill";

export const Sphere: React.FC<SphereProps> = ({
  center,
  radius,
  strokeWidth = LAYOUT.DEFAULT_STROKE_WIDTH,
  dash = "dashed",
  color = LAYOUT.DEFAULT_COLOR,
  fill = "none",
  project,
  scale = 20,
}) => {
  if (!project) return null;

  const [cx, cy] = project(center);
  const r2d = radius * scale;
  const ry = r2d * PROJ_ELLIPSE_RATIO;

  const { fillValue, patternDef } = normalizeFill(fill);

  return (
    <g>
      {/* 渲染 Pattern 定義 */}
      {patternDef && (
        <defs>
          <PatternFill {...patternDef} />
        </defs>
      )}

      {/* 1. 填色層 (整顆球的基底顏色) */}
      {fill !== "none" && fillValue !== "transparent" && (
        <circle cx={cx} cy={cy} r={r2d} fill={fillValue} stroke="none" />
      )}

      {/* 2. 線框層 */}
      <circle
        cx={cx}
        cy={cy}
        r={r2d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
      />

      <path
        d={`M ${cx - r2d} ${cy} A ${r2d} ${ry} 0 0 0 ${cx + r2d} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <path
        d={`M ${cx - r2d} ${cy} A ${r2d} ${ry} 0 0 1 ${cx + r2d} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={normalizeDash(dash)}
      />
    </g>
  );
};
