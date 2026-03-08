// src/utils/layout/chartFrame.ts

import { measureLatex } from "../measure";
import { createLinearScale, formatTick, parseTicks } from "../ticks";
import { LAYOUT } from "../../constants";
import { type AxisConfig, type ParsedAxisConfig } from "../../components/types";
import { type TickValue } from "../../components/elements";
import { normalizeLabel, normalizePadding } from "../type";

export interface AxisMetrics {
  titleOffset: number;
  totalPaddingRequired: number;
}

export function getAxisMetrics(
  type: "x" | "y",
  axis: AxisConfig & { tickValues?: TickValue[] },
): AxisMetrics {
  // 1. 利用 reduce 簡化最大字體尺寸的測量
  const maxNumSize =
    axis.showNumbers !== false && axis.tickValues
      ? axis.tickValues.reduce((max, { val }) => {
          const displayStr = formatTick(val, axis.tickMap);
          if (!displayStr) return max;
          const size = measureLatex(String(displayStr));
          return Math.max(max, type === "y" ? size.width : size.height);
        }, 0)
      : 0;

  // 2. 移除冗餘三元運算，並修正 tickLineAlign 的預設值以吻合 ChartFrame.tsx
  const showTickLines = axis.showTickLines ?? type === "y";
  const tickLength = axis.tickLength ?? LAYOUT.DEFAULT_AXIS_TICK_LENGTH;
  const tickLineAlign = axis.tickLineAlign ?? 0; // 🌟 修復空白 Bug：配合渲染層預設為 0

  const tickOutwardSpace = showTickLines
    ? tickLineAlign === 0
      ? tickLength / 2
      : tickLength
    : 0;
  const numSpace =
    tickOutwardSpace +
    (axis.showNumbers !== false
      ? LAYOUT.DEFAULT_AXIS_NUMBER_OFFSET + maxNumSize
      : 0);

  const titleOffset =
    numSpace + (axis.title ? LAYOUT.DEFAULT_AXIS_TITLE_EXTRA_GAP : 0);
  const titleObj = normalizeLabel(axis.title);

  return {
    titleOffset,
    totalPaddingRequired: titleObj
      ? titleOffset + measureLatex(titleObj.text!).height
      : titleOffset,
  };
}

export const checkTickNumberOverflow = (
  axis: ParsedAxisConfig,
  isLast: boolean,
  dimension: "width" | "height",
  axisLength: number,
  currentPadding: number,
) => {
  if (!axis.showNumbers || !axis.tickValues || axis.tickValues.length === 0)
    return currentPadding;

  const tick = axis.tickValues[isLast ? axis.tickValues.length - 1 : 0];
  const displayStr = formatTick(tick.val, axis.tickMap);
  const size = measureLatex(String(displayStr))[dimension];

  const distanceToBoundary = axisLength * (isLast ? 1 - tick.t : tick.t);
  const requiredPadding = size / 2 - distanceToBoundary;

  return Math.max(currentPadding, requiredPadding);
};

export interface ChartFramePaddingConfig {
  width: number;
  height: number;
  xAxis: ParsedAxisConfig;
  yAxis: ParsedAxisConfig;
  title?: string;
  titleGap: number;
  basePadding: [number, number, number, number];
  showXAxis: boolean;
  showYAxis: boolean;
  borders?: {
    right?: boolean;
    top?: boolean;
    bottom?: boolean;
    left?: boolean;
  };
}

