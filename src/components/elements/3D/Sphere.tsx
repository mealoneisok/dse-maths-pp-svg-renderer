// src/components/elements/3D/Sphere.tsx

import React from "react";
import type { SphereProps } from "../types";
import { LAYOUT, PROJ_ELLIPSE_RATIO } from "@/constants";
import { normalizeDash } from "@/utils/type";

export const Sphere: React.FC<SphereProps> = ({
  center,
  radius,
  strokeWidth = LAYOUT.DEFAULT_STROKE_WIDTH,
  dash = "dashed",
  color = "#111827",
  project,
  scale = 20,
}) => {
  if (!project) return null;

  // 將 3D 球心投影到 2D 畫面上
  const [cx, cy] = project(center);

  // 畫面上的像素半徑
  const r2d = radius * scale;
  const ry = r2d * PROJ_ELLIPSE_RATIO;

  return (
    <g>
      {/* 1. 繪製球體的外輪廓 (實線圓) */}
      <circle
        cx={cx}
        cy={cy}
        r={r2d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
      />

      {/* 2. 繪製赤道 (暗示立體感的橢圓) */}
      {/* 實線部分 (前半部) */}
      <path
        d={`M ${cx - r2d} ${cy} A ${r2d} ${ry} 0 0 0 ${cx + r2d} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      {/* 虛線部分 (後半部被遮蔽) */}
      <path
        d={`M ${cx - r2d} ${cy} A ${r2d} ${r2d * 0.3} 0 0 1 ${cx + r2d} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={normalizeDash(dash)}
      />
    </g>
  );
};
