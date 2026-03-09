// src/components/elements/Circle.tsx
import React from "react";
import { Label } from "./Label";
import { type CircleProps, type Vector2 } from "./types";
import { normalizeLabel, normalizeDash } from "../../utils/type";
import { LAYOUT } from "../../constants";

export const Circle: React.FC<
  CircleProps & {
    project?: (pt: Vector2) => Vector2;
    scale?: number;
  }
> = ({
  center,
  radius,
  fill = "none",
  stroke = LAYOUT.DEFAULT_COLOR,
  strokeWidth = LAYOUT.DEFAULT_STROKE_WIDTH,
  dash,
  label,
  project,
  scale,
}) => {
  const labelObj = normalizeLabel(label);
  const dashArray = normalizeDash(dash);

  const pxCenter = project ? project(center) : center;
  const pxRadius = scale ? radius * scale : radius;
  const pxLabelPos = labelObj?.pos
    ? project
      ? project(labelObj.pos)
      : labelObj.pos
    : pxCenter;

  return (
    <g>
      <circle
        cx={pxCenter[0]}
        cy={pxCenter[1]}
        r={pxRadius}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dashArray}
      />
      {labelObj && <Label pos={pxLabelPos} {...labelObj} />}
    </g>
  );
};
