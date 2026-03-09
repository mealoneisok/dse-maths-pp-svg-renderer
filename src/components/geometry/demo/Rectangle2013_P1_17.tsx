// src/components/geometry/demo/Rectangle2013_P1_17.tsx

import { GeometryFrame } from "../GeometryFrame";

export const Rectangle2013_P1_17 = () => {
  return (
    <GeometryFrame
      width={500}
      padding={40}
      polygons={[
        {
          // 外圍大長方形
          vertices: [
            [0, 0],
            [140, 0],
            [140, 50],
            [0, 50],
          ],
          strokeWidth: 2,
          stroke: "#333",
          fill: "none",
        },
      ]}
      segments={[
        {
          // 屬於長方形的連續分割線
          start: [40, 0],
          end: [40, 50],
          strokeWidth: 2,
          color: "#333",
        },
      ]}
      dimLines={[
        {
          // 緊貼在分割線右側的專屬尺寸線，會自動因 "x m" 斷開
          start: [44, 0],
          end: [44, 50],
          label: "x\\text{ m}",
          color: "#333",
          arrowSize: 8,
          gapPadding: 16, // 文字上下保留 16px 的白邊
        },
      ]}
    />
  );
};
