// src/components/elements/Axis.tsx

import React from "react";
import {
  type LabelConfig,
  type GridConfig,
  type TickValue,
  type Vector2,
} from "./types";
import { LAYOUT, EPSILON } from "../../constants";
import { formatTick } from "../../utils/ticks";
import { Arrow } from "./Arrow";
import { Segment } from "./Segment";
import { Label } from "./Label";
import { RotationArrow } from "./RotationArrow";
import { normalizeLabel } from "../../utils/type";

export interface AxisProps {
  start: Vector2;
  end: Vector2;
  extendStart?: number;
  extendEnd?: number;
  tickValues?: TickValue[];
  tickMap?:
    | Record<string | number, string | number>
    | Map<string | number, string | number>
    | null;
  tickTextPos?: string | null;
  tickLength?: number;
  tickLineAlign?: number;
  labelDirection?: number;
  showTickLines?: boolean;
  showNumbers?: boolean;
  skipZero?: boolean;
  grid?: GridConfig | null;
  color?: string;
  strokeWidth?: number;
  dash?: string;
  showLabel?: boolean;
  label?: LabelConfig | string | null;
  labelStep?: number;
  title?: LabelConfig | string | null;
  showArrow?: boolean;
  showRotationArrow?: boolean;
}

export const Axis: React.FC<AxisProps> = ({
  start,
  end,
  extendStart = 0,
  extendEnd = LAYOUT.DEFAULT_AXIS_EXTEND_END,
  tickValues = [],
  tickMap,
  tickTextPos = null,
  showTickLines = true,
  tickLength = LAYOUT.DEFAULT_AXIS_TICK_LENGTH,
  tickLineAlign = 0,
  labelDirection = 1,
  showNumbers = true,
  skipZero = true,
  grid = null,
  color = LAYOUT.DEFAULT_COLOR,
  strokeWidth = LAYOUT.DEFAULT_STROKE_WIDTH,
  dash = "solid",
  showLabel = true,
  label = null,
  labelStep = LAYOUT.DEFAULT_AXIS_LABEL_STEP,
  title = null,
  showArrow = true,
  showRotationArrow = false,
}) => {
  const [sx, sy] = start;
  const [ex, ey] = end;
  const dx = ex - sx,
    dy = ey - sy;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return null;

  const ux = dx / len,
    uy = dy / len,
    nx = -dy / len,
    ny = dx / len;

  const actualStart: Vector2 = [sx - ux * extendStart, sy - uy * extendStart];
  const actualEnd: Vector2 = [ex + ux * extendEnd, ey + uy * extendEnd];

  const endLabelObj = normalizeLabel(label, { pos: actualEnd });
  const titleObj = normalizeLabel(title);

  let arrowX = 0,
    arrowY = 0,
    angle = 0;
  if (showRotationArrow) {
    angle = Math.atan2(dy, dx);
    arrowX = actualEnd[0] - ux * LAYOUT.ROTATION_ARROW_OFFSET;
    arrowY = actualEnd[1] - uy * LAYOUT.ROTATION_ARROW_OFFSET;
  }

  return (
    <g>
      {showRotationArrow && (
        <RotationArrow
          pos={[arrowX, arrowY]}
          angle={angle}
          size={45}
          layer="back"
        />
      )}

      {showArrow ? (
        <Arrow
          start={actualStart}
          end={actualEnd}
          showEndArrow
          color={color}
          shaftWidth={0}
          strokeWidth={strokeWidth}
          closure={0}
          label={showLabel ? endLabelObj : null}
          dash={dash}
        />
      ) : (
        <Segment
          start={actualStart}
          end={actualEnd}
          color={color}
          strokeWidth={strokeWidth}
          label={showLabel ? endLabelObj : null}
          dash={dash}
        />
      )}

      {titleObj && (
        <Label
          pos={titleObj.pos || [(sx + ex) / 2, (sy + ey) / 2]}
          align={titleObj.align || "bottom"}
          offset={titleObj.offset ?? 30}
          text={titleObj.text}
          rotation={titleObj.rotation || 0}
        />
      )}

      {tickValues.map(({ val, t, isZero }: TickValue, idx: number) => {
        const px = sx + t * dx,
          py = sy + t * dy;
        const displayVal = formatTick(val, tickMap);

        // --- 判斷此刻度是否該顯示數字 ---
        let isOnLabelStep = true;
        if (labelStep !== undefined && typeof val === "number") {
          const quotient = val / labelStep;
          isOnLabelStep = Math.abs(Math.round(quotient) - quotient) < EPSILON;
        }

        const shouldShowNum =
          showNumbers &&
          displayVal !== "" &&
          (!skipZero || !isZero) &&
          isOnLabelStep;

        let tickOutwardSpace = 0;
        if (showTickLines) {
          tickOutwardSpace = tickLineAlign === 0 ? tickLength / 2 : tickLength;
        }
        const tOffset = tickOutwardSpace + LAYOUT.DEFAULT_AXIS_NUMBER_OFFSET;

        let gridElement = null;
        if (grid && !(grid.skipZero !== false && isZero)) {
          const dir = grid.direction || "positive";
          const lenNeg =
            typeof grid.length === "number"
              ? grid.length
              : (grid.length?.[0] ?? 0);
          const lenPos =
            typeof grid.length === "number"
              ? grid.length
              : (grid.length?.[1] ?? 0);

          let gx1 = px,
            gy1 = py,
            gx2 = px,
            gy2 = py;

          // --- ++ 新增：套用各自的長度 ++ ---
          if (dir === "both") {
            gx1 = px - nx * lenNeg;
            gy1 = py - ny * lenNeg;
            gx2 = px + nx * lenPos;
            gy2 = py + ny * lenPos;
          } else if (dir === "negative") {
            gx2 = px - nx * lenNeg;
            gy2 = py - ny * lenNeg;
          } else {
            gx2 = px + nx * lenPos;
            gy2 = py + ny * lenPos;
          }
          gridElement = (
            <Segment
              key={`grid-${idx}`}
              start={[gx1, gy1]}
              end={[gx2, gy2]}
              color={grid.color || "#e0e0e0"}
              dash={grid.dash || "dotted"}
              strokeWidth={1}
            />
          );
        }

        let tickElement = null;
        if (showTickLines) {
          let tx1 = px,
            ty1 = py,
            tx2 = px,
            ty2 = py;
          if (tickLineAlign === 0) {
            tx1 = px - nx * (tickLength / 2);
            ty1 = py - ny * (tickLength / 2);
            tx2 = px + nx * (tickLength / 2);
            ty2 = py + ny * (tickLength / 2);
          } else {
            tx2 = px + nx * tickLength * tickLineAlign;
            ty2 = py + ny * tickLength * tickLineAlign;
          }
          tickElement = (
            <line
              key={`tick-${idx}`}
              x1={tx1}
              y1={ty1}
              x2={tx2}
              y2={ty2}
              stroke={color}
              strokeWidth={strokeWidth}
            />
          );
        }

        return (
          <g key={`group-${idx}`}>
            {gridElement}
            {tickElement}
            {shouldShowNum && (
              <Label
                pos={
                  tickTextPos
                    ? [px, py]
                    : [
                        px + nx * tOffset * labelDirection,
                        py + ny * tOffset * labelDirection,
                      ]
                }
                align={tickTextPos || "center"}
                offset={tickTextPos ? tOffset : 0}
                text={String(displayVal)}
              />
            )}
          </g>
        );
      })}

      {showRotationArrow && (
        <RotationArrow
          pos={[arrowX, arrowY]}
          angle={angle}
          size={45}
          layer="front"
        />
      )}
    </g>
  );
};
