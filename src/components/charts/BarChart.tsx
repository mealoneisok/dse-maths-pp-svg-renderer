// src/components/charts/BarChart.tsx

import React from "react";
import { type AxisConfig } from "../types";
import {
  PatternFill,
  Label,
  type PatternFillConfig,
  type LabelConfig,
  type Vector2,
} from "../elements";
import { ChartFrame } from "./ChartFrame";
import { normalizeLabel, normalizeFill } from "../../utils/type";

export interface BarChartData {
  val: number;
  label?: string | LabelConfig;
  fill?: string | PatternFillConfig;
  stroke?: string;
}

interface BarChartProps {
  width: number;
  height: number;
  title?: string;
  titleGap?: number;
  data: BarChartData[];
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  barWidth?: number;
  barFill?: string | PatternFillConfig;
  borders?: {
    right?: boolean;
    top?: boolean;
    bottom?: boolean;
    left?: boolean;
  };
}

interface BarProps {
  pos: Vector2; // [bx, by] 長條圖左上角坐標
  width: number;
  height: number;
  fill?: string | PatternFillConfig;
  stroke?: string;
  strokeWidth?: number;
  label?: string | LabelConfig;
}

const Bar: React.FC<BarProps> = ({
  pos,
  width,
  height,
  fill = "none",
  stroke = "black",
  strokeWidth = 1.5,
  label,
}) => {
  const [bx, by] = pos;
  const labelObj = normalizeLabel(label);
  const { fillValue, patternDef } = normalizeFill(fill);

  return (
    <g>
      {patternDef && (
        <defs>
          <PatternFill {...patternDef} />
        </defs>
      )}
      <rect
        x={bx}
        y={by}
        width={width}
        height={height}
        fill={fillValue}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      {labelObj && (
        <Label
          pos={labelObj.pos || [bx + width / 2, by - 8]}
          align={labelObj.align || "bottom"}
          offset={labelObj.offset || 0}
          text={labelObj.text}
          color={labelObj.color || stroke}
        />
      )}
    </g>
  );
};

export const BarChart: React.FC<BarChartProps> = ({
  width,
  height,
  title,
  titleGap,
  data,
  xAxis,
  yAxis,
  barWidth = 35,
  barFill,
  borders,
}) => {
  return (
    <ChartFrame
      width={width}
      height={height}
      title={title}
      titleGap={titleGap}
      xAxis={xAxis}
      yAxis={yAxis}
      borders={borders}
    >
      {({ scaleY, getBandX, startY }) => (
        <g className="bars-layer">
          {data.map((d, i) => {
            const bx = getBandX(i, data.length) - barWidth / 2;
            const by = scaleY(d.val);
            const currentFill = d.fill ?? barFill ?? "none";

            return (
              <Bar
                key={`bar-${i}`}
                pos={[bx, by]}
                width={barWidth}
                height={startY - by}
                fill={currentFill}
                stroke={d.stroke || "black"}
                label={d.label}
              />
            );
          })}
        </g>
      )}
    </ChartFrame>
  );
};
