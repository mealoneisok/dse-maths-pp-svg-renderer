// src/components/geometry/demo/PrismPractice_P2_39.tsx

import { GeometryFrame3D, type Vector3 } from "../GeometryFrame3D";

export const PrismPractice_P2_39 = () => {
  const l = 50;
  const d = 30;
  const h = 20;

  const A: Vector3 = [0, 0, 0]; // 0
  const B: Vector3 = [l, 0, 0]; // 1
  const C: Vector3 = [l, d, h]; // 2
  const D: Vector3 = [0, d, h]; // 3
  const E: Vector3 = [0, d, 0]; // 4
  const F: Vector3 = [l, d, 0]; // 5

  const G: Vector3 = [l * (5 / 8), 0, 0];

  const strokeColor = "#111827";

  return (
    <GeometryFrame3D
      width={300}
      points={[
        { pos: A, label: { text: "A", align: "bottom-left" } },
        { pos: B, label: { text: "B", align: "bottom-right" } },
        { pos: C, label: { text: "C", align: "top-right" } },
        { pos: D, label: { text: "D", align: "top-left" } },
        { pos: E, label: { text: "E", align: "bottom" } },
        { pos: F, label: { text: "F", align: "bottom-right" } },
        { pos: G, label: { text: "G", align: "bottom" } },
      ]}
      // 1. 使用 Polyhedron 處理主體角柱 (自動算虛實線)
      solids={[
        {
          type: "polyhedron",
          vertices: [A, B, C, D, E, F],
          faces: [
            [0, 1, 2, 3], // 頂面斜坡 ABCD
            [0, 4, 5, 1], // 底面 AEFB
            [4, 3, 2, 5], // 背面 EDCF
            [0, 3, 4], // 左面 ADE
            [1, 5, 2], // 右面 BFC
          ],
          color: strokeColor,
        },
      ]}
      // 2. segments 現在只用來畫內部的 4 條虛線輔助線
      segments={[
        { start: D, end: G, color: strokeColor, dash: "dotted" },
        { start: E, end: G, color: strokeColor, dash: "dotted" },
        { start: C, end: G, color: strokeColor, dash: "dotted" },
        { start: F, end: G, color: strokeColor, dash: "dotted" },
      ]}
      angleMarkers={[
        {
          vertex: A,
          p1: E,
          p2: D,
          size: 6,
          color: "red",
          label: { text: "a" },
        },
        {
          vertex: B,
          p1: F,
          p2: C,
          size: 6,
          color: "red",
          label: { text: "b" },
        },
        {
          vertex: G,
          p1: F,
          p2: C,
          size: 6,
          color: "red",
          label: { text: "c" },
        },
        {
          vertex: G,
          p1: E,
          p2: D,
          size: 6,
          color: "red",
          label: { text: "d" },
        },

        // 不再需要傳入 isRightAngle，引擎會自動用向量內積偵測！
        { vertex: E, p1: A, p2: D, size: 4.5, dash: "dashed" },
        { vertex: E, p1: G, p2: D, size: 4.5, dash: "dotted" },
        { vertex: F, p1: B, p2: C, size: 4.5 },
        { vertex: F, p1: G, p2: C, size: 4.5, dash: "dotted" },
      ]}
    />
  );
};
