// src/components/elements/Point.tsx

import { LAYOUT } from "../../constants";
import { type PointProps } from "./types";
import { Label } from "./Label";
import { normalizeLabel } from "../../utils/type";

export const Point: React.FC<PointProps> = ({
  pos,
  type = "none",
  markerSize = 4,
  showMarker = true,
  markerColor = LAYOUT.DEFAULT_COLOR,
  strokeWidth = LAYOUT.DEFAULT_STROKE_WIDTH,
  label,
}) => {
  const [x, y] = pos;
  const labelObj = normalizeLabel(label);

  return (
    <g>
      {showMarker && type === "circle" && (
        <circle cx={x} cy={y} r={markerSize} fill={markerColor} />
      )}
      {showMarker && type === "cross" && (
        <path
          d={`M ${x - markerSize} ${y - markerSize} L ${x + markerSize} ${y + markerSize} M ${x - markerSize} ${y + markerSize} L ${x + markerSize} ${y - markerSize}`}
          stroke={markerColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
        />
      )}
      {label && (
        <Label
          pos={labelObj?.pos || [x, y]}
          align={labelObj?.align || "top-right"}
          offset={
            labelObj?.offset !== undefined ? labelObj?.offset : markerSize
          }
          text={labelObj?.text}
          color={labelObj?.color || markerColor}
        />
      )}
    </g>
  );
};
