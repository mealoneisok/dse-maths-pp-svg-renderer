// src/components/geometry/demo/Pie2012_P2_16.tsx

import React from "react";
import { GeometryFrame } from "../GeometryFrame";
import {
  type PointProps,
  type SegmentProps,
  type ArcProps,
  type AngleMarkerProps,
  type Vector2,
} from "../../elements/types";

export const Pie2012_P2_16: React.FC = () => {
  // 數學參數設定
  const r1 = 30; // OA = OB
  const r2 = 40; // OC = OD
  const startAngle = 1.3 * Math.PI; // 約 234 度
  const endAngle = 1.7 * Math.PI; // 約 306 度

  // 輔助函式：計算極座標轉直角座標
  const getPos = (r: number, angle: number): Vector2 => [
    r * Math.cos(angle),
    r * Math.sin(angle),
  ];

  const posO: Vector2 = [0, 0];
  const posA = getPos(r1, startAngle);
  const posB = getPos(r1, endAngle);
  const posC = getPos(r2, startAngle);
  const posD = getPos(r2, endAngle);

  // 1. 點與標籤
  const points: PointProps[] = [
    { pos: posO, label: { text: "O", align: "top", offset: 10 } },
    { pos: posA, label: { text: "A", align: "top-left", offset: 5 } },
    { pos: posB, label: { text: "B", align: "top-right", offset: 5 } },
    { pos: posC, label: { text: "C", align: "left", offset: 5 } },
    { pos: posD, label: { text: "D", align: "right", offset: 5 } },
  ];

  // 2. 兩側線段
  const segments: SegmentProps[] = [
    { start: posO, end: posC, strokeWidth: 1.5 },
    { start: posO, end: posD, strokeWidth: 1.5 },
  ];

  // 3. 圓弧
  const arcs: ArcProps[] = [
    { center: posO, radius: r1, startAngle, endAngle, strokeWidth: 1.5 },
    { center: posO, radius: r2, startAngle, endAngle, strokeWidth: 1.5 },
  ];

  // 4. 角度標記 (在 O 點加上 AngleMarker 作為展示)
  const angleMarkers: AngleMarkerProps[] = [
    {
      vertex: posO,
      p1: posA, // 起始邊
      p2: posB, // 結束邊
      size: 25, // 像素大小
      label: { text: "72^\\circ" }, // 支援 LaTeX！
    },
  ];

  return (
    <GeometryFrame
      width={400}
      padding={0}
      points={points}
      segments={segments}
      arcs={arcs}
      angleMarkers={angleMarkers}
    />
  );
};
