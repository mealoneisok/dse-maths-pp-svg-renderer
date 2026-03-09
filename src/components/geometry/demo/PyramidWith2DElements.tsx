// src/components/geometry/demo/PyramidWith2DElements.tsx

import { GeometryFrame3D } from "../GeometryFrame3D";
import type { Vector3 } from "../../elements";

export const PyramidWith2DElements = () => {
  const L = 40; // 底邊長
  const h = 50; // 金字塔高

  // 1. 定義 3D 空間座標
  const A: Vector3 = [0, 0, 0];
  const B: Vector3 = [L, 0, 0];
  const C: Vector3 = [L, L, 0];
  const D: Vector3 = [0, L, 0];
  const V: Vector3 = [L / 2, L / 2, h];

  // 懸浮截面的座標 (位於高度 25 的位置，長寬為底面的一半)
  const zPlane = 25;
  const A1: Vector3 = [10, 10, zPlane];
  const B1: Vector3 = [30, 10, zPlane];
  const C1: Vector3 = [30, 30, zPlane];
  const D1: Vector3 = [10, 30, zPlane];

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
      <GeometryFrame3D
        width={350}
        padding={[20, 30, 20, 30]} // 留足夠的 padding 給 DimLine
        // 🌟 展示 1：使用 Region 畫 3D 地板上的陰影/地毯
        regions={[
          {
            start: [-10, -10, 0], // 從 A 點往外擴展一點
            paths: [
              { type: "line", to: [L + 10, -10, 0] },
              { type: "line", to: [L + 10, L + 10, 0] },
              { type: "line", to: [-10, L + 10, 0] },
            ],
            fill: "rgba(229, 231, 235, 0.8)", // Tailwind gray-200 帶透明
            stroke: "#9ca3af", // Tailwind gray-400
            strokeWidth: 1,
          },
        ]}
        // 🌟 展示 2：使用 Polygon 畫 3D 空間中的懸浮截面
        polygons={[
          {
            vertices: [A1, B1, C1, D1],
            fill: "rgba(59, 130, 246, 0.15)", // 半透明藍色
            stroke: "#3b82f6", // 藍色邊框
            strokeWidth: 1.5,
            label: {
              text: "Cross Section",
              color: "#2563eb",
              offset: 15,
              align: "top-right",
            },
          },
        ]}
        // 🌟 展示 3：完美透視的尺寸標註線 (DimLine)
        dimLines={[
          {
            // 將標註線放在 Y 軸 -12 的位置
            start: [0, -12, 0],
            end: [L, -12, 0],
            label: "40",
            color: "#4b5563",
            // 🌟 關鍵：直接告訴它延伸線要連回目標點 A 和 B！
            extStart: A,
            extEnd: B,
          },
          {
            // 標示金字塔的高 (從右側底面中心延伸到頂點高度)
            // 將標註線放在 X 軸 L+15 的位置
            start: [L + 15, L / 2, 0],
            end: [L + 15, L / 2, h],
            label: "h = 50",
            color: "#dc2626",
            // 🌟 關鍵：底部延伸到中心點 O，頂部延伸到頂點 V！
            extStart: [L / 2, L / 2, 0],
            extEnd: V,
          },
        ]}
        // 基礎的骨架線條
        segments={[
          // 底面 (A-D 與 D-C 在後方，設為虛線)
          { start: A, end: B },
          { start: B, end: C },
          { start: C, end: D, dash: "dashed", color: "#9ca3af" },
          { start: D, end: A, dash: "dashed", color: "#9ca3af" },

          // 側面稜線 (D-V 在後方)
          { start: A, end: V },
          { start: B, end: V },
          { start: C, end: V },
          { start: D, end: V, dash: "dashed", color: "#9ca3af" },

          // 高的虛線輔助線
          {
            start: [L / 2, L / 2, 0],
            end: V,
            dash: "dotted",
            color: "#dc2626",
          },
        ]}
        // 標示重要頂點
        points={[
          { pos: V, label: { text: "V", align: "top" } },
          { pos: A, label: { text: "A", align: "bottom-left" } },
          { pos: B, label: { text: "B", align: "bottom-right" } },
          { pos: C, label: { text: "C", align: "right" } },
          { pos: D, label: { text: "D", align: "top-left" } },
          {
            pos: [L / 2, L / 2, 0],
            label: { text: "O", align: "bottom" },
            markerColor: "#dc2626",
          },
        ]}
      />
      <p className="mt-4 text-sm font-serif text-gray-600">
        Figure: Oblique Projection of a Pyramid with 2D Elements (Region,
        Polygon, DimLine)
      </p>
    </div>
  );
};
