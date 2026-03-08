// src/components/elements/PatternFill.tsx

import React from "react";
import { LAYOUT } from "../../constants";
import { type PatternFillConfig } from "./types";
import { normalizeDash } from "../../utils/type";

interface PatternFillProps extends PatternFillConfig {
  id: string;
}

export const PatternFill: React.FC<PatternFillProps> = ({
  id,
  type = LAYOUT.DEFAULT_PATTERN_FILL_TYPE,
  spacing: propSpacing,
  angle = LAYOUT.DEFAULT_HATCH_ANGLE,
  strokeWidth = LAYOUT.DEFAULT_STROKE_WIDTH,
  color = LAYOUT.DEFAULT_COLOR,
  background = LAYOUT.DEFAULT_BACKGROUND,
  waveAmplitude = LAYOUT.DEFAULT_WAVE_AMPLITUDE,
  waveLength = LAYOUT.DEFAULT_WAVE_LENGTH,
  dash: propDash,
}) => {
  // 1. 動態處理預設值
  const spacing =
    propSpacing ??
    (type === "wave"
      ? LAYOUT.DEFAULT_WAVE_SPACING
      : LAYOUT.DEFAULT_HATCH_SPACING);
  const initialDash =
    type === "wave" ? (propDash ?? LAYOUT.DEFAULT_WAVE_DASH) : propDash;

  // 2. 透過 normalizeDash 解析最終的 dash 格式
  const parsedDash = normalizeDash(initialDash);

  // === 1. 處理液體波浪 (Wave - 防重疊並排版) ===
  if (type === "wave") {
    // 確保拿來計算高度的振幅是正數（取絕對值）
    const a = Math.abs(waveAmplitude);
    const w = waveLength;

    // 核心優化：計算波浪的「實體總高度」= (上振幅 + 下振幅) + 線條粗細
    const waveTotalHeight = 2 * a + strokeWidth;

    // 將 spacing 重新定義為「純白留白間距」
    const tileHeight = waveTotalHeight + spacing;
    // 將波浪畫在畫布正中央
    const y = tileHeight / 2;

    // 解析左右間距 (Gap)，使用解析過後的 parsedDash
    let gap = w / 2;
    if (parsedDash) {
      const parts = parsedDash
        .split(/[\s,-]+/)
        .map(Number)
        .filter((n) => !isNaN(n));
      if (parts.length >= 2) {
        gap = parts[1];
      }
    }

    const tileWidth = w + gap;

    // 保留使用者傳入負數振幅 (例如 -2) 的特性：先往下彎再往上彎
    const direction = waveAmplitude < 0 ? -1 : 1;
    // 貝茲曲線控制點的高度要是視覺振幅的 2 倍
    const cpA = a * 2 * direction;

    // Q: 控制點拉扯, T: 平滑過渡
    const pathD = `M 0 ${y} Q ${w / 4} ${y - cpA}, ${w / 2} ${y} T ${w} ${y}`;

    return (
      <pattern
        id={id}
        width={tileWidth}
        height={tileHeight}
        patternUnits="userSpaceOnUse"
      >
        {background !== "transparent" && (
          <rect width={tileWidth} height={tileHeight} fill={background} />
        )}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          // 注意：Wave 的 parsedDash 已經拿去算 gap 了，所以 path 本身不需要加 strokeDasharray
        />
      </pattern>
    );
  }

  // ✨ 計算虛線的一個完整週期長度
  let dashCycleLength = spacing;
  if (parsedDash) {
    const parts = parsedDash
      .split(",")
      .map(Number)
      .filter((n) => !isNaN(n));
    if (parts.length > 0) {
      const sum = parts.reduce((a, b) => a + b, 0);
      // SVG 的特性：如果 dash 數量是奇數 (例如 "5")，它會自動重複變成 "5,5"，所以週期要乘以 2
      dashCycleLength = parts.length % 2 !== 0 ? sum * 2 : sum;
    }
  }

  return (
    <pattern
      id={id}
      width={spacing} // 寬度決定了斜線之間的間距 (維持不變)
      height={dashCycleLength}
      patternTransform={`rotate(${angle} 0 0)`}
      patternUnits="userSpaceOnUse"
    >
      {background !== "transparent" && (
        <rect width={spacing} height={dashCycleLength} fill={background} />
      )}
      <line
        x1="0"
        y1="0"
        x2="0"
        y2={dashCycleLength}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={parsedDash}
      />
    </pattern>
  );
};
