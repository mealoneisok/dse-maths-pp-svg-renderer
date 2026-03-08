// src/utils/layout/cartesian.ts

import { measureLatex } from "../measure";
import { createLinearScale, formatTick, generateTicks } from "../ticks";
import { LAYOUT } from "../../constants";
import { type CartesianAxisConfig } from "../../components/types";
import { type LabelConfig, type TickValue } from "../../components/elements";
import { normalizeGrid, normalizeLabel, normalizePadding } from "../type";

export interface CartesianPaddingConfig {
  xAxis: CartesianAxisConfig;
  yAxis: CartesianAxisConfig;
  xTicks: TickValue[];
  yTicks: TickValue[];
  basePadding: [number, number, number, number];
  showOrigin: boolean;
  originLabel: LabelConfig | string | null;
}

const getTickSize = (
  val: number | string,
  axis: CartesianAxisConfig,
  dimension: "width" | "height",
) => {
  if (axis.showNumbers === false) return 0;
  const displayStr = formatTick(val, axis.tickMap);
  return displayStr ? measureLatex(String(displayStr))[dimension] : 0;
};

const getMaxTickSize = (
  ticks: TickValue[],
  axis: CartesianAxisConfig,
  dimension: "width" | "height",
) => {
  if (axis.showNumbers === false || ticks.length === 0) return 0;
  return ticks.reduce(
    (max, tick) => Math.max(max, getTickSize(tick.val, axis, dimension)),
    0,
  );
};

export const getAxisExtends = (
  xAxis: CartesianAxisConfig,
  yAxis: CartesianAxisConfig,
) => ({
  xExtStart: xAxis.extendStart ?? LAYOUT.DEFAULT_AXIS_EXTEND_START,
  xExtEnd: xAxis.extendEnd ?? LAYOUT.DEFAULT_AXIS_EXTEND_END,
  yExtStart: yAxis.extendStart ?? LAYOUT.DEFAULT_AXIS_EXTEND_START,
  yExtEnd: yAxis.extendEnd ?? LAYOUT.DEFAULT_AXIS_EXTEND_END,
});

export function getPadding({
  xAxis,
  yAxis,
  xTicks,
  yTicks,
  basePadding,
  showOrigin = true,
  originLabel = LAYOUT.DEFAULT_CARTESIAN_ORIGIN_LABEL_TEXT,
}: CartesianPaddingConfig) {
  const [padTop, padRight, padBottom, padLeft] = basePadding;
  let pt = padTop,
    pr = padRight,
    pb = padBottom,
    pl = padLeft;

  const { xExtStart, xExtEnd, yExtStart, yExtEnd } = getAxisExtends(
    xAxis,
    yAxis,
  );

  let originLeftSpace = 0;
  let originBottomSpace = 0;
  if (showOrigin && originLabel !== null) {
    const {
      text = LAYOUT.DEFAULT_CARTESIAN_ORIGIN_LABEL_TEXT,
      offset = LAYOUT.DEFAULT_CARTESIAN_ORIGIN_LABEL_OFFSET,
      align = LAYOUT.DEFAULT_CARTESIAN_ORIGIN_LABEL_ALIGN,
    } = normalizeLabel(originLabel) || {};
    const { width, height } = measureLatex(text);
    originLeftSpace = align.includes("left") ? width + offset : width / 2;
    originBottomSpace = align.includes("bottom") ? height + offset : height / 2;
  }

  // 🟢 取得定義域，用來判斷軸線是否貼著邊界
  const xD = xAxis.domain || LAYOUT.DEFAULT_AXIS_DOMAIN;
  const yD = yAxis.domain || LAYOUT.DEFAULT_AXIS_DOMAIN;

  pl += Math.max(
    xExtStart,
    xTicks.length > 0 ? getTickSize(xTicks[0].val, xAxis, "width") / 2 : 0,
    xD[0] >= 0
      ? Math.max(getMaxTickSize(yTicks, yAxis, "width"), originLeftSpace)
      : 0,
  );

  pb += Math.max(
    yExtStart,
    yTicks.length > 0 ? getTickSize(yTicks[0].val, yAxis, "height") / 2 : 0,
    yD[0] >= 0
      ? Math.max(getMaxTickSize(xTicks, xAxis, "height"), originBottomSpace)
      : 0,
  );

  pr += Math.max(
    xExtEnd +
      measureLatex((normalizeLabel(xAxis.label) || {}).text || "x").width / 2,
    xTicks.length > 0
      ? getTickSize(xTicks[xTicks.length - 1].val, xAxis, "width") / 2
      : 0,
    xD[1] <= 0 ? getMaxTickSize(yTicks, yAxis, "width") : 0,
  );

  pt += Math.max(
    yExtEnd +
      measureLatex((normalizeLabel(yAxis.label) || {}).text || "y").height / 2,
    yTicks.length > 0
      ? getTickSize(yTicks[yTicks.length - 1].val, yAxis, "height") / 2
      : 0,
    yD[1] <= 0 ? getMaxTickSize(xTicks, xAxis, "height") : 0,
  );

  return { top: pt, right: pr, bottom: pb, left: pl };
}

