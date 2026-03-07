// src/components/charts/PieChart.tsx

import React, { useMemo } from "react";
import { AngleMarker } from "../elements/AngleMarker";
import { Label } from "../elements/Label";
import { measureLatex } from "../../utils/measure";

export interface PieSliceLabelConfig {
  text: string | number;
  pos?: [number, number];
  align?: string;
  offset?: number;
  color?: string;
  fontSize?: string | number;
}

export interface PieSliceData {
  id: string | number;
  value: number;
  label?: PieSliceLabelConfig;
  labelOffset?: number;
  arcLabel?: string;
  arcSize?: number;
  isRightAngle?: boolean;
  color?: string;
}

export interface PieChartProps {
  width: number;
  height?: number;
  padding?: number | [number, number, number, number];
  title?: string;
  titleGap?: number;
  data: PieSliceData[];
  initialAngle?: number;
  className?: string;
}

export const PieChart: React.FC<PieChartProps> = ({
  width,
  height,
  padding = 0,
  title,
  titleGap = 20,
  data,
  initialAngle = 0,
  className = "",
}) => {
  // 透過 useMemo 快取幾何計算結果，避免頻繁呼叫 measureLatex 影響效能
  const layout = useMemo(() => {
    const p = Array.isArray(padding)
      ? padding
      : [padding, padding, padding, padding];
    const [pt, pr, pb, pl] = p;

    // 1. 精準測量 Title 尺寸
    const titleMetrics = title ? measureLatex(title) : { width: 0, height: 0 };
    const titleSpace = title ? titleMetrics.height + titleGap : 0;

    // Title 實際向下推擠的 Top Padding
    const effectivePt = pt + titleSpace;

    // 2. 判斷 Title 是否過長，如果大於設定的 width，就自動撐開實際畫布寬度 (加 8px 緩衝)
    const minRequiredWidth = title ? titleMetrics.width + pl + pr + 8 : width;
    const actualWidth = Math.max(width, minRequiredWidth);

    // 3. 扣除 Padding 後，真正可以用來畫圓的範圍
    const availableWidth = actualWidth - pl - pr;
    const availableHeight =
      height !== undefined ? height - effectivePt - pb : availableWidth;

    // 半徑受限於可用寬高之中的最小值，保證不超出畫布
    const r = Math.min(availableWidth, availableHeight) / 2;

    // 若未提供 height，則自動包裹住圓形高度
    const actualHeight = height ?? effectivePt + r * 2 + pb;

    const cx = pl + availableWidth / 2;
    const cy = effectivePt + r; // cy 直接根據半徑與頂部距離計算即可

    return {
      actualWidth,
      actualHeight,
      cx,
      cy,
      r,
      pt,
    };
  }, [width, height, padding, title, titleGap]);

  const { actualWidth, actualHeight, cx, cy, r, pt } = layout;

  const total = data.reduce((sum, d) => sum + d.value, 0);
  let currentAngle = (initialAngle * Math.PI) / 180;

  return (
    <svg
      width={actualWidth}
      height={actualHeight}
      className={`bg-white transition-all duration-100 ease-out ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 渲染標題：請注意這裡的 X 座標改用實際撐開後的 actualWidth / 2 */}
      {title && (
        <Label
          pos={[actualWidth / 2, pt]}
          align="bottom"
          offset={0}
          text={title}
        />
      )}

      {/* 渲染扇形 */}
      {data.map((slice) => {
        const angleExtent = (slice.value / total) * 2 * Math.PI;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angleExtent;
        const midAngle = currentAngle + angleExtent / 2;

        currentAngle += angleExtent;

        if (angleExtent >= 2 * Math.PI - 0.0001) {
          return (
            <g key={slice.id}>
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill={slice.color || "white"}
                stroke="black"
              />
            </g>
          );
        }

        const x1 = cx + r * Math.cos(startAngle);
        const y1 = cy + r * Math.sin(startAngle);
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy + r * Math.sin(endAngle);

        const largeArcFlag = angleExtent > Math.PI ? 1 : 0;

        const pathData = `
          M ${cx} ${cy}
          L ${x1} ${y1}
          A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}
          Z
        `;

        const labelRadius = r * (slice.labelOffset ?? 0.65);

        return (
          <g key={slice.id}>
            <path
              d={pathData}
              fill={slice.color || "white"}
              stroke="black"
              strokeWidth={1}
            />

            {(slice.arcLabel || slice.isRightAngle) && (
              <AngleMarker
                vertex={[cx, cy]}
                p1={[cx + Math.cos(startAngle), cy + Math.sin(startAngle)]}
                p2={[cx + Math.cos(endAngle), cy + Math.sin(endAngle)]}
                size={slice.arcSize || 20}
                isRightAngle={slice.isRightAngle}
                label={
                  slice.arcLabel
                    ? { text: slice.arcLabel, offset: 5 }
                    : undefined
                }
              />
            )}

            {slice.label && (
              <g
                transform={`translate(${cx + labelRadius * Math.cos(midAngle)}, ${cy + labelRadius * Math.sin(midAngle)})`}
              >
                <Label
                  pos={slice.label.pos || [0, 0]}
                  text={slice.label.text}
                  align={slice.label.align || "center"}
                  offset={slice.label.offset || 0}
                  color={slice.label.color}
                  fontSize={slice.label.fontSize}
                />
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
};
