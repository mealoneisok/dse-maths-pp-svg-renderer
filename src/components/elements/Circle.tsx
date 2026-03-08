// src/components/elements/Circle.tsx

import React from "react";
import { Label } from "./Label";
import { type CircleProps } from "./types";
import { normalizeLabel, normalizeDash } from "../../utils/type";

export const Circle: React.FC<CircleProps> = ({
  center,
  radius,
  fill = "none",
  stroke = "#000",
  strokeWidth = 1.5,
  dash,
  label,
}) => {
  const labelObj = normalizeLabel(label);
  const dashArray = normalizeDash(dash);

  return (
    <g>
      <circle
        cx={center[0]}
        cy={center[1]}
        r={radius}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dashArray}
      />
      {labelObj && (
        <Label pos={labelObj.pos ?? [center[0], center[1]]} {...labelObj} />
      )}
    </g>
  );
};