interface CartesianLayoutProps {
  width: number;
  height: number;
  padding: number | [number, number, number, number];
  showOrigin: boolean;
  originLabel: LabelConfig | string | null;
  xAxis: CartesianAxisConfig;
  yAxis: CartesianAxisConfig;
}

export function calculateLayout({
  width,
  height,
  padding,
  showOrigin,
  originLabel,
  xAxis,
  yAxis,
}: CartesianLayoutProps) {
  const xDomain = xAxis.domain || LAYOUT.DEFAULT_AXIS_DOMAIN;
  const yDomain = yAxis.domain || LAYOUT.DEFAULT_AXIS_DOMAIN;
  const xStep = xAxis.step || LAYOUT.DEFAULT_AXIS_STEP;
  const yStep = yAxis.step || LAYOUT.DEFAULT_AXIS_STEP;

  const xTicks = generateTicks(xDomain, xStep);
  const yTicks = generateTicks(yDomain, yStep);
  const dynamicPadding = getPadding({
    xAxis,
    yAxis,
    xTicks,
    yTicks,
    basePadding: normalizePadding(padding),
    showOrigin,
    originLabel,
  });

  // 3 & 4. 比例尺與原點 (保留不變)
  const scaleX = createLinearScale(
    xDomain[0],
    xDomain[1],
    dynamicPadding.left,
    width - dynamicPadding.right,
  );
  const scaleY = createLinearScale(
    yDomain[0],
    yDomain[1],
    height - dynamicPadding.bottom,
    dynamicPadding.top,
  );
  const pt = (x: number, y: number): [number, number] => [scaleX(x), scaleY(y)];
  const originLabelObj = normalizeLabel(originLabel, {
    align: LAYOUT.DEFAULT_CARTESIAN_ORIGIN_LABEL_ALIGN,
    offset: LAYOUT.DEFAULT_CARTESIAN_ORIGIN_LABEL_OFFSET,
    pos: pt(0, 0),
  });

  // 5. 處理軸線延伸與網格 (Grid)
  const { xExtStart, xExtEnd, yExtStart, yExtEnd } = getAxisExtends(
    xAxis,
    yAxis,
  );

  // 建立 Grid 的小工具，減少冗長設定
  const getDefaultGrid = (negLen: number, posLen: number) => ({
    length: [negLen, posLen] as [number, number],
    direction: "both" as const,
    skipZero: true,
    dash: "dotted" as const,
  });

  const xGrid = normalizeGrid(
    xAxis.grid,
    getDefaultGrid(
      scaleY(0) - (scaleY(yDomain[1]) - yExtEnd),
      scaleY(yDomain[0]) + yExtStart - scaleY(0),
    ),
  );
  const yGrid = normalizeGrid(
    yAxis.grid,
    getDefaultGrid(
      scaleX(0) - (scaleX(xDomain[0]) - xExtStart),
      scaleX(xDomain[1]) + xExtEnd - scaleX(0),
    ),
  );

  // 6. 處理軸線標籤 (Axis Label)
  const xLabel = normalizeLabel(xAxis.label, {
    align: "bottom",
    offset: 8,
    text: "x",
  });
  const yLabel = normalizeLabel(yAxis.label, {
    align: "left",
    offset: 8,
    text: "y",
  });

  return {
    xDomain,
    yDomain,
    xTicks,
    yTicks,
    scaleX,
    scaleY,
    pt,
    originLabelObj,
    xExtStart,
    xExtEnd,
    yExtStart,
    yExtEnd,
    xGrid,
    yGrid,
    xLabel,
    yLabel,
  };
}
