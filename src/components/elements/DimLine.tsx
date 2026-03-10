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
  DimLineProps & { project?: ProjectFunctionType; breakLine?: boolean }
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
  breakLine = false,
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
    const perpAngle = angle + Math.PI / 2;
    return (
      <g>
        {extStart !== undefined && extStart !== 0 && (
          <Segment
            start={pxStart}
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

  // 計算文字需要的空間大小
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

  // 斷開模式：計算斷開點
  const p1: Vector2 = [
    midX - halfGap * Math.cos(angle),
    midY - halfGap * Math.sin(angle),
  ];
  const p2: Vector2 = [
    midX + halfGap * Math.cos(angle),
    midY + halfGap * Math.sin(angle),
  ];

  // 連續模式：計算文字側邊偏移位置 (往右側法向量推移)
  let finalLabelX = midX;
  let finalLabelY = midY;

  if (!breakLine) {
    const offsetDist =
      labelObj?.offset !== undefined ? labelObj.offset : gapPadding;
    // 在 SVG 座標系中，向右的法向量為 (-sin(θ), cos(θ))
    finalLabelX = midX - offsetDist * Math.sin(angle);
    finalLabelY = midY + offsetDist * Math.cos(angle);
  }

  return (
    <g>
      {renderExtensions()}

      {/* 根據 breakLine 決定畫兩段箭頭還是一段長箭頭 */}
      {breakLine ? (
        length > gap && (
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
        )
      ) : (
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
      )}

      {/* 繪製文字 */}
      <Label
        pos={[finalLabelX, finalLabelY]}
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
