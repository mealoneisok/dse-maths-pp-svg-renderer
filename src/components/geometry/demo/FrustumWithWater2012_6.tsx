// src/components/geometry/demo/FrustumWithWater2012_6.tsx

import React from "react";
import { GeometryFrame3D } from "../GeometryFrame3D";

export const FrustumWithWater2012_6: React.FC = () => {
  return (
    <GeometryFrame3D
      width={400}
      solids={[
        // 1. 內層的水體 (Water)
        {
          type: "coneFrustum",
          centerBase: [0, 0, 0],
          radiusBottom: 3,
          radiusTop: 3.6,
          height: 6,
          color: "#6b7280", // 水的邊線用稍淺的灰色

          topDash: "dashed", // 水面上方全部虛線
          sideDash: "dashed", // 水的兩側在杯子裡面，所以也是虛線
          bottomFrontDash: "solid", // 水的底部前方跟杯子重疊，維持實線
          dash: "dashed", // 水的底部後方，維持虛線

          fill: {
            type: "wave",
            color: "#9ca3af",
            waveAmplitude: 2,
            waveLength: 10,
          },
        },

        // 2. 外層的玻璃杯 (Glass)
        {
          type: "coneFrustum",
          centerBase: [0, 0, 0],
          radiusBottom: 3,
          radiusTop: 4,
          height: 10,
          color: "#111827",
          fill: "none",
          // 玻璃杯是實體外殼，完全不用傳額外的 dash，它會自動保持最完美的狀態！
        },
      ]}
    />
  );
};
