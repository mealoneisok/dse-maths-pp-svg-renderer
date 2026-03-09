// src/components/functions/FunctionGraph.tsx

import React, { useMemo } from "react";
import { LAYOUT } from "../../constants";
import { Label, type LabelConfig, type Vector2 } from "../elements";

export interface FunctionGraphConfig {
  fn: (x: number) => number;
  domain: Vector2;
  color?: string;
  strokeWidth?: number;
  samples?: number;
  label?: LabelConfig & { x?: number };
}

interface FunctionGraphProps extends FunctionGraphConfig {
  pt: (x: number, y: number) => Vector2;
}

export const FunctionGraph: React.FC<FunctionGraphProps> = ({
  pt,
  fn,
  domain,
  color = LAYOUT.DEFAULT_COLOR,
  strokeWidth = LAYOUT.DEFAULT_STROKE_WIDTH,
  samples = LAYOUT.DEFAULT_FUNCTION_GRAPH_SAMPLES,
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

    let screenPt: Vector2 | null = null;
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
