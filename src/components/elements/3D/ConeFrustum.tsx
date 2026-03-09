// src/components/elements/3D/ConeFrustum.tsx

import React from "react";
import { type Vector3 } from "../../geometry/GeometryFrame3D";

export interface ConeFrustumProps {
  centerBase: Vector3;
  radiusBottom: number;
  radiusTop: number;
  height: number;
  color?: string;
  project?: (pt: Vector3) => [number, number];
  scale?: number;
}

export const ConeFrustum: React.FC<ConeFrustumProps> = ({
  centerBase,
  radiusBottom,
  radiusTop,
  height,
  color = "#111827",
  project,
  scale = 20,
}) => {
  if (!project) return null;

  // 1. 計算上下底面中心在 2D 畫面的位置
  const [cx1, cy1] = project(centerBase);
  const [cx2, cy2] = project([
    centerBase[0],
    centerBase[1],
    centerBase[2] + height,
  ]);

  // 2. 計算橢圓的長短軸 (利用與 Sphere 一樣的 0.3 深度視角比例)
  const rx1 = radiusBottom * scale;
  const ry1 = rx1 * 0.3;

  const rx2 = radiusTop * scale;
  const ry2 = rx2 * 0.3;

  return (
    <g>
      {/* 底部橢圓 (後半部被遮蔽：虛線) */}
      <path
        d={`M ${cx1 - rx1} ${cy1} A ${rx1} ${ry1} 0 0 1 ${cx1 + rx1} ${cy1}`}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeDasharray="5 5"
      />
      {/* 底部橢圓 (前半部可見：實線) */}
      <path
        d={`M ${cx1 - rx1} ${cy1} A ${rx1} ${ry1} 0 0 0 ${cx1 + rx1} ${cy1}`}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
      />

      {/* 頂部橢圓 (完全可見：實線) */}
      <ellipse
        cx={cx2}
        cy={cy2}
        rx={rx2}
        ry={ry2}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
      />

      {/* 左母線 */}
      <line
        x1={cx1 - rx1}
        y1={cy1}
        x2={cx2 - rx2}
        y2={cy2}
        stroke={color}
        strokeWidth={1.5}
      />
      {/* 右母線 */}
      <line
        x1={cx1 + rx1}
        y1={cy1}
        x2={cx2 + rx2}
        y2={cy2}
        stroke={color}
        strokeWidth={1.5}
      />
    </g>
  );
};
