// src/components/elements/DimLine.tsx

import React from "react";
import { LAYOUT } from "../../constants";
import { measureLatex } from "../../utils/measure";
import { Arrow } from "./Arrow";
import { Label } from "./Label";
import { Segment } from "./Segment";
import { normalizeLabel } from "../../utils/type";
import { type SegmentProps } from "./types";

export interface DimLineProps extends Omit<SegmentProps, "start" | "end"> {
  start: [number, number];
  end: [number, number];
  gapPadding?: number; // 文字兩側的留白斷點距離
  arrowSize?: number;
  arrowAngle?: number;
  extStart?: number; // 起點的垂直延伸線長度
  extEnd?: number; // 終點的垂直延伸線長度
  extDash?: string; // 延伸線的虛線樣式
  rotation?: number; // 標籤旋轉角度 (degrees)
}

export const DimLine: React.FC<
  DimLineProps & { project?: (pt: [number, number]) => [number, number] }
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
  extDash = "5 5",
  rotation = 0,
  project,
}) => {
  const pxStart = project ? project(start) : start;
  const pxEnd = project ? project(end) : end;

  const labelObj = normalizeLabel(label);
  const text = labelObj?.text;
  const fontSize = labelObj?.fontSize || LAYOUT.DEFAULT_AXIS_LABEL_FONT_SIZE;

  const [x1, y1] = pxStart;
  const [x2, y2] = pxEnd;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);

  const renderExtensions = () => {
    const perpAngle = angle + Math.PI / 2;
    return (
      <g>
        {extStart !== 0 && (
          // 內部呼叫 Segment 不傳 project，因為已經在 pixel 空間！
          <Segment
            start={[x1, y1]}
            end={[
              x1 + extStart * Math.cos(perpAngle),
              y1 + extStart * Math.sin(perpAngle),
            ]}
            color={color}
            strokeWidth={strokeWidth}
            dash={extDash}
          />
        )}
        {extEnd !== 0 && (
          <Segment
            start={[x2, y2]}
            end={[
              x2 + extEnd * Math.cos(perpAngle),
              y2 + extEnd * Math.sin(perpAngle),
            ]}
            color={color}
            strokeWidth={strokeWidth}
            dash={extDash}
          />
        )}
      </g>
    );
  };

  // ... (保留後面的長度與字體切斷計算，把原本傳給 <Arrow> 的 start 換成 pxStart，end 換成 pxEnd 即可)
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
  const midX = labelObj?.pos?.[0] ?? (x1 + x2) / 2;
  const midY = labelObj?.pos?.[1] ?? (y1 + y2) / 2;

  const p1: [number, number] = [
    midX - halfGap * Math.cos(angle),
    midY - halfGap * Math.sin(angle),
  ];
  const p2: [number, number] = [
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
