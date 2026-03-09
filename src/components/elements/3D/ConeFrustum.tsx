// src/components/elements/3D/ConeFrustum.tsx

import React from "react";
import type { ConeFrustumProps } from "../types";
import { LAYOUT, PROJ_ELLIPSE_RATIO } from "@/constants";
import { normalizeDash, normalizeFill } from "@/utils/type";
import { PatternFill } from "../PatternFill";

export const ConeFrustum: React.FC<ConeFrustumProps> = ({
  centerBase,
  radiusBottom,
  radiusTop,
  height,
  color = LAYOUT.DEFAULT_COLOR,
  fill = "none",
  strokeWidth = LAYOUT.DEFAULT_STROKE_WIDTH,
  project,
  scale = 20,
  dash = "dashed", // 這是控制預設被遮擋的「底部後半」
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

  const { fillValue, patternDef } = normalizeFill(fill);

  return (
    <g>
      {patternDef && (
        <defs>
          <PatternFill {...patternDef} />
        </defs>
      )}

      {/* 1. 填色層 (Fills) */}
      {fill !== "none" && fillValue !== "transparent" && (
        <g stroke="none" fill={fillValue}>
          <ellipse cx={cx1} cy={cy1} rx={rx1} ry={ry1} />
          <path
            d={`M ${cx1 - rx1} ${cy1} 
                L ${cx2 - rx2} ${cy2} 
                A ${rx2} ${ry2} 0 0 0 ${cx2 + rx2} ${cy2} 
                L ${cx1 + rx1} ${cy1} 
                A ${rx1} ${ry1} 0 0 1 ${cx1 - rx1} ${cy1} Z`}
          />
          <ellipse cx={cx2} cy={cy2} rx={rx2} ry={ry2} />
        </g>
      )}

      {/* 2. 線框層 (Strokes) - 套用新的 Dash 參數 */}

      {/* A. 底部橢圓 (後半部被遮蔽：吃原本的 dash 參數) */}
      <path
        d={`M ${cx1 - rx1} ${cy1} A ${rx1} ${ry1} 0 0 1 ${cx1 + rx1} ${cy1}`}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={normalizeDash(dash)}
      />
      {/* B. 底部橢圓 (前半部可見：吃 bottomFrontDash，預設實線) */}
      <path
        d={`M ${cx1 - rx1} ${cy1} A ${rx1} ${ry1} 0 0 0 ${cx1 + rx1} ${cy1}`}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={normalizeDash(bottomFrontDash)}
      />
      {/* C. 頂部橢圓 (吃 topDash，預設實線) */}
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
      {/* D. 左母線 (吃 sideDash) */}
      <line
        x1={cx1 - rx1}
        y1={cy1}
        x2={cx2 - rx2}
        y2={cy2}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={normalizeDash(sideDash)}
      />
      {/* E. 右母線 (吃 sideDash) */}
      <line
        x1={cx1 + rx1}
        y1={cy1}
        x2={cx2 + rx2}
        y2={cy2}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={normalizeDash(sideDash)}
      />
    </g>
  );
};
