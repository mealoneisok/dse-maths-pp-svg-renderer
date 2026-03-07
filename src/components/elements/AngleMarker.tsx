// src/components/elements/AngleMarker.tsx

import { type LabelConfig } from "./types";
import { LAYOUT } from "../../constants";
import { Label } from "./Label";
import { measureLatex } from "../../utils/measure";

interface AngleMarkerProps {
  vertex: [number, number];
  p1: [number, number];
  p2: [number, number];
  size?: number;
  color?: string;
  strokeWidth?: number;
  isRightAngle?: boolean;
  label?: LabelConfig & { fontSize?: number | string };
}

export const AngleMarker: React.FC<AngleMarkerProps> = ({
  vertex,
  p1,
  p2,
  size = 20,
  color = LAYOUT.DEFAULT_COLOR,
  strokeWidth = LAYOUT.DEFAULT_STROKE_WIDTH,
  isRightAngle = false,
  label,
}) => {
  let angle1 = Math.atan2(p1[1] - vertex[1], p1[0] - vertex[0]);
  let angle2 = Math.atan2(p2[1] - vertex[1], p2[0] - vertex[0]);

  if (angle1 < 0) angle1 += 2 * Math.PI;
  if (angle2 < 0) angle2 += 2 * Math.PI;

  let diff = angle2 - angle1;
  if (diff > Math.PI) angle2 -= 2 * Math.PI;
  else if (diff < -Math.PI) angle2 += 2 * Math.PI;

  const sweepFlag = angle2 > angle1 ? 1 : 0;
  const startX = vertex[0] + size * Math.cos(angle1);
  const startY = vertex[1] + size * Math.sin(angle1);
  const endX = vertex[0] + size * Math.cos(angle2);
  const endY = vertex[1] + size * Math.sin(angle2);

  const midAngle = (angle1 + angle2) / 2;

  // --- 🌟 智能定位機制 ---
  let labelX = vertex[0];
  let labelY = vertex[1];

  if (label && label.text) {
    // 1. 測量文字大小
    const metrics = measureLatex(label.text, label.fontSize);

    // 2. 改用固定的視覺通關半徑
    // 通常文字的高度 (height) 是固定的，用它來推移能保證視覺上的環繞感一致。
    // 你可以依據喜好微調這個乘數 (例如 0.6 或 0.8)
    const textClearance = metrics.height * 0.6;

    // 3. 計算基礎的圖形半徑
    const effectiveSize = isRightAngle ? size * Math.SQRT2 : size;
    const userOffset = label.offset !== undefined ? label.offset : 4;

    // 4. 總推移距離 = 圖形半徑 + 留白 + 固定的高度空間
    const distance = effectiveSize + userOffset + textClearance;

    labelX = vertex[0] + distance * Math.cos(midAngle);
    labelY = vertex[1] + distance * Math.sin(midAngle);
  }
  return (
    <g>
      {isRightAngle ? (
        <polyline
          points={`${startX},${startY} ${vertex[0] + size * (Math.cos(angle1) + Math.cos(angle2))},${vertex[1] + size * (Math.sin(angle1) + Math.sin(angle2))} ${endX},${endY}`}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d={`M ${startX} ${startY} A ${size} ${size} 0 0 ${sweepFlag} ${endX} ${endY}`}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
        />
      )}
      {label && (
        <Label
          pos={label.pos || [labelX, labelY]}
          align={label.align || "center"}
          offset={0}
          text={label.text}
          color={label.color || color}
          fontSize={label.fontSize}
        />
      )}
    </g>
  );
};
