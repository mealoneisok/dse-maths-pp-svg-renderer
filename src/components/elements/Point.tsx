// src/components/elements/Point.tsx
import { LAYOUT } from "../../constants";
import { type PointProps } from "./types";
import { Label } from "./Label";
import { normalizeLabel } from "../../utils/type";

export const Point: React.FC<
  PointProps & { project?: (pt: [number, number]) => [number, number] }
> = ({
  pos,
  type = "none",
  markerSize = 4,
  showMarker = true,
  markerColor = LAYOUT.DEFAULT_COLOR,
  strokeWidth = LAYOUT.DEFAULT_STROKE_WIDTH,
  label,
  project,
}) => {
  const pxPos = project ? project(pos) : (pos as [number, number]);
  const [x, y] = pxPos;

  const labelObj = normalizeLabel(label, {
    align: LAYOUT.DEFAULT_POINT_LABEL_ALIGN,
    offset: markerSize,
    color: markerColor,
  });

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
      {label && <Label {...labelObj} pos={pxPos} />}
    </g>
  );
};
