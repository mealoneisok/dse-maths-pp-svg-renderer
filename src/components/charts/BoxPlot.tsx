// src/components/charts/BoxPlot.tsx

import React from "react";
import { ChartFrame } from "./ChartFrame";
import { Segment } from "../elements";
import { type AxisConfig } from "../types";
import { LAYOUT } from "../../constants";

export interface BoxPlotData {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
}

export interface BoxPlotProps {
  width: number;
  height: number;
  padding?: number | [number, number, number, number];
  data: BoxPlotData;
  xAxis?: AxisConfig;
  boxHeight?: number; // 盒子的絕對高度
  color?: string;
  strokeWidth?: number;
  showProjections?: boolean; // 是否顯示向下投影到 X 軸的虛線 (圖二風格)
}

export const BoxPlot: React.FC<BoxPlotProps> = ({
  width,
  height,
  padding = 0,
  data,
  xAxis,
  boxHeight = 40,
  color = "black",
  strokeWidth = LAYOUT.DEFAULT_STROKE_WIDTH,
  showProjections = false,
}) => {
  return (
    <ChartFrame
      width={width}
      height={height}
      padding={padding}
      // 盒鬚圖通常只需要 X 軸，因此關閉左、右、上的邊界與 Y 軸
      borders={{ bottom: true, left: false, right: false, top: false }}
      xAxis={xAxis}
      yAxis={{
        showNumbers: false,
        showTickLines: false,
        showArrow: false,
        grid: false,
      }}
    >
      {({ scaleX, startY, endY }) => {
        // 取得垂直空間的中心點，用來放置盒鬚圖
        const midY = (startY + endY) / 2;
        const boxTop = midY - boxHeight / 2;
        const boxBottom = midY + boxHeight / 2;

        // 計算五個關鍵數據的 X 座標
        const xMin = scaleX(data.min);
        const xQ1 = scaleX(data.q1);
        const xMed = scaleX(data.median);
        const xQ3 = scaleX(data.q3);
        const xMax = scaleX(data.max);

        return (
          <g>
            {/* 1. 繪製向下投影虛線 (圖二風格) */}
            {showProjections && (
              <>
                {/* 尾端從中心線開始往下 */}
                <Segment
                  start={[xMin, midY]}
                  end={[xMin, startY]}
                  dash="dotted"
                  strokeWidth={1}
                  color={color}
                />
                <Segment
                  start={[xMax, midY]}
                  end={[xMax, startY]}
                  dash="dotted"
                  strokeWidth={1}
                  color={color}
                />
                {/* 盒子部分從底部開始往下 */}
                <Segment
                  start={[xQ1, boxBottom]}
                  end={[xQ1, startY]}
                  dash="dotted"
                  strokeWidth={1}
                  color={color}
                />
                <Segment
                  start={[xMed, boxBottom]}
                  end={[xMed, startY]}
                  dash="dotted"
                  strokeWidth={1}
                  color={color}
                />
                <Segment
                  start={[xQ3, boxBottom]}
                  end={[xQ3, startY]}
                  dash="dotted"
                  strokeWidth={1}
                  color={color}
                />
              </>
            )}

            {/* 2. 繪製左右鬚線 (Whiskers) */}
            <Segment
              start={[xMin, midY]}
              end={[xQ1, midY]}
              color={color}
              strokeWidth={strokeWidth}
            />
            <Segment
              start={[xQ3, midY]}
              end={[xMax, midY]}
              color={color}
              strokeWidth={strokeWidth}
            />

            {/* 3. 繪製盒子本體 (Box) */}
            <rect
              x={xQ1}
              y={boxTop}
              width={xQ3 - xQ1}
              height={boxHeight}
              fill="none" // 根據需求也可以改成白色或其他顏色
              stroke={color}
              strokeWidth={strokeWidth}
            />

            {/* 4. 繪製中位數線 (Median) */}
            <Segment
              start={[xMed, boxTop]}
              end={[xMed, boxBottom]}
              color={color}
              strokeWidth={strokeWidth}
            />
          </g>
        );
      }}
    </ChartFrame>
  );
};
