// src/components/elements/Point.tsx

import { LAYOUT } from "../../constants";
import { type PointProps } from "./types";
import { Label } from "./Label";

export const Point: React.FC<PointProps> = ({
  pos,
  type = "none",
  size = 4,
  color = LAYOUT.DEFAULT_COLOR,
  strokeWidth = LAYOUT.DEFAULT_STROKE_WIDTH,
  label,
}) => {
  const [x, y] = pos;

  return (
    <g>
      {type === "circle" && <circle cx={x} cy={y} r={size} fill={color} />}
      {type === "cross" && (
        <path
          d={`M ${x - size} ${y - size} L ${x + size} ${y + size} M ${x - size} ${y + size} L ${x + size} ${y - size}`}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
        />
      )}
      {label && (
        <Label
          pos={label.pos || [x, y]}
          align={label.align || "top-right"}
          offset={label.offset !== undefined ? label.offset : size}
          text={label.text}
          color={label.color || color}
        />
      )}
    </g>
  );
};
