// src/components/elements/3D/Hemisphere.tsx
import React from "react";
import type { HemisphereProps } from "../types";
import { LAYOUT, PROJ_ELLIPSE_RATIO } from "@/constants";
import { normalizeDash, normalizeFill } from "@/utils/type";
import { PatternFill } from "../PatternFill";

export const Hemisphere: React.FC<HemisphereProps> = ({
  id,
  occludedBy,
  centerBase,
  radius,
  color = LAYOUT.DEFAULT_COLOR,
  fill = "none",
  strokeWidth = LAYOUT.DEFAULT_STROKE_WIDTH,
  project,
  scale = 20,
  dash = "dashed",
  inverted = false,
}) => {
  if (!project) return null;

  const [cx, cy] = project(centerBase);
  const r2d = radius * scale;
  const ry = r2d * PROJ_ELLIPSE_RATIO;

  const { fillValue, patternDef } = normalizeFill(fill);
  const sweepArc = inverted ? 0 : 1;

  // 背面橢圓弧的路徑
  const backArcPath = `M ${cx - r2d} ${cy} A ${r2d} ${ry} 0 0 1 ${cx + r2d} ${cy}`;

  // --- 組合受遮擋的 Mask 樣式 ---
  const maskStyle =
    occludedBy && occludedBy.length > 0
      ? { mask: occludedBy.map((oid) => `url(#${oid}-mask)`).join(" ") }
      : {};

  return (
    <g>
      <defs>
        {patternDef && <PatternFill {...patternDef} />}
        {/* 自動生成自己的實心遮罩 */}
        {id && (
          <mask id={`${id}-mask`}>
            <rect
              x="-5000"
              y="-5000"
              width="10000"
              height="10000"
              fill="white"
            />
            <ellipse cx={cx} cy={cy} rx={r2d} ry={ry} fill="black" />
            <path
              d={`M ${cx - r2d} ${cy} A ${r2d} ${r2d} 0 0 ${sweepArc} ${cx + r2d} ${cy} Z`}
              fill="black"
            />
          </mask>
        )}
      </defs>

      {/* 1. 填色層 */}
      {fill !== "none" && fillValue !== "transparent" && (
        <g stroke="none" fill={fillValue}>
          <ellipse cx={cx} cy={cy} rx={r2d} ry={ry} />
          <path
            d={`M ${cx - r2d} ${cy} A ${r2d} ${r2d} 0 0 ${sweepArc} ${cx + r2d} ${cy} A ${r2d} ${ry} 0 0 ${inverted ? 0 : 1} ${cx - r2d} ${cy} Z`}
          />
        </g>
      )}

      {/* 2. 線框層 */}

      {/* A. 頂部橢圓 (後半部) - 只有這裡在圓錐後面，需要套用 Mask！ */}
      {occludedBy && occludedBy.length > 0 ? (
        <g>
          {/* 墊底：永遠畫虛線 */}
          <path
            d={backArcPath}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={normalizeDash("dashed")}
          />
          {/* 蓋上：畫實線，套用遮罩 */}
          <path
            d={backArcPath}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            style={maskStyle}
          />
        </g>
      ) : (
        <path
          d={backArcPath}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={normalizeDash(dash)}
        />
      )}

      {/* B. 頂部橢圓 (前半部) - 在圓錐前面，絕對不套用 Mask */}
      <path
        d={`M ${cx - r2d} ${cy} A ${r2d} ${ry} 0 0 0 ${cx + r2d} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        /* 💡 移除了 style={maskStyle} */
      />

      {/* C. 主體半球輪廓弧線 - 在最外面，絕對不套用 Mask */}
      <path
        d={`M ${cx - r2d} ${cy} A ${r2d} ${r2d} 0 0 ${sweepArc} ${cx + r2d} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        /* 💡 移除了 style={maskStyle} */
      />
    </g>
  );
};
