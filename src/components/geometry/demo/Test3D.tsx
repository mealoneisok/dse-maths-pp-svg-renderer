// src/components/geometry/demo/Test3D.tsx

import { GeometryFrame3D } from "../GeometryFrame3D";

export const Test3D = () => {
  // 定義一個正方形底面 (邊長為 4)
  const squareBase: [number, number][] = [
    [-2, -2],
    [2, -2],
    [2, 2],
    [-2, 2],
  ];

  return (
    <GeometryFrame3D
      width={200}
      solids={[
        {
          type: "lofted",
          baseVertices: squareBase,
          height: 6,
          topScale: 0, // 0 代表縮成一個點 (錐體)
          shift: [1, 2], // 頂點中心向 (x=1, y=2) 偏移，形成斜錐
          color: "#1e3a8a",
        },
      ]}
      // 2. 繪製 3D 輔助線 (例如：標示「高」以及「底面對角線」)
      segments={[
        {
          start: [0, 0, 0], // 底面中心
          end: [1, 2, 6], // 頂點 (符合 shift 與 height)
          color: "#e11d48",
          dash: "5 5", // 虛線標示內部的高
        },
        {
          start: [-2, -2, 0], // 底面頂點 1
          end: [2, 2, 0], // 底面頂點 3
          color: "#10b981",
          dash: "3 3",
        },
      ]}
      // 3. 標示 3D 空間中的點與文字
      points={[
        { pos: [1, 2, 6], label: { text: "V", offset: 12 } },
        { pos: [0, 0, 0], label: { text: "O", offset: 8 } },
        { pos: [2, 2, 0], label: { text: "A", align: "bottom-right" } },
      ]}
    />
  );
};
