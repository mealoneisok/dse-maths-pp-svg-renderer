// src/components/functions/demo/Lines2016_P2_35.tsx

import React from "react";
import { Cartesian } from "../Cartesian";

export const Lines2016_P2_35: React.FC = () => {
  return (
    <Cartesian
      width={400}
      height={400}
      showOrigin={true}
      xAxis={{
        domain: [0, 24],
        step: 12,
        showTickLines: false,
      }}
      yAxis={{
        domain: [0, 24],
        step: 6,
        showTickLines: false,
        tickMap: { 18: "" },
      }}
      padding={0}
      regions={[
        {
          // 1. 指定起始點 (對應原本陣列的第一個點 P)
          start: [9, 6],
          // 2. 指定接下來的繪製路徑 (Q -> R -> S)
          paths: [
            { type: "line", to: [18, 6] }, // Q
            { type: "line", to: [12, 12] }, // R
            { type: "line", to: [6, 12] }, // S
          ],
          // 3. 直接使用 normalizeFill 支援的關鍵字
          fill: "default-hatch",
        },
      ]}
      graphs={[
        { fn: (x) => -2 * x + 24, domain: [0, 12], color: "black" },
        { fn: (x) => -x + 24, domain: [0, 24], color: "black" },
        { fn: () => 12, domain: [0, 12], color: "black", strokeWidth: 1 },
        { fn: () => 6, domain: [0, 18], color: "black", strokeWidth: 1 },
      ]}
      points={[
        { mathX: 9, mathY: 6, label: { text: "P", align: "bottom-left" } },
        { mathX: 18, mathY: 6, label: { text: "Q", align: "top-right" } },
        { mathX: 12, mathY: 12, label: { text: "R", align: "top-right" } },
        { mathX: 6, mathY: 12, label: { text: "S", align: "bottom-left" } },
      ]}
    />
  );
};
