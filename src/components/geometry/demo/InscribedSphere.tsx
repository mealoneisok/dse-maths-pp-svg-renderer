// src/components/geometry/demo/InscribedSphere.tsx

import { GeometryFrame3D } from "../GeometryFrame3D";

export const InscribedSphere = () => {
  // 數學完美的內切約束比例
  const r1 = 16;
  const r2 = 9;
  const r = 12; // Math.sqrt(16 * 9)
  const h = 24; // 2 * r

  return (
    <GeometryFrame3D
      width={200}
      solids={[
        // 1. 畫出球體 (在背後/裡面)
        {
          type: "sphere",
          center: [0, 0, r], // 球心在高度一半的地方
          radius: r,
          color: "#111827",
        },
        // 2. 畫出外側的圓台
        {
          type: "coneFrustum",
          centerBase: [0, 0, 0],
          radiusBottom: r1,
          radiusTop: r2,
          height: h,
          color: "#111827",
        },
      ]}
    />
  );
};
