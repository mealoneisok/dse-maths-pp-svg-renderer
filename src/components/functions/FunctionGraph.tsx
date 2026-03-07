// src/components/functions/FunctionGraph.tsx

import React, { useMemo } from "react";
import { LAYOUT } from "../../constants";
import { Label, type LabelConfig } from "../elements"; // 若你原本命名為 MathLabel，請自行替換

export interface FunctionGraphProps {
  pt: (x: number, y: number) => [number, number]; // 改由外部直接傳入座標轉換函式
  fn: (x: number) => number;
  domain: [number, number];
  color?: string;
  strokeWidth?: number;
  samples?: number;
  label?: LabelConfig & { x?: number };
}

export const FunctionGraph: React.FC<FunctionGraphProps> = ({
  pt,
  fn,
  domain,
  color = LAYOUT.DEFAULT_COLOR,
  strokeWidth = LAYOUT.DEFAULT_STROKE_WIDTH,
  samples = 100,
  label,
}) => {
  const [minX, maxX] = domain;

  const { pathD, labelScreenPt, labelText } = useMemo(() => {
    let d = "";
    const step = (maxX - minX) / samples;

    for (let i = 0; i <= samples; i++) {
      const x = minX + i * step;
      const y = fn(x);

      if (isNaN(y) || !isFinite(y)) continue;

      const [px, py] = pt(x, y);

      if (d === "") {
        d += `M ${px} ${py} `;
      } else {
        d += `L ${px} ${py} `;
      }
    }

    let screenPt: [number, number] | null = null;
    let txt = null;

    if (label && d) {
      const labelMathX =
        label.x !== undefined ? label.x : maxX - (maxX - minX) * 0.1;
      const labelMathY = fn(labelMathX);
      screenPt = pt(labelMathX, labelMathY);
      txt = label.text;
    }

    return { pathD: d, labelScreenPt: screenPt, labelText: txt };
  }, [fn, domain, pt, samples, minX, maxX, label]);

  if (!pathD) return null;

  return (
    <g>
      <path
        d={pathD}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinejoin="round"
      />
      {label && labelScreenPt && (
        <Label
          pos={labelScreenPt}
          align={label.align || "top"}
          offset={label.offset || 8}
          text={labelText}
          color={label.color || color}
        />
      )}
    </g>
  );
};
