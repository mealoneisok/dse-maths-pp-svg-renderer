// src/components/elements/Region.tsx
import React from "react";
import { type ProjectFunctionType, type RegionProps } from "./types";
import { normalizeFill } from "../../utils/type";
import { PatternFill } from "./PatternFill";
import { LAYOUT } from "../../constants";

export const Region: React.FC<
  RegionProps & {
    project?: ProjectFunctionType;
    scale?: number;
  }
> = ({
  start,
  paths,
  fill = "none",
  stroke = LAYOUT.DEFAULT_COLOR,
  strokeWidth = LAYOUT.DEFAULT_STROKE_WIDTH,
  project,
  scale,
}) => {
  const { fillValue, patternDef } = normalizeFill(fill);
  const pxStart = project ? project(start) : start;

  let d = `M ${pxStart[0]} ${pxStart[1]}`;
  paths.forEach((p) => {
    const pxTo = project && p.to ? project(p.to) : p.to;

    if (p.type === "line" && pxTo) {
      d += ` L ${pxTo[0]} ${pxTo[1]}`;
    } else if (p.type === "arc" && pxTo) {
      const rPx = scale && p.radius ? p.radius * scale : p.radius;

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
