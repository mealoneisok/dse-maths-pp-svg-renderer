// src/components/elements/3D/Hemisphere.tsx

import React from "react";
import { type Vector3 } from "../../geometry/GeometryFrame3D";

export interface HemisphereProps {
  centerBase: Vector3;
  radius: number; // 3D 空間中的半徑
  color?: string;
  project?: (pt: Vector3) => [number, number];
  scale?: number;
}

export const Hemisphere: React.FC<HemisphereProps> = ({
  centerBase,
  radius,
  color = "#111827",
  project,
  scale = 20,
}) => {
  if (!project) return null;

  // 將 3D 底面圓心投影到 2D
  const [cx, cy] = project(centerBase);

  // 畫面上的像素半徑
  const r2d = radius * scale;
  // 橢圓短軸 (透視深度)
  const ry = r2d * 0.3;

  return (
    <g>
      {/* 1. 底部橢圓 (後半部被遮蔽：虛線) */}
      <path
        d={`M ${cx - r2d} ${cy} A ${r2d} ${ry} 0 0 1 ${cx + r2d} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeDasharray="5 5"
      />
      {/* 2. 底部橢圓 (前半部可見：實線) */}
      <path
        d={`M ${cx - r2d} ${cy} A ${r2d} ${ry} 0 0 0 ${cx + r2d} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
      />
      {/* 3. 圓頂 (上半部的完美半圓弧) */}
      <path
        d={`M ${cx - r2d} ${cy} A ${r2d} ${r2d} 0 0 1 ${cx + r2d} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
      />
    </g>
  );
};
