// src/components/charts/ChartFrame.tsx

import React, { useMemo, type ReactNode } from "react";
import { type AxisConfig } from "../types";
import { Axis, Segment, Label } from "../elements";
import { LAYOUT } from "../../constants";
import {
  calculateLayout,
  type ChartLayoutResult,
} from "../../utils/layout/chartFrame";
import { normalizeAxis, normalizeLabel } from "../../utils/type";

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

  const {
    _xAxis,
    _yAxis,
    startX,
    endX,
    startY,
    endY,
    xExtend,
    yExtend,
    xMetrics,
    yMetrics,
  } = layout;

  // 定義渲染開關
  const showYAxis = borders?.left ?? true;
  const showXAxis = borders?.bottom ?? true;
  const xAxisCfg = normalizeAxis(_xAxis, {
    tickLineAlign: 0,
  });
  const yAxisCfg = normalizeAxis(_yAxis, {
    tickLineAlign: 0,
  });
  const xTitle = _xAxis.title
    ? normalizeLabel(_xAxis.title, {
        align: "bottom",
        offset: xMetrics.titleOffset,
      })
    : undefined;

  const yTitle = _yAxis.title
    ? normalizeLabel(_yAxis.title, {
        align: "top",
        offset: yMetrics.titleOffset,
        rotation: -90,
      })
    : undefined;

  return (
    <svg
      className="bg-white shadow-md transition-all duration-100 ease-out"
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 繪製主標題：還原正確的錨點與往上推 (top) */}
      {title && (
        <Label
          pos={[width / 2, endY - yExtend]}
          align="top"
          offset={titleGap}
          text={title}
        />
      )}

      {/* 繪製 Y 軸 (受 borders.left 控制) */}
      {showYAxis && (
        <Axis
          {...yAxisCfg}
          title={yTitle}
          start={[startX, startY]}
          end={[startX, endY]}
          extendStart={0}
          extendEnd={yExtend}
          tickTextPos="left"
          skipZero={false}
          grid={
            _yAxis.grid
              ? {
                  length: endX - startX,
                  direction: "positive",
                  skipZero: false,
                  color: "#e0e0e0",
                  dash: "dotted",
                  ...(typeof _yAxis.grid === "object" ? _yAxis.grid : {}),
                }
              : null
          }
        />
      )}

      {/* 繪製 X 軸 (受 borders.bottom 控制) */}
      {showXAxis && (
        <Axis
          {...xAxisCfg}
          title={xTitle}
          start={[startX, startY]}
          end={[endX, startY]}
          extendStart={0}
          extendEnd={xExtend}
          tickTextPos="bottom"
          skipZero={false}
          grid={
            _xAxis.grid
              ? {
                  length: startY - endY, // 自動計算畫布內部的高度
                  direction: "negative", // X 軸法向量朝下，要往上畫入畫布需設為 negative
                  skipZero: false,
                  color: "#e0e0e0",
                  dash: "dotted",
                  ...(typeof _xAxis.grid === "object" ? _xAxis.grid : {}),
                }
              : null
          }
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
