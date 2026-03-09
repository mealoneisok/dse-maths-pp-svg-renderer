// src/components/elements/DimLine.tsx

import React from "react";
import { LAYOUT } from "../../constants";
import { measureLatex } from "../../utils/measure";
import { Arrow } from "./Arrow";
import { Label } from "./Label";
import { Segment } from "./Segment";
import { normalizeLabel, normalizeDash } from "../../utils/type";
import {
  type DimLineProps,
  type Vector2,
  type ProjectFunctionType,
} from "./types";

export const DimLine: React.FC<
  DimLineProps & { project?: ProjectFunctionType }
> = ({
  start,
  end,
  label,
  gapPadding = 12,
  strokeWidth = LAYOUT.DEFAULT_STROKE_WIDTH,
  color = LAYOUT.DEFAULT_COLOR,
  arrowSize = LAYOUT.ARROW_SIZE,
  arrowAngle = LAYOUT.ARROW_ANGLE,
  extStart = 0,
  extEnd = 0,
  extDash = "dashed",
  rotation = 0,
  project,
}) => {
  const pxStart = project ? project(start) : (start as Vector2);
  const pxEnd = project ? project(end) : (end as Vector2);

  const labelObj = normalizeLabel(label);
  const text = labelObj?.text;
  const fontSize = labelObj?.fontSize || LAYOUT.DEFAULT_AXIS_LABEL_FONT_SIZE;

  const [x1, y1] = pxStart;
  const [x2, y2] = pxEnd;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);

  const extDashArray = normalizeDash(extDash);

  const renderExtensions = () => {
    const perpAngle = angle + Math.PI / 2; // 用於 2D fallback 的垂直角度
    return (
      <g>
        {extStart !== undefined && extStart !== 0 && (
          <Segment
            start={pxStart}
            // 判斷：如果是座標陣列，就將目標點投影；否則走原本的 2D 垂直線邏輯
            end={
              Array.isArray(extStart)
                ? project
                  ? project(extStart)
                  : (extStart as Vector2)
                : [
                    x1 + extStart * Math.cos(perpAngle),
                    y1 + extStart * Math.sin(perpAngle),
                  ]
            }
            color={color}
            strokeWidth={strokeWidth}
            dash={extDashArray}
          />
        )}
        {extEnd !== undefined && extEnd !== 0 && (
          <Segment
            start={pxEnd}
            end={
              Array.isArray(extEnd)
                ? project
                  ? project(extEnd)
                  : (extEnd as Vector2)
                : [
                    x2 + extEnd * Math.cos(perpAngle),
                    y2 + extEnd * Math.sin(perpAngle),
                  ]
            }
            color={color}
            strokeWidth={strokeWidth}
            dash={extDashArray}
          />
        )}
      </g>
    );
  };

  // ... (下方的 Arrow 與 Label 渲染邏輯完全保持不變) ...
  if (!text && text !== 0) {
    return (
      <g>
        {renderExtensions()}
        <Arrow
          start={pxStart}
          end={pxEnd}
          showStartArrow
          showEndArrow
          arrowSize={arrowSize}
          arrowAngle={arrowAngle}
          color={color}
          strokeWidth={strokeWidth}
        />
      </g>
    );
  }

  const strText = String(text);
  const { width, height } = measureLatex(strText, fontSize);
  const radRot = (rotation * Math.PI) / 180;
  const gap =
    Math.abs(width * Math.cos(angle - radRot)) +
    Math.abs(height * Math.sin(angle - radRot)) +
    gapPadding;
  const halfGap = Math.min(gap / 2, Math.max(0, length / 2 - arrowSize));

  const pxLabelPos = labelObj?.pos
    ? project
      ? project(labelObj.pos)
      : (labelObj.pos as Vector2)
    : ([(x1 + x2) / 2, (y1 + y2) / 2] as Vector2);

  const midX = pxLabelPos[0];
  const midY = pxLabelPos[1];

  const p1: Vector2 = [
    midX - halfGap * Math.cos(angle),
    midY - halfGap * Math.sin(angle),
  ];
  const p2: Vector2 = [
    midX + halfGap * Math.cos(angle),
    midY + halfGap * Math.sin(angle),
  ];

  return (
    <g>
      {renderExtensions()}
      {length > gap && (
        <>
          <Arrow
            start={pxStart}
            end={p1}
            showStartArrow
            showEndArrow={false}
            arrowSize={arrowSize}
            arrowAngle={arrowAngle}
            color={color}
            strokeWidth={strokeWidth}
          />
          <Arrow
            start={p2}
            end={pxEnd}
            showStartArrow={false}
            showEndArrow
            arrowSize={arrowSize}
            arrowAngle={arrowAngle}
            color={color}
            strokeWidth={strokeWidth}
          />
        </>
      )}
      <Label
        pos={[midX, midY]}
        text={text}
        color={labelObj?.color || color}
        fontSize={fontSize}
        rotation={rotation}
        align="center"
        offset={0}
      />
    </g>
  );
};
