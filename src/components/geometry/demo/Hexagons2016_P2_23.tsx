// src/components/geometry/demo/Hexagons2016_P2_23.tsx

import React, { useMemo } from "react";
import { GeometryFrame, type GeoPolygon } from "../GeometryFrame";

export const Hexagons2016_P2_23: React.FC = () => {
  // 六邊形的半徑 (中心點到頂點的距離)
  const R = 30;
  const SQRT3 = Math.sqrt(3);

  // 根據軸向座標 (q, r) 計算平頂六邊形的 6 個頂點
  const getHexagonVertices = (q: number, r: number): [number, number][] => {
    const cx = R * 1.5 * q;
    const cy = R * SQRT3 * (r + q / 2);

    return [
      [cx + R, cy], // 右
      [cx + R / 2, cy + (R * SQRT3) / 2], // 右下
      [cx - R / 2, cy + (R * SQRT3) / 2], // 左下
      [cx - R, cy], // 左
      [cx - R / 2, cy - (R * SQRT3) / 2], // 左上
      [cx + R / 2, cy - (R * SQRT3) / 2], // 右上
    ];
  };

  const polygons: GeoPolygon[] = useMemo(() => {
    // 完美的 8 個六邊形軸向座標 (q, r)
    const hexCoordinates = [
      // 左側區塊 (3個，垂直排列)
      [0, -1],
      [-1, 0], // 左側 - 中間
      [-1, 1], // 左側 - 最下

      // 中間橋接 (1個)
      [0, 0], // 核心連接點

      // 右側區塊 (4個，形成一個 2x2 的菱形結構)
      [1, 1], // 右區塊 - 最上方
      [1, 0], // 右區塊 - 中間偏左
      [2, 0], // 右區塊 - 右上方
      [2, -1], // 右區塊 - 右下方
    ];

    return hexCoordinates.map(([q, r]) => ({
      vertices: getHexagonVertices(q, r),
      fill: "transparent",
      stroke: "#000000",
      strokeWidth: 2,
    }));
  }, []);

  return (
    <div className="flex items-center justify-center p-8">
      <GeometryFrame width={500} polygons={polygons} />
    </div>
  );
};
