// src/App.tsx

import { useState } from "react";
import { BarChart, LineChart } from "./components/charts";
import { Cartesian } from "./components/functions";

function App() {
  const [canvasWidth, setCanvasWidth] = useState<number>(600);
  const timeToMins = (h: number, m: number) => (h - 7) * 60 + m;

  const chartData = [
    { val: 2 },
    { val: 8 },
    { val: 4 },
    { val: 6 },
    { val: 2 },
  ];

  return (
    <div className="bg-slate-50 flex flex-col items-center py-10 min-h-screen">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center gap-4 mb-6">
        <label htmlFor="width-slider" className="font-bold text-slate-700">
          畫布寬度 : <span className="text-blue-600">{canvasWidth}</span> px
        </label>
        <input
          type="range"
          id="width-slider"
          min="400"
          max="1000"
          value={canvasWidth}
          step="10"
          onChange={(e) => setCanvasWidth(parseInt(e.target.value))}
          className="w-48 cursor-pointer"
        />
      </div>
      <div className="flex flex-col gap-10 w-full items-center">
        <BarChart
          width={canvasWidth}
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
            type: "hatch",
            spacing: 6,
            angle: 45,
            background: "transparent",
          }}
          data={chartData}
        />

        <BarChart
          width={canvasWidth}
          height={350}
          xAxis={{
            ticks: ["0", "1", "2", "3", "4"],
            showTickLines: false,
            showNumbers: false,
          }}
          yAxis={{
            domain: [0, 8],
            step: 2,
            showTickLines: false,
            showNumbers: false,
            grid: true,
            extendEnd: 20,
          }}
          borders={{ left: false, right: true, top: true }}
          data={chartData}
        />

        <BarChart
          width={canvasWidth}
          height={350}
          xAxis={{
            ticks: ["0", "1", "2", "3", "4"],
            showTickLines: false,
            showNumbers: false,
          }}
          yAxis={{
            domain: [0, 8],
            step: 2,
            showTickLines: true,
            showNumbers: false,
            grid: false,
            extendEnd: 20,
          }}
          borders={{ right: true, top: true }}
          data={chartData}
        />

        <BarChart
          width={canvasWidth}
          height={350}
          xAxis={{
            ticks: ["0", "1", "2", "3", "4"],
            showTickLines: false,
            showNumbers: false,
          }}
          yAxis={{
            domain: [0, 8],
            step: 2,
            showTickLines: true,
            showNumbers: true,
            grid: true,
            extendEnd: 20,
          }}
          borders={{ right: true, top: true }}
          data={chartData}
        />

        <BarChart
          width={canvasWidth}
          height={350}
          xAxis={{
            ticks: ["0", "1", "2", "3", "4"],
            showTickLines: false,
            showNumbers: true,
          }}
          yAxis={{
            domain: [0, 8],
            step: 2,
            showTickLines: false,
            showNumbers: false,
            grid: true,
            extendEnd: 20,
          }}
          borders={{ right: true, top: true }}
          data={chartData}
        />

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

        <LineChart
          width={600}
          height={350}
          titleGap={20}
          xAxis={{
            domain: [timeToMins(7, 30), timeToMins(9, 30)],
            ticks: [timeToMins(7, 30), timeToMins(8, 15), timeToMins(9, 30)],
            tickMap: {
              [timeToMins(7, 30)]: "\\text{7:30}",
              [timeToMins(8, 15)]: "\\text{8:15}",
              [timeToMins(9, 30)]: "\\text{9:30}",
            },
            showArrow: false,
            title: "\\text{Time}",
          }}
          yAxis={{
            domain: [0, 80],
            ticks: [0, 44, 80],
            step: 20,
            grid: false,
            showArrow: false,
            showTickLines: false,
            //showNumbers: false,
          }}
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
            },
          ]}
        />

        <Cartesian
          width={canvasWidth}
          height={400}
          padding={50}
          showOrigin={true}
          xAxis={{
            domain: [-5, 5],
            step: 1,
            label: "x",
            showRotationArrow: true,
            grid: true, // 開啟 X 軸的十字網格
          }}
          yAxis={{
            domain: [-4, 4],
            step: 1,
            label: "y",
            showRotationArrow: true,
            grid: true, // 開啟 Y 軸的十字網格
          }}
          graphs={[
            {
              fn: (x) => 0.5 * x - 1,
              domain: [-4, 4],
              color: "blue",
              label: {
                text: "y = \\frac{1}{2}x - 1",
                x: 4,
                align: "bottom-right",
              },
            },
          ]}
          points={[
            {
              mathX: 2,
              mathY: 0,
              type: "circle",
              color: "red",
              size: 5,
              label: { text: "A(2, 0)", align: "top-left" },
            },
            {
              mathX: -2,
              mathY: -2,
              type: "cross",
              color: "green",
              size: 6,
              label: { text: "B", align: "bottom-right" },
            },
          ]}
        />
      </div>
    </div>
  );
}

export default App;
