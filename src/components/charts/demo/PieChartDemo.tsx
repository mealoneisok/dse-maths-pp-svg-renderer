// src/components/charts/demo/PieChartDemo.tsx

import React from "react";
import { PieChart, type PieSliceData } from "../../charts/PieChart";

export const PieChartDemo: React.FC = () => {
  // === 第一張圖：Stationery Shop X ===
  const chartXData: PieSliceData[] = [
    {
      id: "Others",
      value: 162,
      label: { text: "\\text{Others}" },
      arcLabel: "162^\\circ",
      arcSize: 15,
    },
    {
      id: "Pencil",
      value: 36,
      label: { text: "\\text{Pencil}" },
      arcLabel: "36^\\circ",
      arcSize: 32,
    },
    {
      id: "Ruler",
      value: 68,
      label: { text: "\\text{Ruler}" },
      arcLabel: "68^\\circ",
      arcSize: 22,
    },
    {
      id: "Notebook",
      value: 34,
      label: { text: "\\text{Notebook}" },
      arcLabel: "\\theta",
      arcSize: 15,
    },
    {
      id: "Pen",
      value: 60,
      label: { text: "\\text{Pen}" },
      arcLabel: "60^\\circ",
      arcSize: 20,
    },
  ];

  // === 第一張圖：Stationery Shop Y ===
  const chartYData: PieSliceData[] = [
    {
      id: "Others",
      value: 46,
      label: {
        text: "\\begin{matrix} \\text{Others} \\\\ 46\\% \\end{matrix}",
      },
    },
    {
      id: "Pencil",
      value: 10,
      label: {
        text: "\\begin{matrix} \\text{Pencil} \\\\ 10\\% \\end{matrix}",
      },
    },
    {
      id: "Ruler",
      value: 12,
      label: { text: "\\begin{matrix} \\text{Ruler} \\\\ 12\\% \\end{matrix}" },
    },
    {
      id: "Notebook",
      value: 16,
      label: {
        text: "\\begin{matrix} \\text{Notebook} \\\\ k\\% \\end{matrix}",
      },
    },
    {
      id: "Pen",
      value: 16,
      label: { text: "\\begin{matrix} \\text{Pen} \\\\ 16\\% \\end{matrix}" },
    },
  ];

  // === 第二張圖：John's expenditure ===
  const chart3Data: PieSliceData[] = [
    {
      id: "Meals",
      value: 90,
      label: { text: "\\text{Meals}", fontSize: 16 },
      isRightAngle: true,
      arcSize: 16,
    },
    {
      id: "Transportation",
      value: 60,
      label: { text: "\\text{Transportation}", fontSize: 16 },
    },
    {
      id: "Clothing",
      value: 160,
      label: { text: "\\text{Clothing}", fontSize: 16 },
      arcLabel: "160^\\circ",
      arcSize: 24,
      labelOffset: 0.7,
    },
    {
      id: "Others",
      value: 50,
      label: { text: "\\text{Others}", fontSize: 16 },
      arcLabel: "50^\\circ",
      arcSize: 24,
    },
  ];

  return (
    <div className="flex flex-col items-center gap-12 p-8 bg-gray-50">
      <div className="flex gap-16">
        <PieChart
          width={280}
          padding={0}
          title="\text{Distribution of the profits of stationery shop } X"
          titleGap={20}
          data={chartXData}
          initialAngle={270}
        />
        <PieChart
          width={280}
          padding={0}
          title="\text{Distribution of the profits of stationery shop } Y"
          titleGap={20}
          data={chartYData}
          initialAngle={270}
        />
      </div>

      <div>
        <PieChart width={320} padding={0} data={chart3Data} initialAngle={90} />
      </div>
    </div>
  );
};
