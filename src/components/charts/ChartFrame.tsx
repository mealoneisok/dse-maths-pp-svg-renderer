// src/components/charts/ChartFrame.tsx

import React, { useMemo, type ReactNode } from "react";
import { type AxisConfig } from "../types";
import { Axis, Segment, Label } from "../elements";
import { LAYOUT } from "../../constants";
import {
  calculateLayout,
  type ChartLayoutResult,
} from "../../utils/layout/chartFrame";

interface ChartFrameProps {
  width: number;
  height: number;
  title?: string;
  titleGap?: number;
  padding?: number | [number, number, number, number];
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  borders?: {
    right?: boolean;
    top?: boolean;
    bottom?: boolean;
    left?: boolean;
  };
  children: (layout: ChartLayoutResult) => ReactNode;
}

export const ChartFrame: React.FC<ChartFrameProps> = ({
  width,
  height,
  title,
  titleGap = LAYOUT.DEFAULT_CHART_TITLE_GAP,
  padding = 0,
  xAxis,
  yAxis,
  borders,
  children,
}) => {
  const layout = useMemo(
    () =>
      calculateLayout({
        width,
        height,
        xAxisCfg: xAxis,
        yAxisCfg: yAxis,
        title,
        titleGap,
        padding,
        borders,
      }),
    [width, height, xAxis, yAxis, title, titleGap, padding, borders],
  );

  const { _xAxis, _yAxis, startX, endX, startY, endY, xExtend, yExtend } =
    layout;

  const showYAxis = borders?.left ?? true;
  const showXAxis = borders?.bottom ?? true;

  return (
    <svg
      className="bg-white shadow-md transition-all duration-100 ease-out"
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 繪製主標題 */}
      {title && (
        <Label
          pos={[width / 2, endY - yExtend]}
          align="top"
          offset={titleGap}
          text={title}
        />
      )}

      {/* 繪製 Y 軸 */}
      {showYAxis && <Axis {..._yAxis} />}

      {/* 繪製 X 軸 */}
      {showXAxis && (
        <Axis
          {..._xAxis} // 直接展開已正規化的 _xAxis
        />
      )}

      {/* 邊界 */}
      {borders?.top && (
        <Segment
          start={[startX, endY - yExtend]}
          end={[endX + xExtend, endY - yExtend]}
        />
      )}
      {borders?.right && (
        <Segment start={[endX, endY - yExtend]} end={[endX, startY]} />
      )}

      {/* 把算好的 layout 傳給圖表內容（折線、長條圖）去繪製 */}
      {children(layout)}
    </svg>
  );
};
