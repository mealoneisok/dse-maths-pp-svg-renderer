// src/components/elements/Arrow.tsx

import { type SegmentProps, type Vector2 } from "./types";
import { LAYOUT } from "../../constants";
import { Segment } from "./Segment";

interface ArrowProps extends SegmentProps {
  showStartArrow?: boolean;
  showEndArrow?: boolean;
  arrowSize?: number;
  arrowAngle?: number;
  shaftWidth?: number;
  closure?: number;
}

export const Arrow: React.FC<ArrowProps> = ({
  start,
  end,
  showStartArrow = false,
  showEndArrow = false,
  arrowSize = LAYOUT.ARROW_SIZE,
  arrowAngle = LAYOUT.ARROW_ANGLE,
  shaftWidth = 0,
  strokeWidth = LAYOUT.DEFAULT_STROKE_WIDTH,
  closure = 0,
  dash = "solid",
  color = LAYOUT.DEFAULT_COLOR,
  label = null,
}) => {
  const [rawX1, rawY1] = start;
  const [rawX2, rawY2] = end;
  const rawDx = rawX2 - rawX1,
    rawDy = rawY2 - rawY1;
  if (rawDx === 0 && rawDy === 0) return null;
  const angle = Math.atan2(rawDy, rawDx);

  // 💡 核心修正：組件自我負責
  // strokeLinejoin="round" 預設會向外延伸 strokeWidth / 2 的實體距離
  // 我們在這裡讓幾何頂點自動內縮，確保「視覺邊界」不會超出給定的 start/end 座標
  const visualBuffer = strokeWidth / 2;

  const x1 = showStartArrow ? rawX1 + visualBuffer * Math.cos(angle) : rawX1;
  const y1 = showStartArrow ? rawY1 + visualBuffer * Math.sin(angle) : rawY1;
  const x2 = showEndArrow ? rawX2 - visualBuffer * Math.cos(angle) : rawX2;
  const y2 = showEndArrow ? rawY2 - visualBuffer * Math.sin(angle) : rawY2;

  // 接下來的 dx, dy 使用退縮後的實際作圖座標來計算
  const dx = x2 - x1,
    dy = y2 - y1;
  const c = Math.max(0, Math.min(1, closure));
  const backOffset = arrowSize * Math.cos(arrowAngle) * c;

  const adjStart: Vector2 = [
    x1 + (showStartArrow ? backOffset * Math.cos(angle) : 0),
    y1 + (showStartArrow ? backOffset * Math.sin(angle) : 0),
  ];
  const adjEnd: Vector2 = [
    x2 - (showEndArrow ? backOffset * Math.cos(angle) : 0),
    y2 - (showEndArrow ? backOffset * Math.sin(angle) : 0),
  ];

  const actualShaftWidth = shaftWidth > 0 ? shaftWidth : strokeWidth;
  if (dx === 0 && dy === 0) return null;

  const renderTip = (tipX: number, tipY: number, pointAngle: number) => {
    const px1 = tipX - arrowSize * Math.cos(pointAngle - arrowAngle);
    const py1 = tipY - arrowSize * Math.sin(pointAngle - arrowAngle);
    const px2 = tipX - arrowSize * Math.cos(pointAngle + arrowAngle);
    const py2 = tipY - arrowSize * Math.sin(pointAngle + arrowAngle);

    if (c === 0)
      return (
        <path
          d={`M ${px1} ${py1} L ${tipX} ${tipY} L ${px2} ${py2}`}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      );

    const bx = tipX - backOffset * Math.cos(pointAngle);
    const by = tipY - backOffset * Math.sin(pointAngle);
    return (
      <path
        d={`M ${px1} ${py1} L ${tipX} ${tipY} L ${px2} ${py2} L ${bx} ${by} Z`}
        fill={color}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    );
  };

  return (
    <g>
      <Segment
        start={adjStart}
        end={adjEnd}
        strokeWidth={actualShaftWidth}
        color={color}
        dash={dash}
        label={label}
      />
      {showEndArrow && renderTip(x2, y2, angle)}
      {showStartArrow && renderTip(x1, y1, angle + Math.PI)}
    </g>
  );
};
