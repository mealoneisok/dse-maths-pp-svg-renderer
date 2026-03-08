// src/utils/layout.ts

import { measureLatex } from "./measure";
import { formatTick } from "./ticks";
import { LAYOUT } from "../constants";
import {
  type AxisConfig,
  type CartesianAxisConfig,
  type ParsedAxisConfig,
} from "../components/types";
import { type LabelConfig, type TickValue } from "../components/elements";
import { normalizeLabel } from "./type";

export interface AxisMetrics {
  titleOffset: number;
  totalPaddingRequired: number;
}

export function getAxisMetrics(
  type: "x" | "y",
  axis: AxisConfig & { tickValues?: TickValue[] },
): AxisMetrics {
  let maxNumSize = 0;
  if (axis.showNumbers !== false && axis.tickValues) {
    axis.tickValues.forEach(({ val }) => {
      const displayStr = formatTick(val, axis.tickMap);
      if (displayStr !== "") {
        const size = measureLatex(displayStr.toString());
        const v = type === "y" ? size.width : size.height;
        if (v > maxNumSize) maxNumSize = v;
      }
    });
  }

  // 取得刻度相關設定 (需要考慮 ChartFrame 中實際硬塞的預設值)
  const showTickLines = axis.showTickLines ?? (type === "y" ? true : false);
  const tickLength = axis.tickLength ?? LAYOUT.AXIS_TICK_LENGTH;
  const tickLineAlign = axis.tickLineAlign ?? (type === "x" ? 1 : 0);

  // 1. 計算「刻度線」本身往外物理凸出的距離
  let tickOutwardSpace = 0;
  if (showTickLines) {
    // 若為 0 (Y軸預設)，向外凸出 tickLength / 2
    // 若不為 0 (X軸預設為 1)，向外凸出完整的 tickLength
    tickOutwardSpace = tickLineAlign === 0 ? tickLength / 2 : tickLength;
  }

  // 2. 計算基礎與數字佔用空間
  let numSpace = 0;
  if (axis.showNumbers !== false) {
    // 有數字時：刻度凸出量 + 數字偏移安全距離 + 最大數字尺寸
    numSpace = tickOutwardSpace + LAYOUT.AXIS_NUMBER_OFFSET + maxNumSize;
  } else {
    // 沒數字時：只保留刻度凸出量，確保刻度不被切掉
    numSpace = tickOutwardSpace;
  }

  // 3. 標題的額外間距
  const axisTitleGap = axis.title ? LAYOUT.AXIS_TITLE_EXTRA_GAP : 0;

  // 4. 標題的起始位置
  const titleOffset = numSpace + axisTitleGap;

  // 5. 總共需要的 Padding
  let totalPaddingReq = titleOffset;
  const titleObj = normalizeLabel(axis.title);
  if (titleObj) {
    totalPaddingReq = titleOffset + measureLatex(titleObj.text!).height;
  }

  return { titleOffset, totalPaddingRequired: totalPaddingReq };
}

// 建立一個檢查邊界溢出的輔助函數
export const checkOverflow = (
  axis: ParsedAxisConfig,
  isLast: boolean,
  dimension: "width" | "height",
  axisLength: number,
  currentPadding: number,
) => {
  if (!axis.showNumbers || !axis.tickValues || axis.tickValues.length === 0) {
    return currentPadding;
  }

  const tick = axis.tickValues[isLast ? axis.tickValues.length - 1 : 0];
  const displayStr = formatTick(tick.val, axis.tickMap);
  const size = measureLatex(String(displayStr))[dimension];

  // isLast 為 true 時檢查距離終點的空間 (1 - t)，false 時檢查距離起點的空間 (t)
  const distanceToBoundary = axisLength * (isLast ? 1 - tick.t : tick.t);
  const requiredPadding = size / 2 - distanceToBoundary;

  // 利用 Math.max 確保只有在需要的空間大於現有 padding 時才更新
  return Math.max(currentPadding, requiredPadding);
};

export interface CartesianPaddingConfig {
  xAxis: CartesianAxisConfig;
  yAxis: CartesianAxisConfig;
  xTicks: TickValue[];
  yTicks: TickValue[];
  basePadding: [number, number, number, number];
  showOrigin: boolean;
  originLabel: LabelConfig | string | null;
}

