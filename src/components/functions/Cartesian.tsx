// src/components/functions/Cartesian.tsx

import React, { useMemo } from "react";
import { calculateLayout } from "../../utils/layout/cartesian";
import {
  Axis,
  Label,
  Point,
  type PointProps,
  type LabelConfig,
  type RegionProps,
  Region,
} from "../elements";
import { FunctionGraph, type FunctionGraphConfig } from "./FunctionGraph";
import { type CartesianAxisConfig } from "../types";
import { LAYOUT } from "../../constants";

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
  const layout = useMemo(() => {
    return calculateLayout({
      width,
      height,
      padding,
      showOrigin,
      originLabel,
      xAxis,
      yAxis,
    });
  }, [width, height, padding, showOrigin, originLabel, xAxis, yAxis]);

  const { pt } = layout;

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
            const startPx = pt(region.start[0], region.start[1]);
            const pathsPx = region.paths
              .filter((p) => p && p.to)
              .map((p) => ({
                ...p,
                to: pt(p.to[0], p.to[1]),
                radius: p.radius
                  ? Math.abs(layout.scaleX(p.radius) - layout.scaleX(0))
                  : undefined,
              }));

            return (
              <Region
                key={`region-${index}`}
                start={startPx}
                paths={pathsPx}
                fill={region.fill}
                stroke={region.stroke || "none"}
                strokeWidth={region.strokeWidth || 0}
              />
            );
          })}

        {/* --- 1. 繪製 X 軸 --- */}
        <Axis
          {...xAxis}
          start={pt(layout.xDomain[0], 0)}
          end={pt(layout.xDomain[1], 0)}
          tickValues={layout.xTicks}
          extendStart={layout.xExtStart}
          extendEnd={layout.xExtEnd}
          tickTextPos={xAxis.tickTextPos ?? "bottom"}
          showRotationArrow={xAxis.showRotationArrow}
          grid={layout.xGrid}
          label={layout.xLabel}
        />

        {/* --- 2. 繪製 Y 軸 --- */}
        <Axis
          {...yAxis}
          start={pt(0, layout.yDomain[0])}
          end={pt(0, layout.yDomain[1])}
          tickValues={layout.yTicks}
          extendStart={layout.yExtStart}
          extendEnd={layout.yExtEnd}
          tickTextPos={yAxis.tickTextPos ?? "left"}
          showRotationArrow={yAxis.showRotationArrow}
          grid={layout.yGrid}
          label={layout.yLabel}
        />

        {/* --- 3. 原點標記 --- */}
        {showOrigin && originLabel !== null && layout.originLabelObj && (
          <Label
            {...layout.originLabelObj}
            pos={layout.originLabelObj.pos ?? pt(0, 0)}
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
