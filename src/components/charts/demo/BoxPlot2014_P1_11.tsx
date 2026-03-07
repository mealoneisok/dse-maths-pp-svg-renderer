// src/components/charts/demo/BoxPlot2014_P1_11.tsx

import React from "react";
import { BoxPlot } from "../BoxPlot";

export const BoxPlot2014_P1_11: React.FC = () => {
  return (
    <BoxPlot
      width={600}
      height={200}
      data={{ min: 18, q1: 42, median: 55, q3: 63, max: 91 }}
      showProjections={true} // 開啟投影線
      xAxis={{
        domain: [10, 100], // 畫布範圍
        ticks: [18, 42, 55, 63, 91], // 只在這些特定點顯示刻度數字
        label: {
          text: "\\text{Price (thousand dollars)}",
          align: "right",
          offset: 15,
        },
        grid: false, // 關閉全局網格
      }}
    />
  );
};
