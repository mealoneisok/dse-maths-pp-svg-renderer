// src/components/functions/Cartesian.tsx

import React, { useMemo } from "react";
import { getCartesianPadding } from "../../utils/layout";
import { createLinearScale } from "../../utils/scale";
import {
  Axis,
  Label,
  Point,
  type TickValue,
  type PointProps,
  type LabelConfig,
  type RegionProps,
  Region,
} from "../elements";
import { FunctionGraph, type FunctionGraphConfig } from "./FunctionGraph";
import { type CartesianAxisConfig } from "../types";
import { LAYOUT, EPSILON } from "../../constants";
import { normalizePadding } from "../../utils/type";

interface CartesianPoint extends Omit<PointProps, "pos"> {
  mathX: number;
  mathY: number;
}

interface CartesianProps {
  width: number;
  height: number;
  padding?: number | [number, number, number, number];
  showOrigin?: boolean;
  originLabel?: LabelConfig | string | null;
  xAxis: CartesianAxisConfig;
  yAxis: CartesianAxisConfig;
  graphs?: FunctionGraphConfig[];
  points?: CartesianPoint[];
  regions?: RegionProps[];
}

export const Cartesian: React.FC<CartesianProps> = ({
  width,
  height,
  padding = 10,
  showOrigin = true,
  originLabel = LAYOUT.DEFAULT_CARTESIAN_ORIGIN_LABEL_TEXT,
  xAxis,
  yAxis,
  graphs = [],
  points = [],
  regions = [],
}) => {
  const xDomain = xAxis.domain || LAYOUT.DEFAULT_AXIS_DOMAIN;
  const yDomain = yAxis.domain || LAYOUT.DEFAULT_AXIS_DOMAIN;
  const xStep = xAxis.step || LAYOUT.DEFAULT_AXIS_STEP;
  const yStep = yAxis.step || LAYOUT.DEFAULT_AXIS_STEP;
  const basePadding = normalizePadding(padding);

  const generateTicks = (
    domain: [number, number],
    step: number,
  ): TickValue[] => {
    const ticks: TickValue[] = [];
    const min = Math.ceil(domain[0] / step) * step;
    for (let v = min; v <= domain[1]; v += step) {
      ticks.push({
        val: parseFloat(v.toPrecision(12)),
        t: (v - domain[0]) / (domain[1] - domain[0]),
        isZero: Math.abs(v) < EPSILON,
      });
    }
    return ticks;
  };
  const xTicks = useMemo(() => generateTicks(xDomain, xStep), [xDomain, xStep]);
  const yTicks = useMemo(() => generateTicks(yDomain, yStep), [yDomain, yStep]);

  // 2. 動態計算四面八方的 Padding
  const dynamicPadding = useMemo(() => {
    return getCartesianPadding({
      xAxis,
      yAxis,
      xTicks,
      yTicks,
      basePadding,
      showOrigin,
      originLabel,
    });
  }, [xAxis, yAxis, xTicks, yTicks, basePadding, showOrigin, originLabel]);

  // 3. 根據動態 Padding 建立真正的比例尺
  const scaleX = useMemo(
    () =>
      createLinearScale(
        xDomain[0],
        xDomain[1],
        dynamicPadding.left,
        width - dynamicPadding.right,
      ),
    [xDomain, dynamicPadding.left, dynamicPadding.right, width],
  );

  const scaleY = useMemo(
    () =>
      createLinearScale(
        yDomain[0],
        yDomain[1],
        height - dynamicPadding.bottom,
        dynamicPadding.top,
      ),
    [yDomain, dynamicPadding.bottom, dynamicPadding.top, height],
  );

  const pt = useMemo(() => {
    return (x: number, y: number): [number, number] => [scaleX(x), scaleY(y)];
  }, [scaleX, scaleY]);

  // 4. 計算網格長度 (精確對齊對方軸線的起點與終點)
  const xExtStart = xAxis.extendStart ?? LAYOUT.DEFAULT_AXIS_EXTEND_START;
  const xExtEnd = xAxis.extendEnd ?? LAYOUT.DEFAULT_AXIS_EXTEND_END;
  const yExtStart = yAxis.extendStart ?? LAYOUT.DEFAULT_AXIS_EXTEND_START;
  const yExtEnd = yAxis.extendEnd ?? LAYOUT.DEFAULT_AXIS_EXTEND_END;

  // --- 計算 X 軸網格線的距離 ---
  const xAxisY = scaleY(0);
  // Y 軸的上/下邊界座標 (SVG Y軸朝下，所以 top 值反而較小)
  const yAxisBottom = scaleY(yDomain[0]) + yExtStart;
  const yAxisTop = scaleY(yDomain[1]) - yExtEnd;
  // X 軸的法向量朝下，所以負方向為上 (yAxisTop)，正方向為下 (yAxisBottom)
  const xGridNegLen = xAxisY - yAxisTop;
  const xGridPosLen = yAxisBottom - xAxisY;

  // --- 計算 Y 軸網格線的距離 ---
  const yAxisX = scaleX(0);
  // X 軸的左/右邊界座標
  const xAxisLeft = scaleX(xDomain[0]) - xExtStart;
  const xAxisRight = scaleX(xDomain[1]) + xExtEnd;
  // Y 軸的法向量朝右，所以負方向為左 (xAxisLeft)，正方向為右 (xAxisRight)
  const yGridNegLen = yAxisX - xAxisLeft;
  const yGridPosLen = xAxisRight - yAxisX;

  return (
    <svg
      className="bg-white shadow-md transition-all duration-100 ease-out"
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        {/* --- 繪製多邊形區域 --- */}
        {regions
          .filter((r) => r && r.start && r.paths)
          .map((region, index) => {
            // 直接在這裡做防禦性轉換
            const startPx = pt(region.start[0], region.start[1]);
            const pathsPx = region.paths
              .filter((p) => p && p.to)
              .map((p) => ({
                ...p,
                to: pt(p.to[0], p.to[1]),
                radius: p.radius
                  ? Math.abs(scaleX(p.radius) - scaleX(0))
                  : undefined,
              }));

            return (
              <Region
                key={`region-${index}`}
                start={startPx}
                paths={pathsPx as any}
                fill={region.fill} // 直接傳入原始 fill 給 Region 解析
                stroke={region.stroke || "none"}
                strokeWidth={region.strokeWidth || 0}
              />
            );
          })}

        {/* --- 1. 繪製 X 軸 --- */}
        <Axis
          {...xAxis} // 將 xAxis 內的所有設定 (含 grid, showArrow 等) 直接展開
          start={pt(xDomain[0], 0)}
          end={pt(xDomain[1], 0)}
          tickValues={xTicks}
          extendStart={xAxis.extendStart ?? LAYOUT.DEFAULT_AXIS_EXTEND_START}
          extendEnd={xAxis.extendEnd ?? LAYOUT.DEFAULT_AXIS_EXTEND_END}
          tickTextPos={xAxis.tickTextPos ?? "bottom"}
          showRotationArrow={xAxis.showRotationArrow}
          // 若 xAxis.grid 為 true，則套用數學座標系的預設十字網格
          grid={
            xAxis.grid === true
              ? {
                  length: [xGridNegLen, xGridPosLen],
                  direction: "both",
                  skipZero: true,
                  dash: "dotted",
                }
              : typeof xAxis.grid === "object"
                ? xAxis.grid
                : null
          }
          // 若無 label 則用預設 "x"，若有則依類型處理
          label={
            xAxis.label == null
              ? { align: "bottom", offset: 8, text: "x" }
              : typeof xAxis.label === "string"
                ? { align: "bottom", offset: 8, text: xAxis.label }
                : xAxis.label
          }
        />

        {/* --- 2. 繪製 Y 軸 --- */}
        <Axis
          {...yAxis}
          start={pt(0, yDomain[0])}
          end={pt(0, yDomain[1])}
          tickValues={yTicks}
          extendStart={yAxis.extendStart ?? LAYOUT.DEFAULT_AXIS_EXTEND_START}
          extendEnd={yAxis.extendEnd ?? LAYOUT.DEFAULT_AXIS_EXTEND_END}
          tickTextPos={yAxis.tickTextPos ?? "left"}
          showRotationArrow={yAxis.showRotationArrow}
          grid={
            yAxis.grid === true
              ? {
                  length: [yGridNegLen, yGridPosLen],
                  direction: "both",
                  skipZero: true,
                  dash: "dotted",
                }
              : typeof yAxis.grid === "object"
                ? yAxis.grid
                : null
          }
          label={
            yAxis.label == null
              ? { align: "left", offset: 8, text: "y" }
              : typeof yAxis.label === "string"
                ? { align: "left", offset: 8, text: yAxis.label }
                : yAxis.label
          }
        />

        {/* --- 3. 原點標記 --- */}
        {showOrigin && originLabel !== null && (
          <Label
            align={LAYOUT.DEFAULT_CARTESIAN_ORIGIN_LABEL_ALIGN as any}
            offset={LAYOUT.DEFAULT_CARTESIAN_ORIGIN_LABEL_OFFSET}
            {...(typeof originLabel === "string"
              ? { text: originLabel }
              : originLabel)}
            pos={
              typeof originLabel === "object" && originLabel.pos
                ? originLabel.pos
                : pt(0, 0)
            }
          />
        )}

        {/* --- 4. 繪製函數圖形 --- */}
        {graphs.map((graphData, index) => (
          <FunctionGraph key={`graph-${index}`} {...graphData} pt={pt} />
        ))}

        {/* --- 5. 繪製標記點 --- */}
        {points.map((pointData, index) => {
          const { mathX, mathY, ...restProps } = pointData;
          return (
            <Point
              key={`point-${index}`}
              {...restProps}
              pos={pt(mathX, mathY)}
            />
          );
        })}
      </g>
    </svg>
  );
};
