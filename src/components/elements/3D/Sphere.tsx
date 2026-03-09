// src/components/elements/3D/Sphere.tsx

import React from "react";
import { type Vector3 } from "../../geometry/GeometryFrame3D";

export interface SphereProps {
  center: Vector3;
  radius: number; // 3D 空間中的半徑
  color?: string;
  project?: (pt: Vector3) => [number, number];
  scale?: number;
}

export const Sphere: React.FC<SphereProps> = ({
  center,
  radius,
  color = "#111827",
  project,
  scale = 20,
}) => {
  if (!project) return null;

  // 將 3D 球心投影到 2D 畫面上
  const [cx, cy] = project(center);

  // 畫面上的像素半徑
  const r2d = radius * scale;

  return (
    <g>
      {/* 1. 繪製球體的外輪廓 (實線圓) */}
      <circle
        cx={cx}
        cy={cy}
        r={r2d}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
      />

      {/* 2. 繪製赤道 (暗示立體感的橢圓) */}
      {/* 實線部分 (前半部) */}
      <path
        d={`M ${cx - r2d} ${cy} A ${r2d} ${r2d * 0.3} 0 0 0 ${cx + r2d} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth={1}
      />
      {/* 虛線部分 (後半部被遮蔽) */}
      <path
        d={`M ${cx - r2d} ${cy} A ${r2d} ${r2d * 0.3} 0 0 1 ${cx + r2d} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth={1}
        strokeDasharray="4 4"
      />
    </g>
  );
};
