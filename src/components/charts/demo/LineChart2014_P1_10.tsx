// src/components/charts/demo/LineChart2014_P1_10.tsx

import React from "react";
import { LineChart } from "../LineChart";

const timeToMins = (h: number, m: number) => (h - 7) * 60 + m;

export const LineChart2014_P1_10: React.FC = () => {
  return (
    <LineChart
      width={600}
      height={350}
      title="\text{Car Journey Graph}"
      titleGap={20}
      xAxis={{
        domain: [timeToMins(7, 30), timeToMins(9, 30)],
        ticks: [timeToMins(7, 30), timeToMins(8, 15), timeToMins(9, 30)],
        tickMap: {
          [timeToMins(7, 30)]: "\\text{7:30}",
          [timeToMins(8, 15)]: "\\text{8:15}",
          [timeToMins(9, 30)]: "\\text{9:30}",
        },
        showArrow: true,
        title: "\\text{Time}",
      }}
      yAxis={{
        domain: [0, 80],
        ticks: [0, 44, 80],
        grid: false,
        showArrow: true,
        title: "\\text{Distance from town } X \\text{ (km)}",
        showTickLines: false,
      }}
      annotations={[
        {
          pos: [timeToMins(7, 30), 0],
          text: "\\text{X}",
          align: "left",
          offset: 35,
        },
        {
          pos: [timeToMins(7, 30), 80],
          text: "\\text{Y}",
          align: "left",
          offset: 35,
        },
      ]}
      lines={[
        {
          points: [
            [timeToMins(7, 30), 0],
            [timeToMins(9, 30), 80],
          ],
          label: {
            text: "\\text{Car } A",
            pos: [timeToMins(8, 45), 65],
            align: "top",
            offset: 10,
          },
        },
        {
          points: [
            [timeToMins(7, 30), 0],
            [timeToMins(8, 15), 44],
            [timeToMins(8, 45), 44],
            [timeToMins(9, 30), 80],
          ],
          label: {
            text: "\\text{Car } B",
            pos: [timeToMins(9, 0), 56],
            align: "bottom",
            offset: 10,
          },
          guidelines: [
            [
              [timeToMins(8, 15), 0],
              [timeToMins(8, 15), 44],
            ],
            [
              [timeToMins(7, 30), 44],
              [timeToMins(8, 15), 44],
            ],
            [
              [timeToMins(9, 30), 0],
              [timeToMins(9, 30), 80],
            ],
            [
              [timeToMins(7, 30), 80],
              [timeToMins(9, 30), 80],
            ],
          ],
        },
      ]}
    />
  );
};
