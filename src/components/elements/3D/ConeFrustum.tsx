// src/components/elements/3D/ConeFrustum.tsx

import React from "react";
import type { ConeFrustumProps } from "../types";
import { LAYOUT, PROJ_ELLIPSE_RATIO } from "@/constants";
import { normalizeDash, normalizeFill } from "@/utils/type";
import { PatternFill } from "../PatternFill";

export const ConeFrustum: React.FC<ConeFrustumProps> = ({
  id,
  occludedBy,
  zSplit,
  zSplitDash = "dashed",
  centerBase,
  radiusBottom,
  radiusTop,
  height,
  color = LAYOUT.DEFAULT_COLOR,
  fill = "none",
  strokeWidth = LAYOUT.DEFAULT_STROKE_WIDTH,
  project,
  scale = 20,
  dash = "dashed",
  topDash,
  sideDash,
  bottomFrontDash,
}) => {
  if (!project) return null;

  const [cx1, cy1] = project(centerBase);
  const [cx2, cy2] = project([
    centerBase[0],
    centerBase[1],
    centerBase[2] + height,
  ]);

  const rx1 = radiusBottom * scale;
  const ry1 = rx1 * PROJ_ELLIPSE_RATIO;
  const rx2 = radiusTop * scale;
  const ry2 = rx2 * PROJ_ELLIPSE_RATIO;

  // --- 計算真實 2D 幾何投影切線 ---
  const dy = (cy2 - cy1) / PROJ_ELLIPSE_RATIO;
  const dx = cx2 - cx1;
  const dist = Math.hypot(dx, dy);

  const gamma = dist === 0 ? -Math.PI / 2 : Math.atan2(dy, dx);
  const dr = rx2 - rx1;
  const theta = Math.asin(
    Math.max(-1, Math.min(1, dist === 0 ? 0 : dr / dist)),
  );

  const phi1 = gamma + Math.PI / 2 + theta;
  const phi2 = gamma - Math.PI / 2 - theta;

  const pt1A: [number, number] = [
    cx1 + rx1 * Math.cos(phi1),
    cy1 + ry1 * Math.sin(phi1),
  ];
  const pt2A: [number, number] = [
    cx2 + rx2 * Math.cos(phi1),
    cy2 + ry2 * Math.sin(phi1),
  ];
  const pt1B: [number, number] = [
    cx1 + rx1 * Math.cos(phi2),
    cy1 + ry1 * Math.sin(phi2),
  ];
  const pt2B: [number, number] = [
    cx2 + rx2 * Math.cos(phi2),
    cy2 + ry2 * Math.sin(phi2),
  ];

  const isALeft = pt1A[0] < pt1B[0];
  const [x1Left, y1Left] = isALeft ? pt1A : pt1B;
  const [x2Left, y2Left] = isALeft ? pt2A : pt2B;
  const [x1Right, y1Right] = isALeft ? pt1B : pt1A;
  const [x2Right, y2Right] = isALeft ? pt2B : pt2A;

  const frontLarge = rx2 < rx1 ? 1 : 0;
  const backLarge = rx2 > rx1 ? 1 : 0;

  const { fillValue, patternDef } = normalizeFill(fill);

  // --- 組合受遮擋的 Mask 樣式 ---
  const maskStyle =
    occludedBy && occludedBy.length > 0
      ? { mask: occludedBy.map((oid) => `url(#${oid}-mask)`).join(" ") }
      : {};

  // --- ZSplit 側邊線截斷計算 ---
  const zBottom = centerBase[2];
  const zTop = centerBase[2] + height;
  let splitT = -1;
  if (
    zSplit !== undefined &&
    height !== 0 &&
    ((height > 0 && zSplit > zBottom && zSplit < zTop) ||
      (height < 0 && zSplit < zBottom && zSplit > zTop))
  ) {
    splitT = (zSplit - zBottom) / height;
  }

  // 渲染側邊線
  const renderSideLine = (x1: number, y1: number, x2: number, y2: number) => {
    if (splitT > 0 && splitT < 1) {
      const midX = x1 + splitT * (x2 - x1);
      const midY = y1 + splitT * (y2 - y1);
      return (
        <g style={maskStyle}>
          {/* zSplit 以下的線 (預設變虛線) */}
          <line
            x1={x1}
            y1={y1}
            x2={midX}
            y2={midY}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={normalizeDash(zSplitDash)}
          />
          {/* zSplit 以上的線 (維持原本樣式) */}
          <line
            x1={midX}
            y1={midY}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={normalizeDash(sideDash)}
          />
        </g>
      );
    }
    return (
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={normalizeDash(sideDash)}
        style={maskStyle}
      />
    );
  };

  return (
    <g>
      <defs>
        {patternDef && <PatternFill {...patternDef} />}
        {/* 如果有 id，自動生成一個黑色遮罩供別人使用 */}
        {id && (
          <mask id={`${id}-mask`}>
            <rect
              x="-5000"
              y="-5000"
              width="10000"
              height="10000"
              fill="white"
            />
            <polygon
              points={`${x1Left},${y1Left} ${x2Left},${y2Left} ${x2Right},${y2Right} ${x1Right},${y1Right}`}
              fill="black"
            />
            <ellipse cx={cx1} cy={cy1} rx={rx1} ry={ry1} fill="black" />
            <ellipse cx={cx2} cy={cy2} rx={rx2} ry={ry2} fill="black" />
          </mask>
        )}
      </defs>

      {/* 1. 填色層 */}
      {fill !== "none" && fillValue !== "transparent" && (
        <g stroke="none" fill={fillValue}>
          <ellipse cx={cx1} cy={cy1} rx={rx1} ry={ry1} />
          <polygon
            points={`${x1Left},${y1Left} ${x2Left},${y2Left} ${x2Right},${y2Right} ${x1Right},${y1Right}`}
          />
          <ellipse cx={cx2} cy={cy2} rx={rx2} ry={ry2} />
        </g>
      )}

      {/* 2. 線框層 */}
      <g style={maskStyle}>
        <path
          d={`M ${x1Left} ${y1Left} A ${rx1} ${ry1} 0 ${backLarge} 1 ${x1Right} ${y1Right}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={normalizeDash(dash)}
        />
        <path
          d={`M ${x1Left} ${y1Left} A ${rx1} ${ry1} 0 ${frontLarge} 0 ${x1Right} ${y1Right}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={normalizeDash(bottomFrontDash)}
        />

        {topDash !== "none" && (
          <ellipse
            cx={cx2}
            cy={cy2}
            rx={rx2}
            ry={ry2}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={normalizeDash(topDash)}
          />
        )}
      </g>

      {/* D. 左母線 & E. 右母線 */}
      {renderSideLine(x1Left, y1Left, x2Left, y2Left)}
      {renderSideLine(x1Right, y1Right, x2Right, y2Right)}
    </g>
  );
};
