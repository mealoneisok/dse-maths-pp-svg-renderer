// src/components/geometry/demo/Square2015_P1_13.tsx

import React from "react";
import { GeometryFrame } from "../GeometryFrame";
import type {
  PointProps,
  PolygonProps,
  SegmentProps,
} from "../../elements/types";

export const Square2015_P1_13: React.FC = () => {
  const points: PointProps[] = [
    { pos: [0, 100], label: { text: "A", align: "top-left", offset: 5 } },
    { pos: [0, 0], label: { text: "B", align: "bottom-left", offset: 5 } },
    { pos: [100, 0], label: { text: "C", align: "bottom-right", offset: 5 } },
    { pos: [100, 100], label: { text: "D", align: "top-right", offset: 5 } },
    { pos: [65, 0], label: { text: "E", align: "bottom", offset: 5 } },
    { pos: [100, 65], label: { text: "F", align: "right", offset: 5 } },
    // G 為 AE 與 BF 兩線段的交點
    { pos: [45.7, 29.7], label: { text: "G", align: "top", offset: 10 } },
  ];

  // 繪製正方形 ABCD
  const polygons: PolygonProps[] = [
    {
      vertices: [
        [0, 100],
        [0, 0],
        [100, 0],
        [100, 100],
      ],
      strokeWidth: 1.5,
    },
  ];

  // 繪製內部交叉線段 AE 與 BF
  const segments: SegmentProps[] = [
    { start: [0, 100], end: [65, 0], strokeWidth: 1.5 },
    { start: [0, 0], end: [100, 65], strokeWidth: 1.5 },
  ];

  return (
    <GeometryFrame
      padding={0}
      width={300}
      //height={300}
      points={points}
      polygons={polygons}
      segments={segments}
    />
  );
};
