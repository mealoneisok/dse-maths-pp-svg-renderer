// src/components/elements/Region.tsx
import React from "react";
import { type RegionProps } from "./types";
import { normalizeFill } from "../../utils/type";
import { PatternFill } from "./PatternFill";
import { LAYOUT } from "../../constants";

export const Region: React.FC<
  RegionProps & {
    project?: (pt: [number, number]) => [number, number];
    scaleX?: (v: number) => number;
  }
> = ({
  start,
  paths,
  fill = "none",
  stroke = LAYOUT.DEFAULT_COLOR,
  strokeWidth = LAYOUT.DEFAULT_STROKE_WIDTH,
  project,
  scaleX,
}) => {
  const { fillValue, patternDef } = normalizeFill(fill);
  const pxStart = project ? project(start) : start;

  let d = `M ${pxStart[0]} ${pxStart[1]}`;
  paths.forEach((p) => {
    const pxTo = project && p.to ? project(p.to) : p.to;

    if (p.type === "line" && pxTo) {
      d += ` L ${pxTo[0]} ${pxTo[1]}`;
    } else if (p.type === "arc" && pxTo) {
      // 距離/半徑縮放
      const rPx =
        scaleX && p.radius ? Math.abs(scaleX(p.radius) - scaleX(0)) : p.radius;
      d += ` A ${rPx} ${rPx} 0 ${p.largeArc || 0} ${p.sweepFlag || 0} ${pxTo[0]} ${pxTo[1]}`;
    }
  });
  d += " Z";

  return (
    <>
      {patternDef && (
        <defs>
          <PatternFill {...patternDef} />
        </defs>
      )}
      <path d={d} fill={fillValue} stroke={stroke} strokeWidth={strokeWidth} />
    </>
  );
};
