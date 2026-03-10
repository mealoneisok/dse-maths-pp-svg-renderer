// src/components/geometry/demo/CircularCone2014_p1_14.tsx

import { GeometryFrame3D } from "@/components/geometry/GeometryFrame3D";

export const CircularCone2014_p1_14 = () => {
  return (
    <GeometryFrame3D
      width={700}
      padding={0}
      solids={[
        // 1. 外部主容器 (Frustum)
        {
          type: "coneFrustum",
          centerBase: [0, 0, 36],
          height: 60,
          radiusBottom: 27,
          radiusTop: 72,
          topDash: "solid",
          bottomFrontDash: "solid",
          dash: "dashed",
          sideDash: "solid", // 恢復實線，元件內會完美切合
          color: "black",
        },
        // 2. 水面橢圓
        {
          type: "coneFrustum",
          centerBase: [0, 0, 64],
          height: 0,
          radiusBottom: 48,
          radiusTop: 48,
          topDash: "none", // 避免頂底重疊繪製
          bottomFrontDash: "solid",
          dash: "dashed",
          sideDash: "none",
          color: "black",
        },
      ]}
      segments={[
        // --- 假想的底部圓錐切線 ---
        { start: [-27, 0, 36], end: [0, 0, 0], dash: "dashed" },
        { start: [27, 0, 36], end: [0, 0, 0], dash: "dashed" },

        // --- 中心軸線 ---
        { start: [0, 0, 96], end: [0, 0, 0], dash: "dotted" },

        // --- 水平半徑線 ---
        {
          start: [0, 0, 96],
          end: [72, 0, 96],
          dash: "dotted",
          label: { text: "72 \\mathrm{~cm}", align: "top" },
        },
        { start: [0, 0, 64], end: [48, 0, 64], dash: "dotted" },
        { start: [0, 0, 36], end: [27, 0, 36], dash: "dotted" },

        // --- 標註線的向外延伸線 ---
        { start: [72, 0, 96], end: [120, 0, 96], dash: "dashed" },
        { start: [48, 0, 64], end: [85, 0, 64], dash: "dashed" },
        { start: [27, 0, 36], end: [105, 0, 36], dash: "dashed" },
        { start: [0, 0, 0], end: [120, 0, 0], dash: "dashed" },
      ]}
      angleMarkers={[
        // --- 使用 AngleMarker 並把 p1 (水平方向) 指向右側 ---
        {
          vertex: [0, 0, 96],
          p1: [1, 0, 96], // 往右
          p2: [0, 0, 0], // 往下
          size: 6,
          isRightAngle: true,
        },
        {
          vertex: [0, 0, 64],
          p1: [1, 0, 64], // 往右
          p2: [0, 0, 0], // 往下
          size: 6,
          isRightAngle: true,
        },
        {
          vertex: [0, 0, 36],
          p1: [1, 0, 36], // 往右
          p2: [0, 0, 0], // 往下
          size: 6,
          isRightAngle: true,
        },
      ]}
      dimLines={[
        {
          start: [80, 0, 36],
          end: [80, 0, 64],
          label: "28 \\mathrm{~cm}",
          rotation: -90,
        },
        {
          start: [100, 0, 36],
          end: [100, 0, 96],
          label: "60 \\mathrm{~cm}",
          rotation: -90,
        },
        {
          start: [120, 0, 0],
          end: [120, 0, 96],
          label: "96 \\mathrm{~cm}",
          rotation: -90,
        },
      ]}
    />
  );
};
