// src/components/elements/3D/Hemisphere.tsx

import React from "react";
import type { HemisphereProps } from "../types";
import { LAYOUT, PROJ_ELLIPSE_RATIO } from "@/constants";
import { normalizeDash } from "@/utils/type";

export const Hemisphere: React.FC<HemisphereProps> = ({
  centerBase,
  radius,
  color = "#111827",
  strokeWidth = LAYOUT.DEFAULT_STROKE_WIDTH,
  project,
  scale = 20,
  dash = "dashed",
}) => {
  if (!project) return null;

  // 將 3D 底面圓心投影到 2D
  const [cx, cy] = project(centerBase);

  // 畫面上的像素半徑
  const r2d = radius * scale;
  // 橢圓短軸 (透視深度)
  const ry = r2d * PROJ_ELLIPSE_RATIO;

  return (
    <g>
      {/* 1. 底部橢圓 (後半部被遮蔽：虛線) */}
      <path
        d={`M ${cx - r2d} ${cy} A ${r2d} ${ry} 0 0 1 ${cx + r2d} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={normalizeDash(dash)}
      />
      {/* 2. 底部橢圓 (前半部可見：實線) */}
      <path
        d={`M ${cx - r2d} ${cy} A ${r2d} ${ry} 0 0 0 ${cx + r2d} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      {/* 3. 圓頂 (上半部的完美半圓弧) */}
      <path
        d={`M ${cx - r2d} ${cy} A ${r2d} ${r2d} 0 0 1 ${cx + r2d} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
      />
    </g>
  );
};
