// src/components/geometry/demo/Sector2019_P2_38.tsx

import React from "react";
import { GeometryFrame } from "../GeometryFrame";
import {
  type PointProps,
  type SegmentProps,
  type RegionProps,
  type Vector2,
  type SectorProps,
} from "../../elements/types";

export const Sector2019_P2_38: React.FC = () => {
  // 1. 幾何座標計算
  const O: Vector2 = [0, 0];
  const A: Vector2 = [12, 0];
  const C: Vector2 = [0, 12];

  // B 點 (60度)
  const B: Vector2 = [12 * Math.cos(Math.PI / 3), 12 * Math.sin(Math.PI / 3)];

  // D 點 (AC 與 OB 交點)
  const dx = 12 / (1 + Math.sqrt(3));
  const dy = 12 - dx;
  const D: Vector2 = [dx, dy];

  // 2. 定義標籤點
  const points: PointProps[] = [
    { pos: O, label: { text: "O", align: "bottom-left", offset: 5 } },
    { pos: A, label: { text: "A", align: "bottom-right", offset: 5 } },
    { pos: C, label: { text: "C", align: "top-left", offset: 5 } },
    { pos: B, label: { text: "B", align: "top-right", offset: 5 } },
    { pos: D, label: { text: "D", align: "bottom", offset: 5 } },
  ];

  // 3. 定義扇形 (取代原本的 OA, OC 線段以及最外圍的 AC 圓弧)
  const sectors: SectorProps[] = [
    {
      center: O,
      radius: 12,
      startAngle: 0,
      endAngle: Math.PI / 2,
      stroke: "#000",
    },
  ];

  // 4. 定義內部輔助線段 (扣掉外框的 OA, OC 後，只剩內部的線)
  const segments: SegmentProps[] = [
    { start: O, end: B }, // OB
    { start: A, end: B }, // AB
    { start: A, end: C }, // 弦 AC
  ];

  // 5. 定義陰影區域 (區域 BCD)
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
      fill: {
        type: "diagonal",
        spacing: 6,
        color: "#6b7280", // Tailwind gray-500
      },
      stroke: "none", // 外框已經由 Sector 畫好了，所以內部填色不用外框
    },
  ];

  return (
    <GeometryFrame
      width={400}
      points={points}
      sectors={sectors}
      segments={segments}
      regions={regions}
    />
  );
};
