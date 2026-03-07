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
        grid: true,
      }}
      padding={0}
      regions={[
        {
          points: [
            [9, 6], // P
            [18, 6], // Q
            [12, 12], // R
            [6, 12], // S
          ],
          fill: "url(#default-hatch)", // 直接呼叫 Cartesian 裡定義好的 hatch ID
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
