// src/components/elements/AngleMarker.tsx
import { type AngleMarkerProps } from "./types";
import { LAYOUT } from "../../constants";
import { Label } from "./Label";
import { measureLatex } from "../../utils/measure";
import { normalizeLabel, normalizeDash } from "../../utils/type";

export const AngleMarker: React.FC<
  AngleMarkerProps & { project?: (pt: [number, number]) => [number, number] }
> = ({
  vertex,
  p1,
  p2,
  size = 20,
  color = LAYOUT.DEFAULT_COLOR,
  strokeWidth = LAYOUT.DEFAULT_STROKE_WIDTH,
  dash = "solid",
  isRightAngle = false,
  label,
  project,
}) => {
  // 🌟 攔截並轉換
  const pxVertex = project ? project(vertex) : vertex;
  const pxP1 = project ? project(p1) : p1;
  const pxP2 = project ? project(p2) : p2;

  const labelObj = normalizeLabel(label);
  const dashArray = normalizeDash(dash);

  // 以轉換後的座標計算角度 (確保與螢幕顯示的角度一致)
  let angle1 = Math.atan2(pxP1[1] - pxVertex[1], pxP1[0] - pxVertex[0]);
  let angle2 = Math.atan2(pxP2[1] - pxVertex[1], pxP2[0] - pxVertex[0]);

  if (angle1 < 0) angle1 += 2 * Math.PI;
  if (angle2 < 0) angle2 += 2 * Math.PI;

  let diff = angle2 - angle1;
  if (diff > Math.PI) angle2 -= 2 * Math.PI;
  else if (diff < -Math.PI) angle2 += 2 * Math.PI;

  const sweepFlag = angle2 > angle1 ? 1 : 0;
  const startX = pxVertex[0] + size * Math.cos(angle1);
  const startY = pxVertex[1] + size * Math.sin(angle1);
  const endX = pxVertex[0] + size * Math.cos(angle2);
  const endY = pxVertex[1] + size * Math.sin(angle2);

  const midAngle = (angle1 + angle2) / 2;

  let labelX = pxVertex[0];
  let labelY = pxVertex[1];

  if (labelObj && labelObj.text) {
    const metrics = measureLatex(labelObj.text, labelObj.fontSize);
    const textClearance = metrics.height * 0.6;
    const effectiveSize = isRightAngle ? size * Math.SQRT2 : size;
    const userOffset = labelObj.offset !== undefined ? labelObj.offset : 4;
    const distance = effectiveSize + userOffset + textClearance;

    labelX = pxVertex[0] + distance * Math.cos(midAngle);
    labelY = pxVertex[1] + distance * Math.sin(midAngle);
  }

  return (
    <g>
      {isRightAngle ? (
        <polyline
          points={`${startX},${startY} ${pxVertex[0] + size * (Math.cos(angle1) + Math.cos(angle2))},${pxVertex[1] + size * (Math.sin(angle1) + Math.sin(angle2))} ${endX},${endY}`}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinejoin="round"
          strokeDasharray={dashArray}
        />
      ) : (
        <path
          d={`M ${startX} ${startY} A ${size} ${size} 0 0 ${sweepFlag} ${endX} ${endY}`}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={dashArray}
        />
      )}
      {labelObj && (
        <Label
          pos={labelObj.pos || [labelX, labelY]}
          align={labelObj.align || "center"}
          offset={0}
          text={labelObj.text}
          color={labelObj.color || color}
          fontSize={labelObj.fontSize}
        />
      )}
    </g>
  );
};
