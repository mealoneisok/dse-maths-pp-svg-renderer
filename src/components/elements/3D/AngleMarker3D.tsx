// src/components/elements/3D/AngleMarker3D.tsx

import React from "react";
import type { Vector2, Vector3 } from "../types";
import { Label } from "../Label";
import { normalizeDash, normalizeLabel } from "@/utils/type";
import { sub, add, scale, dot, normalize } from "@/utils/math";

export interface AngleMarker3DProps {
  vertex: Vector3;
  p1: Vector3;
  p2: Vector3;
  size?: number; // 3D 空間中的距離
  color?: string;
  isRightAngle?: boolean;
  dash?: string;
  label?: any;
  project?: (pt: Vector3) => Vector2;
}

export const AngleMarker3D: React.FC<AngleMarker3DProps> = ({
  vertex,
  p1,
  p2,
  size = 3,
  color = "#111827",
  isRightAngle,
  dash,
  label,
  project,
}) => {
  if (!project) return null;

  const labelObj = normalizeLabel(label);
  const dashArray = normalizeDash(dash);

  const v1 = normalize(sub(p1, vertex));
  const v2 = normalize(sub(p2, vertex));

  // 智能偵測直角
  const isOrthogonal = isRightAngle ?? Math.abs(dot(v1, v2)) < 1e-5;

  let element;
  let labelRender = null;

  if (isOrthogonal) {
    // ==========================================
    // 直角：必須保留真實 3D 透視 (Skewed Parallelogram)
    // ==========================================
    const pt1 = add(vertex, scale(v1, size));
    const pt2 = add(vertex, scale(v2, size));
    const ptCorner = add(vertex, add(scale(v1, size), scale(v2, size)));

    const projV = project(vertex);
    const proj1 = project(pt1);
    const projCorner = project(ptCorner);
    const proj2 = project(pt2);

    element = (
      <polyline
        points={`${proj1[0]},${proj1[1]} ${projCorner[0]},${projCorner[1]} ${proj2[0]},${proj2[1]}`}
        fill="none"
        stroke={color}
        strokeWidth={1}
        strokeDasharray={dashArray}
      />
    );

    if (labelObj && labelObj.text) {
      // 標籤往直角對角線方向推移
      const dir2DX = projCorner[0] - projV[0];
      const dir2DY = projCorner[1] - projV[1];
      const dist2D = Math.sqrt(dir2DX * dir2DX + dir2DY * dir2DY);
      const labelOffset = labelObj.offset !== undefined ? labelObj.offset : 10;

      const projLabel: Vector2 = [
        projCorner[0] + (dir2DX / dist2D) * labelOffset,
        projCorner[1] + (dir2DY / dist2D) * labelOffset,
      ];
      labelRender = (
        <Label pos={projLabel} text={labelObj.text} align="center" offset={0} />
      );
    }
  } else {
    // ==========================================
    // 圓弧：套用「教科書作弊法則」，在 2D 畫面上畫完美圓弧
    // ==========================================
    const pt1_3D = add(vertex, scale(v1, size));
    const pt2_3D = add(vertex, scale(v2, size));

    // 先將點投射到 2D 畫布
    const projV = project(vertex);
    const proj1 = project(pt1_3D);
    const proj2 = project(pt2_3D);

    // 計算 2D 畫面上的絕對角度
    let a1 = Math.atan2(proj1[1] - projV[1], proj1[0] - projV[0]);
    let a2 = Math.atan2(proj2[1] - projV[1], proj2[0] - projV[0]);

    if (a1 < 0) a1 += 2 * Math.PI;
    if (a2 < 0) a2 += 2 * Math.PI;

    // 取最短路徑夾角 (< 180度)
    let diff = a2 - a1;
    if (diff > Math.PI) a2 -= 2 * Math.PI;
    else if (diff < -Math.PI) a2 += 2 * Math.PI;

    const sweepFlag = a2 > a1 ? 1 : 0;

    // 將 3D 距離轉換為 2D 像素半徑 (取平均值確保圓潤)
    const d1 = Math.hypot(proj1[0] - projV[0], proj1[1] - projV[1]);
    const d2 = Math.hypot(proj2[0] - projV[0], proj2[1] - projV[1]);
    const r = (d1 + d2) / 2;

    const startX = projV[0] + r * Math.cos(a1);
    const startY = projV[1] + r * Math.sin(a1);
    const endX = projV[0] + r * Math.cos(a2);
    const endY = projV[1] + r * Math.sin(a2);

    element = (
      <path
        d={`M ${startX} ${startY} A ${r} ${r} 0 0 ${sweepFlag} ${endX} ${endY}`}
        fill="none"
        stroke={color}
        strokeWidth={1}
        strokeDasharray={dashArray}
      />
    );

    // 完美置中標籤 (精確算在 2D 角平分線上)
    if (labelObj && labelObj.text) {
      const midAngle = (a1 + a2) / 2;
      const labelOffset = labelObj.offset !== undefined ? labelObj.offset : 12;
      const totalDist = r + labelOffset;

      const projLabel: Vector2 = [
        projV[0] + totalDist * Math.cos(midAngle),
        projV[1] + totalDist * Math.sin(midAngle),
      ];

      labelRender = (
        <Label pos={projLabel} text={labelObj.text} align="center" offset={0} />
      );
    }
  }

  return (
    <g>
      {element}
      {labelRender}
    </g>
  );
};
