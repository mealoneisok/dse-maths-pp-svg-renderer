// src/components/charts/demo/BoxPlot2013_P1_15.tsx

import React from "react";
import { BoxPlot } from "../BoxPlot";

export const BoxPlot2013_P1_15: React.FC = () => {
  return (
    <BoxPlot
      width={600}
      height={200}
      data={{ min: 25, q1: 45, median: 55, q3: 70, max: 90 }}
      padding={0}
      xAxis={{
        domain: [20, 100],
        step: 5,
        labelStep: 10,
        showTickLines: true,
        label: {
          text: "\\text{Score (marks)}",
          align: "right",
          offset: 15,
        },
        grid: { dash: "dotted" }, // 開啟全局網格
      }}
    />
  );
};
