// src/App.tsx

import { useState } from "react";
import {
  BarChart2012_P2_29,
  LineChart2014_P1_10,
  BoxPlot2013_P1_15,
  BoxPlot2014_P1_11,
} from "./components/charts";
import { Lines2016_P2_35, Test } from "./components/functions";
import { PieChartDemo } from "./components/charts/demo/PieChartDemo";
import {
  Pie2012_P2_16,
  Sector2019_P2_38,
  Hexagons2016_P2_23,
  Square2015_P1_13,
  Rectangle2013_P1_17,
  Test3D,
  Pyramid2012_P1_18,
  InscribedSphere,
  PrismPractice_P2_39,
  PyramidWith2DElements,
  FrustumWithWater2012_6,
  CircularCone2014_p1_14,
  CircularCone2012_P1_12,
} from "./components/geometry";

function App() {
  const [canvasWidth, setCanvasWidth] = useState<number>(600);

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
        <CircularCone2012_P1_12 />
        <CircularCone2014_p1_14 />
        <PyramidWith2DElements />
        <FrustumWithWater2012_6 />
        <PrismPractice_P2_39 />
        <InscribedSphere />
        <Test3D />
        <Pyramid2012_P1_18 />
        <PieChartDemo />
        <Hexagons2016_P2_23 />
        <Pie2012_P2_16 />
        <Sector2019_P2_38 />
        <Square2015_P1_13 />
        <Rectangle2013_P1_17 />

        <BarChart2012_P2_29 />
        <LineChart2014_P1_10 />
        <BoxPlot2013_P1_15 />
        <BoxPlot2014_P1_11 />

        <Test canvasWidth={canvasWidth} />
        <Lines2016_P2_35 />
      </div>
    </div>
  );
}

export default App;
