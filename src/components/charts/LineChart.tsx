// src/components/charts/LineChart.tsx

import React from "react";
import { type AxisConfig } from "../types";
import { LAYOUT } from "../../constants";
import { Segment, Label } from "../elements";
import { ChartFrame } from "./ChartFrame";

interface LabelData {
  text: string;
  pos: [number, number];
  align?: string;
  offset?: number;
}

interface LineData {
  points: [number, number][];
  color?: string;
  label?: LabelData;
  guidelines?: [[number, number], [number, number]][];
}

interface AnnotationData {
  pos: [number, number];
  text: string;
  align?: string;
  offset?: number;
}

interface LineChartProps {
  width: number;
  height: number;
  title?: string;
  titleGap?: number;
  lines?: LineData[];
  annotations?: AnnotationData[];
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  borders?: {
    right?: boolean;
    top?: boolean;
    bottom?: boolean;
    left?: boolean;
  };
  padding?: number;
}

export const LineChart: React.FC<LineChartProps> = ({
  width,
  height,
  title,
  titleGap = 20,
  lines = [],
  annotations = [],
  xAxis,
  yAxis,
  borders,
  padding,
}) => {
  return (
    <ChartFrame
      width={width}
      height={height}
      title={title}
      titleGap={titleGap}
      padding={padding}
      xAxis={xAxis}
      yAxis={yAxis}
      borders={borders}
    >
      {({ scaleX, scaleY }) => (
        <g>
          {/* 繪製折線與輔助線 */}
          {lines.map((lineData, i) => {
            const pathD = lineData.points
              .map((point, index) => {
                const px = scaleX(point[0]);
                const py = scaleY(point[1]);
                return `${index === 0 ? "M" : "L"} ${px} ${py}`;
              })
              .join(" ");

            return (
              <g key={`line-group-${i}`}>
                <path
                  d={pathD}
                  stroke={lineData.color || LAYOUT.DEFAULT_COLOR}
                  strokeWidth={LAYOUT.DEFAULT_STROKE_WIDTH}
                  fill="none"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />

                {/* 繪製專屬輔助線 */}
                {lineData.guidelines &&
                  lineData.guidelines.map((guide, j) => {
                    const [[x1, y1], [x2, y2]] = guide;
                    return (
                      <Segment
                        key={`guide-${i}-${j}`}
                        start={[scaleX(x1), scaleY(y1)]}
                        end={[scaleX(x2), scaleY(y2)]}
                        dash="dotted"
                        strokeWidth={1}
                      />
                    );
                  })}

                {/* 繪製線條標籤 */}
                {lineData.label && (
                  <Label
                    pos={[
                      scaleX(lineData.label.pos[0]),
                      scaleY(lineData.label.pos[1]),
                    ]}
                    align={lineData.label.align || "center"}
                    offset={lineData.label.offset || 10}
                    text={lineData.label.text}
                  />
                )}
              </g>
            );
          })}

          {/* 繪製額外標註 (Annotations) */}
          {annotations.map((ann, i) => {
            const px = scaleX(ann.pos[0]);
            const py = scaleY(ann.pos[1]);
            return (
              <Label
                key={`ann-${i}`}
                pos={[px, py]}
                align={ann.align || "center"}
                offset={ann.offset || 10}
                text={ann.text}
              />
            );
          })}
        </g>
      )}
    </ChartFrame>
  );
};
