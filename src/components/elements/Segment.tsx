// src/components/elements/Segment.tsx

import { type SegmentProps } from "./types";
import { LAYOUT } from "../../constants";
import { Label } from "./Label";
import { normalizeLabel, normalizeDash } from "../../utils/type";

export const Segment: React.FC<SegmentProps> = ({
  start,
  end,
  strokeWidth = LAYOUT.DEFAULT_STROKE_WIDTH,
  color = LAYOUT.DEFAULT_COLOR,
  dash = "solid",
  label = null,
}) => {
  const [x1, y1] = start;
  const [x2, y2] = end;
  const labelObj = normalizeLabel(label);
  const dashArray = normalizeDash(dash);

  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={dashArray}
      />
      {labelObj && (
        <Label
          pos={labelObj.pos || [(x1 + x2) / 2, (y1 + y2) / 2]}
          align={labelObj.align || "center"}
          offset={labelObj.offset || LAYOUT.DEFAULT_OFFSET}
          text={labelObj.text}
          color={color}
          rotation={labelObj.rotation || 0}
        />
      )}
    </g>
  );
};
