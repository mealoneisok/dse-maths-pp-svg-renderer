// src/utils/layout/chartFrame.ts

import { measureLatex } from "../measure";
import { createLinearScale, formatTick, parseTicks } from "../ticks";
import { LAYOUT } from "../../constants";
import {
  type AxisConfig,
  type ParsedAxisConfig,
  type AxisRenderConfig,
} from "../../components/types";
import { type LabelConfig, type Vector2 } from "../../components/elements";
import { normalizeLabel, normalizePadding } from "../type";

// --- 處理 Axis 預設值與解析 ---
function parseAndNormalizeAxis(
  axisCfg: AxisConfig | undefined,
  type: "x" | "y",
): ParsedAxisConfig {
  const isY = type === "y";
  const showArrow = axisCfg?.showArrow ?? false;

  return {
    ...axisCfg,
    showNumbers: axisCfg?.showNumbers ?? true,
    showTickLines: axisCfg?.showTickLines ?? isY,
    showArrow,
    grid: axisCfg?.grid ?? isY,
    // 提早處理 extendEnd 邏輯
    extendEnd:
      axisCfg?.extendEnd ?? (showArrow ? LAYOUT.DEFAULT_AXIS_EXTEND_END : 0),
    extendStart: axisCfg?.extendStart ?? 0,
    // 提早處理 tick 相關預設值
    tickLength: axisCfg?.tickLength ?? LAYOUT.DEFAULT_AXIS_TICK_LENGTH,
    tickLineAlign: axisCfg?.tickLineAlign ?? 0,
    ...parseTicks(axisCfg || {}),
  };
}

export interface AxisMetrics {
  titleObj?: LabelConfig; // 將正規化後的 titleObj 存起來給渲染層用
  titleOffset: number;
  totalPaddingRequired: number;
}

export function getAxisMetrics(
  type: "x" | "y",
  axis: ParsedAxisConfig,
): AxisMetrics {
  const maxNumSize =
    axis.showNumbers && axis.tickValues
      ? axis.tickValues.reduce((max, { val }) => {
          const displayStr = formatTick(val, axis.tickMap);
          if (!displayStr) return max;
          const size = measureLatex(String(displayStr));
          return Math.max(max, type === "y" ? size.width : size.height);
        }, 0)
      : 0;

  const tickOutwardSpace = axis.showTickLines
    ? axis.tickLineAlign === 0
      ? axis.tickLength! / 2
      : axis.tickLength!
    : 0;

  const numSpace =
    tickOutwardSpace +
    (axis.showNumbers ? LAYOUT.DEFAULT_AXIS_NUMBER_OFFSET + maxNumSize : 0);

  const defaultTitleOffset =
    numSpace + (axis.title ? LAYOUT.DEFAULT_AXIS_TITLE_EXTRA_GAP : 0);

  const titleObj = normalizeLabel(axis.title, {
    align: type === "x" ? "bottom" : "top",
    offset: defaultTitleOffset,
    rotation: type === "y" ? -90 : 0,
  });

  const finalTitleOffset = titleObj?.offset ?? defaultTitleOffset;

  return {
    titleObj,
    titleOffset: finalTitleOffset,
    totalPaddingRequired:
      titleObj && titleObj.text
        ? finalTitleOffset + measureLatex(titleObj.text).height
        : numSpace,
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

  // 這裡變得非常乾淨，直接取值
  const getExtend = (show: boolean, axis: ParsedAxisConfig) =>
    show ? axis.extendEnd! : 0;

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
  _xAxis: AxisRenderConfig;
  _yAxis: AxisRenderConfig;
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

  const rawXAxis = parseAndNormalizeAxis(xAxisCfg, "x");
  const rawYAxis = parseAndNormalizeAxis(yAxisCfg, "y");

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
    xAxis: rawXAxis,
    yAxis: rawYAxis,
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

  const _xAxis = {
    ...rawXAxis,
    title: xMetrics.titleObj,
    start: [startX, startY] as Vector2,
    end: [endX, startY] as Vector2,
    extendStart: 0,
    extendEnd: xExtend,
    tickTextPos: "bottom",
    skipZero: false,
    grid: rawXAxis.grid
      ? {
          length: startY - endY,
          direction: "negative" as const,
          skipZero: false,
          color: "#e0e0e0",
          dash: "dotted",
        }
      : undefined,
  };

  const _yAxis = {
    ...rawYAxis,
    title: yMetrics.titleObj,
    start: [startX, startY] as Vector2,
    end: [startX, endY] as Vector2,
    extendStart: 0,
    extendEnd: yExtend,
    tickTextPos: "left",
    skipZero: false,
    grid: rawYAxis.grid
      ? {
          length: endX - startX,
          direction: "positive" as const,
          skipZero: false,
          color: "#e0e0e0",
          dash: "dotted",
        }
      : undefined,
  };

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
    scaleY: rawYAxis.domain
      ? createLinearScale(rawYAxis.domain[0], rawYAxis.domain[1], startY, endY)
      : (v: number) => startY - v,
    scaleX: rawXAxis.domain
      ? createLinearScale(rawXAxis.domain[0], rawXAxis.domain[1], startX, endX)
      : (v: number) => startX + v,
    getBandX: (i: number, total: number) =>
      startX + (endX - startX) * ((i + 0.5) / total),
  };
}