export function getCartesianPadding({
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

  const xExtStart = xAxis.extendStart ?? LAYOUT.DEFAULT_AXIS_EXTEND_START ?? 0;
  const xExtEnd = xAxis.extendEnd ?? LAYOUT.DEFAULT_AXIS_EXTEND_END ?? 20;
  const yExtStart = yAxis.extendStart ?? LAYOUT.DEFAULT_AXIS_EXTEND_START ?? 0;
  const yExtEnd = yAxis.extendEnd ?? LAYOUT.DEFAULT_AXIS_EXTEND_END ?? 20;

  // --- 0. 預先計算原點標籤的大小 ---
  let originLeftSpace = 0;
  let originBottomSpace = 0;

  if (showOrigin && originLabel !== null) {
    const text =
      typeof originLabel === "string" ? originLabel : originLabel.text || "O";
    const offset =
      typeof originLabel === "object" ? (originLabel.offset ?? 8) : 8;
    const align =
      typeof originLabel === "object"
        ? originLabel.align || "bottom-left"
        : "bottom-left";

    const dim = measureLatex(text);

    if (align.includes("left")) {
      originLeftSpace = dim.width + offset;
    } else {
      originLeftSpace = dim.width / 2;
    }

    if (align.includes("bottom")) {
      originBottomSpace = dim.height + offset;
    } else {
      originBottomSpace = dim.height / 2;
    }
  }

  // --- Left ---
  let leftMax = xExtStart;

  if (yAxis.showNumbers !== false && yTicks.length > 0) {
    let maxYTickWidth = 0;
    for (const tick of yTicks) {
      const displayStr = formatTick(tick.val, yAxis.tickMap);
      if (displayStr !== "") {
        const textWidth = measureLatex(String(displayStr)).width;
        maxYTickWidth = Math.max(maxYTickWidth, textWidth);
      }
    }
    leftMax = Math.max(leftMax, maxYTickWidth);
  }

  if (xAxis.showNumbers !== false && xTicks.length > 0) {
    const displayStr = formatTick(xTicks[0].val, xAxis.tickMap);
    leftMax = Math.max(leftMax, measureLatex(String(displayStr)).width / 2);
  }

  leftMax = Math.max(leftMax, originLeftSpace);
  pl += leftMax;

  // --- Bottom ---
  let bottomMax = yExtStart;

  if (xAxis.showNumbers !== false && xTicks.length > 0) {
    let maxXTickHeight = 0;
    for (const tick of xTicks) {
      const displayStr = formatTick(tick.val, xAxis.tickMap);
      if (displayStr !== "") {
        const textHeight = measureLatex(String(displayStr)).height;
        maxXTickHeight = Math.max(maxXTickHeight, textHeight);
      }
    }
    bottomMax = Math.max(bottomMax, maxXTickHeight);
  }

  if (yAxis.showNumbers !== false && yTicks.length > 0) {
    const displayStr = formatTick(yTicks[0].val, yAxis.tickMap);
    bottomMax = Math.max(
      bottomMax,
      measureLatex(String(displayStr)).height / 2,
    );
  }

  bottomMax = Math.max(bottomMax, originBottomSpace);
  pb += bottomMax;

  // --- Right ---
  let rightMax = xExtEnd;
  const xLabelTextRight =
    xAxis.label == null
      ? "x"
      : typeof xAxis.label === "string"
        ? xAxis.label
        : xAxis.label.text || "x";
  rightMax = Math.max(
    rightMax,
    xExtEnd + measureLatex(xLabelTextRight).width / 2,
  );

  if (xAxis.showNumbers !== false && xTicks.length > 0) {
    const displayStr = formatTick(xTicks[xTicks.length - 1].val, xAxis.tickMap);
    rightMax = Math.max(rightMax, measureLatex(String(displayStr)).width / 2);
  }
  pr += rightMax;

  // --- Top ---
  let topMax = yExtEnd;
  const yLabelTextTop =
    yAxis.label == null
      ? "y"
      : typeof yAxis.label === "string"
        ? yAxis.label
        : yAxis.label.text || "y";
  topMax = Math.max(topMax, yExtEnd + measureLatex(yLabelTextTop).height / 2);

  if (yAxis.showNumbers !== false && yTicks.length > 0) {
    const displayStr = formatTick(yTicks[yTicks.length - 1].val, yAxis.tickMap);
    topMax = Math.max(topMax, measureLatex(String(displayStr)).height / 2);
  }
  pt += topMax;

  return { top: pt, right: pr, bottom: pb, left: pl };
}

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

export function getChartFramePadding({
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

  // 1. 計算 Extend
  const xExtend = showXAxis
    ? (xAxis.extendEnd ??
      (xAxis.showArrow ? LAYOUT.DEFAULT_AXIS_EXTEND_END : 0))
    : 0;
  const yExtend = showYAxis
    ? (yAxis.extendEnd ??
      (yAxis.showArrow ? LAYOUT.DEFAULT_AXIS_EXTEND_END : 0))
    : 0;

  // 2. 計算基礎 Safe Padding
  if (yExtend > 0 && pTop < yExtend) pTop = yExtend;
  if (xExtend > 0 && pRight < xExtend) pRight = xExtend;

  // --- [新增] 2.5 計算端點標籤 (Axis Label) 佔用的空間 ---
  if (showXAxis && xAxis.label) {
    const text =
      typeof xAxis.label === "string" ? xAxis.label : xAxis.label.text;
    const offset =
      typeof xAxis.label === "object" && xAxis.label.offset !== undefined
        ? xAxis.label.offset
        : 8;
    const w = measureLatex(text!).width;
    // X 軸標籤通常在最右側，所需空間為：延伸長度 + 偏移量 + 字體寬度
    const reqRight = xExtend + offset + w;
    if (pRight < reqRight) pRight = reqRight;
  }

  if (showYAxis && yAxis.label) {
    const text =
      typeof yAxis.label === "string" ? yAxis.label : yAxis.label.text;
    const offset =
      typeof yAxis.label === "object" && yAxis.label.offset !== undefined
        ? yAxis.label.offset
        : 8;
    const h = measureLatex(text!).height;
    // Y 軸標籤通常在最上方，所需空間為：延伸長度 + 偏移量 + 字體高度
    const reqTop = yExtend + offset + h;
    if (pTop < reqTop) pTop = reqTop;
  }
  // --------------------------------------------------------

  const MIN_BORDER_PADDING = LAYOUT.DEFAULT_STROKE_WIDTH * 0.5;
  if (borders?.right && pRight < MIN_BORDER_PADDING)
    pRight = MIN_BORDER_PADDING;
  if (showYAxis && pLeft < MIN_BORDER_PADDING) pLeft = MIN_BORDER_PADDING;
  if (borders?.top && pTop < yExtend + MIN_BORDER_PADDING)
    pTop = yExtend + MIN_BORDER_PADDING;
  if (showXAxis && pBot < MIN_BORDER_PADDING) pBot = MIN_BORDER_PADDING;

  // 3. 主標題所需的高度
  if (title) {
    const minTop = yExtend + measureLatex(title).height + titleGap;
    if (pTop < minTop) pTop = minTop;
  }

  // 4. 計算 Axis Metrics (用於軸置中標題 axis.title)
  const yMetrics = showYAxis
    ? getAxisMetrics("y", yAxis)
    : { titleOffset: 0, totalPaddingRequired: 0 };
  if (pLeft < yMetrics.totalPaddingRequired)
    pLeft = yMetrics.totalPaddingRequired;

  const xMetrics = showXAxis
    ? getAxisMetrics("x", xAxis)
    : { titleOffset: 0, totalPaddingRequired: 0 };
  if (pBot < xMetrics.totalPaddingRequired)
    pBot = xMetrics.totalPaddingRequired;

  // 5. 溢出檢查 (用於刻度數字)
  if (showYAxis)
    pBot = checkOverflow(yAxis, false, "height", height - pTop - pBot, pBot);
  if (showXAxis)
    pLeft = checkOverflow(xAxis, false, "width", width - pLeft - pRight, pLeft);
  if (showXAxis)
    pRight = checkOverflow(
      xAxis,
      true,
      "width",
      width - pLeft - pRight,
      pRight,
    );
  if (showYAxis)
    pTop = checkOverflow(yAxis, true, "height", height - pTop - pBot, pTop);

  // 6. 疊加使用者定義的 basePadding
  pTop += basePadding[0];
  pRight += basePadding[1];
  pBot += basePadding[2];
  pLeft += basePadding[3];

  return {
    top: pTop,
    right: pRight,
    bottom: pBot,
    left: pLeft,
    xExtend,
    yExtend,
    xMetrics,
    yMetrics,
  };
}