export function getPadding({
  width,
  height,
  xAxis,
  yAxis,
  title,
  titleGap,
  basePadding,
  showXAxis,
  showYAxis,
  borders,
}: ChartFramePaddingConfig) {
  let [pTop, pRight, pBot, pLeft] = [0, 0, 0, 0];

  const getExtend = (show: boolean, axis: ParsedAxisConfig) =>
    show
      ? (axis.extendEnd ??
        (axis.showArrow ? LAYOUT.DEFAULT_AXIS_EXTEND_END : 0))
      : 0;

  const xExtend = getExtend(showXAxis, xAxis);
  const yExtend = getExtend(showYAxis, yAxis);

  // 3. 全面使用 Math.max 攤平 if-else 邏輯
  pTop = Math.max(pTop, yExtend);
  pRight = Math.max(pRight, xExtend);

  if (showXAxis && xAxis.label) {
    const { text = "x", offset = LAYOUT.DEFAULT_AXIS_LABEL_OFFSET } =
      normalizeLabel(xAxis.label) || {};
    const textSize = measureLatex(text);
    pRight = Math.max(pRight, xExtend + offset + textSize.width);
    pBot = Math.max(pBot, textSize.height / 2);
  }
  if (showYAxis && yAxis.label) {
    const { text = "y", offset = LAYOUT.DEFAULT_AXIS_LABEL_OFFSET } =
      normalizeLabel(yAxis.label) || {};
    const textSize = measureLatex(text);
    pTop = Math.max(pTop, yExtend + offset + textSize.height);
    pLeft = Math.max(pLeft, textSize.width / 2);
  }

  const MIN_PAD = LAYOUT.DEFAULT_STROKE_WIDTH * 0.5;
  pRight = Math.max(pRight, borders?.right ? MIN_PAD : 0);
  pLeft = Math.max(pLeft, showYAxis ? MIN_PAD : 0);
  pTop = Math.max(pTop, borders?.top ? yExtend + MIN_PAD : 0);
  pBot = Math.max(pBot, showXAxis ? MIN_PAD : 0);

  if (title)
    pTop = Math.max(pTop, yExtend + measureLatex(title).height + titleGap);

  const xMetrics = showXAxis
    ? getAxisMetrics("x", xAxis)
    : { titleOffset: 0, totalPaddingRequired: 0 };
  const yMetrics = showYAxis
    ? getAxisMetrics("y", yAxis)
    : { titleOffset: 0, totalPaddingRequired: 0 };

  pBot = Math.max(pBot, xMetrics.totalPaddingRequired);
  pLeft = Math.max(pLeft, yMetrics.totalPaddingRequired);

  // 溢出檢查必須在最後執行
  if (showYAxis) {
    pBot = checkTickNumberOverflow(
      yAxis,
      false,
      "height",
      height - pTop - pBot,
      pBot,
    );
    pTop = checkTickNumberOverflow(
      yAxis,
      true,
      "height",
      height - pTop - pBot,
      pTop,
    );
  }
  if (showXAxis) {
    pLeft = checkTickNumberOverflow(
      xAxis,
      false,
      "width",
      width - pLeft - pRight,
      pLeft,
    );
    pRight = checkTickNumberOverflow(
      xAxis,
      true,
      "width",
      width - pLeft - pRight,
      pRight,
    );
  }

  return {
    top: pTop + basePadding[0],
    right: pRight + basePadding[1],
    bottom: pBot + basePadding[2],
    left: pLeft + basePadding[3],
    xExtend,
    yExtend,
    xMetrics,
    yMetrics,
  };
}

// 🌟 統一參數介面風格 (Config & Result)
export interface ChartLayoutConfig {
  width: number;
  height: number;
  xAxisCfg?: AxisConfig;
  yAxisCfg?: AxisConfig;
  title?: string;
  titleGap?: number;
  padding?: number | [number, number, number, number];
  borders?: {
    right?: boolean;
    top?: boolean;
    bottom?: boolean;
    left?: boolean;
  };
}

export interface ChartLayoutResult {
  _xAxis: ParsedAxisConfig;
  _yAxis: ParsedAxisConfig;
  startX: number;
  endX: number;
  startY: number;
  endY: number;
  scaleY: (v: number) => number;
  scaleX: (v: number) => number;
  getBandX: (i: number, total: number) => number;
  xExtend: number;
  yExtend: number;
  xMetrics: AxisMetrics;
  yMetrics: AxisMetrics;
}

export function calculateLayout({
  width,
  height,
  xAxisCfg,
  yAxisCfg,
  title,
  titleGap = LAYOUT.DEFAULT_CHART_TITLE_GAP,
  padding = 0,
  borders,
}: ChartLayoutConfig): ChartLayoutResult {
  const basePadding = normalizePadding(padding);
  const showYAxis = borders?.left ?? true;
  const showXAxis = borders?.bottom ?? true;

  const _xAxis: ParsedAxisConfig = {
    showNumbers: true,
    showTickLines: false,
    showArrow: false,
    ...xAxisCfg,
    ...parseTicks(xAxisCfg || {}),
  };

  const _yAxis: ParsedAxisConfig = {
    showNumbers: true,
    showTickLines: true,
    showArrow: false,
    grid: true,
    ...yAxisCfg,
    ...parseTicks(yAxisCfg || {}),
  };

  const {
    top: pTop,
    right: pRight,
    bottom: pBot,
    left: pLeft,
    xExtend,
    yExtend,
    xMetrics,
    yMetrics,
  } = getPadding({
    width,
    height,
    xAxis: _xAxis,
    yAxis: _yAxis,
    title,
    titleGap,
    basePadding,
    showXAxis,
    showYAxis,
    borders,
  });

  const startX = pLeft,
    endX = width - pRight;
  const startY = height - pBot,
    endY = pTop;

  return {
    _xAxis,
    _yAxis,
    startX,
    endX,
    startY,
    endY,
    xExtend,
    yExtend,
    xMetrics,
    yMetrics,
    scaleY: _yAxis.domain
      ? createLinearScale(_yAxis.domain[0], _yAxis.domain[1], startY, endY)
      : (v: number) => startY - v,
    scaleX: _xAxis.domain
      ? createLinearScale(_xAxis.domain[0], _xAxis.domain[1], startX, endX)
      : (v: number) => startX + v,
    getBandX: (i: number, total: number) =>
      startX + (endX - startX) * ((i + 0.5) / total),
  };
}
