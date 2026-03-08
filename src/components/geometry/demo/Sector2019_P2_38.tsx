// src/components/geometry/demo/Sector2019_P2_38.tsx

import React from "react";
import { GeometryFrame } from "../GeometryFrame";
import {
  type PointProps,
  type SegmentProps,
  type ArcProps,
  type RegionProps,
} from "../../elements/types";

export const Sector2019_P2_38: React.FC = () => {
  // 1. 幾何座標計算
  const O: [number, number] = [0, 0];
  const A: [number, number] = [12, 0];
  const C: [number, number] = [0, 12];

  // B 點 (60度)
  const B: [number, number] = [
    12 * Math.cos(Math.PI / 3),
    12 * Math.sin(Math.PI / 3),
  ];

  // D 點 (AC 與 OB 交點)
  const dx = 12 / (1 + Math.sqrt(3));
  const dy = 12 - dx;
  const D: [number, number] = [dx, dy];

  // 2. 定義標籤點
  const points: PointProps[] = [
    { pos: O, label: { text: "O", align: "bottom-left", offset: 5 } },
    { pos: A, label: { text: "A", align: "bottom-right", offset: 5 } },
    { pos: C, label: { text: "C", align: "top-left", offset: 5 } },
    { pos: B, label: { text: "B", align: "top-right", offset: 5 } },
    { pos: D, label: { text: "D", align: "bottom", offset: 5 } },
  ];

  // 3. 定義線段
  const segments: SegmentProps[] = [
    { start: O, end: A }, // OA
    { start: O, end: C }, // OC
    { start: O, end: B }, // OB
    { start: A, end: B }, // AB
    { start: A, end: C }, // AC
  ];

  // 4. 定義圓弧 (最外圍的 AC 弧)
  const arcs: ArcProps[] = [
    { center: O, radius: 12, startAngle: 0, endAngle: Math.PI / 2 },
  ];

  // 5. 定義陰影區域 (區域 BCD)
  // 路徑順序：C -> D (直線), D -> B (直線), B -> C (圓弧)
  const regions: RegionProps[] = [
    {
      start: C,
      paths: [
        { type: "line", to: D },
        { type: "line", to: B },
        {
          type: "arc",
          to: C,
          radius: 12,
          largeArc: 0,
          sweepFlag: 0,
        },
      ],
      fill: "default-hatch",
      stroke: "#000",
      strokeWidth: 1.5,
    },
  ];

  return (
    <GeometryFrame
      width={400}
      height={400}
      padding={0}
      points={points}
      segments={segments}
      arcs={arcs}
      regions={regions}
    />
  );
};
