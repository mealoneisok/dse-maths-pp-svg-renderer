// src/components/elements/PatternFill.tsx

import { LAYOUT } from "../../constants";
import { type PatternFillProps } from "./types";

interface _PatternFillProps extends PatternFillProps {
  id: string;
}

export const PatternFill: React.FC<_PatternFillProps> = ({
  id,
  spacing = 6,
  angle = 45,
  strokeWidth = LAYOUT.DEFAULT_STROKE_WIDTH,
  color = LAYOUT.DEFAULT_COLOR,
  background = "white",
}) => {
  return (
    <pattern
      id={id}
      width={spacing}
      height={spacing}
      patternTransform={`rotate(${angle} 0 0)`}
      patternUnits="userSpaceOnUse"
    >
      {background !== "transparent" && (
        <rect width={spacing} height={spacing} fill={background} />
      )}
      <line
        x1="0"
        y1="0"
        x2="0"
        y2={spacing}
        stroke={color}
        strokeWidth={strokeWidth}
      />
    </pattern>
  );
};
