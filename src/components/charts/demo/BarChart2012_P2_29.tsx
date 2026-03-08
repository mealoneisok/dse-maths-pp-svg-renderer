// src/components/charts/demo/BarChart2012_P2_29.tsx

import React from "react";
import { BarChart } from "../BarChart";

const chartData = [{ val: 2 }, { val: 8 }, { val: 4 }, { val: 6 }, { val: 2 }];

export const BarChart2012_P2_29: React.FC = () => {
  return (
    <BarChart
      width={600}
      height={350}
      xAxis={{
        ticks: ["0", "1", "2", "3", "4"],
        title: "\\text{Number of rings}",
        showTickLines: false,
      }}
      yAxis={{
        domain: [0, 8],
        step: 2,
        title: "\\text{Number of girls}",
        showTickLines: true,
        grid: true,
        extendEnd: 20,
      }}
      borders={{ right: true }}
      barWidth={40}
      barFill={{
        type: "diagonal",
      }}
      data={chartData}
    />
  );
};
