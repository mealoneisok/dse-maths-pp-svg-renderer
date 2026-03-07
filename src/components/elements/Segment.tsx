// src/components/elements/Segment.tsx

import { type SegmentProps } from "./types";
import { LAYOUT } from "../../constants";
import { Label } from "./Label";

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

  let dashArray: string | undefined = undefined;
  if (dash === true || dash === "dashed") dashArray = "6, 4";
  else if (dash === "dash-dot") dashArray = "15,6,4,6";
  else if (dash === "dotted") dashArray = "2, 3";
  else if (dash && dash !== "solid" && dash !== "none")
    dashArray = dash as string;

  const labelObj = typeof label === "string" ? { text: label } : label;

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
