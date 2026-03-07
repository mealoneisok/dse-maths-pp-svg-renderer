// src/components/charts/BarChart.tsx

import React, { useMemo } from "react";
import { type AxisConfig } from "../types";
import { DiagonalHatch, Label, type LabelConfig } from "../elements";
import { ChartFrame } from "./ChartFrame";

interface BarFillConfig {
  type?: "hatch" | "solid" | string;
  spacing?: number;
  angle?: number;
  background?: string;
  color?: string;
}

export interface BarChartData {
  val: number;
  fill?: BarFillConfig | string;
  stroke?: string;
  label?: string | LabelConfig;
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
  barFill?: BarFillConfig;
  borders?: {
    right?: boolean;
    top?: boolean;
    bottom?: boolean;
    left?: boolean;
  };
}

interface BarProps {
  pos: [number, number]; // [bx, by] 長條圖左上角坐標
  width: number;
  height: number;
  fill?: string;
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
  const labelObj: LabelConfig | null =
    typeof label === "string" ? { text: label } : label || null;

  return (
    <g>
      <rect
        x={bx}
        y={by}
        width={width}
        height={height}
        fill={fill}
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
  const defs = useMemo(() => {
    if (barFill?.type === "hatch") {
      return (
        <defs>
          <DiagonalHatch
            id="hatch-pattern-default"
            spacing={barFill.spacing}
            angle={barFill.angle}
            background={barFill.background}
            color={barFill.color}
          />
        </defs>
      );
    }
    return null;
  }, [barFill]);

  return (
    <ChartFrame
      width={width}
      height={height}
      title={title}
      titleGap={titleGap}
      xAxis={xAxis}
      yAxis={yAxis}
      borders={borders}
      svgDefs={defs}
    >
      {/* 接收 ChartFrame 計算好的 layout Props */}
      {({ scaleY, getBandX, startY }) => (
        <g className="bars-layer">
          {data.map((d, i) => {
            const bx = getBandX(i, data.length) - barWidth / 2;
            const by = scaleY(d.val);

            // 判斷填色
            let fillUrl = "none";
            if (typeof d.fill === "string") {
              fillUrl = d.fill;
            } else if (barFill?.type === "hatch") {
              fillUrl = "url(#hatch-pattern-default)";
            }

            return (
              <Bar
                key={`bar-${i}`}
                pos={[bx, by]}
                width={barWidth}
                height={startY - by}
                fill={fillUrl}
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
