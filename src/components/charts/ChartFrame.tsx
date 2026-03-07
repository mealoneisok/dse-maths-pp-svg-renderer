// src/components/charts/ChartFrame.tsx

import React, { useMemo, type ReactNode } from "react";
import { type AxisConfig, type ParsedAxisConfig } from "../types";
import { Axis, Segment, Label } from "../elements";
import { getChartFramePadding, type AxisMetrics } from "../../utils/layout";
import { createLinearScale } from "../../utils/scale";
import { parseTicks } from "../../utils/ticks";

export interface ChartLayoutData {
  _xAxis: ParsedAxisConfig;
  _yAxis: ParsedAxisConfig;
  startX: number;
  endX: number;
  startY: number;
  endY: number;
  scaleY: (v: number) => number;
  scaleX: (v: number) => number;
  getBandX: (i: number, total: number) => number;
  xExtend: number;
  yExtend: number;
  xMetrics: AxisMetrics;
  yMetrics: AxisMetrics;
}

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
  svgDefs?: ReactNode;
  children: (layout: ChartLayoutData) => ReactNode;
}

function calculateLayout(
  width: number,
  height: number,
  xAxisCfg?: AxisConfig,
  yAxisCfg?: AxisConfig,
  title?: string,
  titleGap: number = 20,
  padding: ChartFrameProps["padding"] = 0,
  borders?: ChartFrameProps["borders"],
): ChartLayoutData {
  const basePadding: [number, number, number, number] = Array.isArray(padding)
    ? padding
    : [padding, padding, padding, padding];

  const showYAxis = borders?.left ?? true;
  const showXAxis = borders?.bottom ?? true;

  const _xAxis: ParsedAxisConfig = {
    showNumbers: true,
    showTickLines: false,
    showArrow: false,
    ...xAxisCfg,
    ...parseTicks(xAxisCfg || {}),
  };

  const _yAxis: ParsedAxisConfig = {
    showNumbers: true,
    showTickLines: true,
    showArrow: false,
    grid: true,
    ...yAxisCfg,
    ...parseTicks(yAxisCfg || {}),
  };

  const paddingResult = getChartFramePadding({
    width,
    height,
    xAxis: _xAxis,
    yAxis: _yAxis,
    title,
    titleGap,
    basePadding,
    showXAxis,
    showYAxis,
    borders,
  });

  const {
    top: pTop,
    right: pRight,
    bottom: pBot,
    left: pLeft,
    xExtend,
    yExtend,
    xMetrics,
    yMetrics,
  } = paddingResult;

  // 1. 計算最終畫布範圍
  const startX = pLeft,
    endX = width - pRight;
  const startY = height - pBot,
    endY = pTop;

  const scaleY = _yAxis.domain
    ? createLinearScale(_yAxis.domain[0], _yAxis.domain[1], startY, endY)
    : (v: number) => startY - v;

  const scaleX = _xAxis.domain
    ? createLinearScale(_xAxis.domain[0], _xAxis.domain[1], startX, endX)
    : (v: number) => startX + v;

  const getBandX = (i: number, total: number) =>
    startX + (endX - startX) * ((i + 0.5) / total);

  return {
    _xAxis,
    _yAxis,
    startX,
    endX,
    startY,
    endY,
    scaleY,
    scaleX,
    getBandX,
    xExtend,
    yExtend,
    xMetrics,
    yMetrics,
  };
}

export const ChartFrame: React.FC<ChartFrameProps> = ({
  width,
  height,
  title,
  titleGap = 20,
  padding = 0,
  xAxis,
  yAxis,
  borders,
  svgDefs,
  children,
}) => {
  const layout = useMemo(
    () =>
      calculateLayout(
        width,
        height,
        xAxis,
        yAxis,
        title,
        titleGap,
        padding,
        borders,
      ),
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

  return (
    <svg
      className="bg-white shadow-md transition-all duration-100 ease-out"
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
    >
      {svgDefs}

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
          {..._yAxis}
          start={[startX, startY]}
          end={[startX, endY]}
          extendStart={0}
          extendEnd={yExtend}
          tickLineAlign={0}
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
          title={
            _yAxis.title
              ? typeof _yAxis.title === "string"
                ? {
                    align: "top",
                    offset: yMetrics.titleOffset,
                    text: _yAxis.title,
                    rotation: -90,
                  }
                : {
                    align: "top",
                    offset: yMetrics.titleOffset,
                    rotation: -90,
                    ..._yAxis.title,
                  }
              : null
          }
        />
      )}

      {/* 繪製 X 軸 (受 borders.bottom 控制) */}
      {showXAxis && (
        <Axis
          {..._xAxis}
          start={[startX, startY]}
          end={[endX, startY]}
          extendStart={0}
          extendEnd={xExtend}
          tickLineAlign={0}
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
          title={
            _xAxis.title
              ? typeof _xAxis.title === "string"
                ? {
                    align: "bottom",
                    offset: xMetrics.titleOffset,
                    text: _xAxis.title,
                  }
                : {
                    align: "bottom",
                    offset: xMetrics.titleOffset,
                    ..._xAxis.title,
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
