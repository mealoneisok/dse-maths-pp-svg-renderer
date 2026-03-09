// src/utils/layout/cartesian.ts

import { measureLatex } from "../measure";
import { createLinearScale, formatTick, generateTicks } from "../ticks";
import { LAYOUT } from "../../constants";
import {
  type CartesianAxisConfig,
  type CartesianAxisRenderConfig,
} from "../../components/types";
import { type LabelConfig, type Vector2 } from "../../components/elements";
import { normalizeGrid, normalizeLabel, normalizePadding } from "../type";

// 統一處理預設值與 Ticks 的生成
function parseAndNormalizeCartesianAxis(
  axis: CartesianAxisConfig | undefined,
  type: "x" | "y",
) {
  const domain = axis?.domain || LAYOUT.DEFAULT_AXIS_DOMAIN;
  const step = axis?.step || LAYOUT.DEFAULT_AXIS_STEP;

  return {
    ...axis,
    domain,
    step,
    tickValues: generateTicks(domain, step),
    showNumbers: axis?.showNumbers ?? true,
    extendStart: axis?.extendStart ?? LAYOUT.DEFAULT_AXIS_EXTEND_START,
    extendEnd: axis?.extendEnd ?? LAYOUT.DEFAULT_AXIS_EXTEND_END,
    tickTextPos: axis?.tickTextPos ?? (type === "x" ? "bottom" : "left"),
  };
}

export interface CartesianPaddingConfig {
  xAxis: ReturnType<typeof parseAndNormalizeCartesianAxis>;
  yAxis: ReturnType<typeof parseAndNormalizeCartesianAxis>;
  basePadding: [number, number, number, number];
  showOrigin: boolean;
  originLabel: LabelConfig | string | null;
}

const getTickSize = (
  val: number | string,
  axis: CartesianPaddingConfig["xAxis"],
  dimension: "width" | "height",
) => {
  if (axis.showNumbers === false) return 0;
  const displayStr = formatTick(val, axis.tickMap);
  return displayStr ? measureLatex(String(displayStr))[dimension] : 0;
};

const getMaxTickSize = (
  axis: CartesianPaddingConfig["xAxis"],
  dimension: "width" | "height",
) => {
  if (axis.showNumbers === false || axis.tickValues.length === 0) return 0;
  return axis.tickValues.reduce(
    (max, tick) => Math.max(max, getTickSize(tick.val, axis, dimension)),
    0,
  );
};

export function getPadding({
  xAxis,
  yAxis,
  basePadding,
  showOrigin = true,
  originLabel = LAYOUT.DEFAULT_CARTESIAN_ORIGIN_LABEL_TEXT,
}: CartesianPaddingConfig) {
  const [padTop, padRight, padBottom, padLeft] = basePadding;
  let pt = padTop,
    pr = padRight,
    pb = padBottom,
    pl = padLeft;

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

  pl += Math.max(
    xAxis.extendStart,
    xAxis.tickValues.length > 0
      ? getTickSize(xAxis.tickValues[0].val, xAxis, "width") / 2
      : 0,
    xAxis.domain[0] >= 0
      ? Math.max(getMaxTickSize(yAxis, "width"), originLeftSpace)
      : 0,
  );

  pb += Math.max(
    yAxis.extendStart,
    yAxis.tickValues.length > 0
      ? getTickSize(yAxis.tickValues[0].val, yAxis, "height") / 2
      : 0,
    yAxis.domain[0] >= 0
      ? Math.max(getMaxTickSize(xAxis, "height"), originBottomSpace)
      : 0,
  );

  pr += Math.max(
    xAxis.extendEnd +
      measureLatex((normalizeLabel(xAxis.label) || {}).text || "x").width / 2,
    xAxis.tickValues.length > 0
      ? getTickSize(
          xAxis.tickValues[xAxis.tickValues.length - 1].val,
          xAxis,
          "width",
        ) / 2
      : 0,
    xAxis.domain[1] <= 0 ? getMaxTickSize(yAxis, "width") : 0,
  );

  pt += Math.max(
    yAxis.extendEnd +
      measureLatex((normalizeLabel(yAxis.label) || {}).text || "y").height / 2,
    yAxis.tickValues.length > 0
      ? getTickSize(
          yAxis.tickValues[yAxis.tickValues.length - 1].val,
          yAxis,
          "height",
        ) / 2
      : 0,
    yAxis.domain[1] <= 0 ? getMaxTickSize(xAxis, "height") : 0,
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
  // 1. 提早正規化
  const normX = parseAndNormalizeCartesianAxis(xAxis, "x");
  const normY = parseAndNormalizeCartesianAxis(yAxis, "y");

  // 2. 計算 Padding
  const dynamicPadding = getPadding({
    xAxis: normX,
    yAxis: normY,
    basePadding: normalizePadding(padding),
    showOrigin,
    originLabel,
  });

  // 3. 比例尺與 pt 函數
  const scaleX = createLinearScale(
    normX.domain[0],
    normX.domain[1],
    dynamicPadding.left,
    width - dynamicPadding.right,
  );
  const scaleY = createLinearScale(
    normY.domain[0],
    normY.domain[1],
    height - dynamicPadding.bottom,
    dynamicPadding.top,
  );
  const pt = (x: number, y: number): Vector2 => [scaleX(x), scaleY(y)];

  const originLabelObj = normalizeLabel(originLabel, {
    align: LAYOUT.DEFAULT_CARTESIAN_ORIGIN_LABEL_ALIGN,
    offset: LAYOUT.DEFAULT_CARTESIAN_ORIGIN_LABEL_OFFSET,
    pos: pt(0, 0),
  });

  // 4. Grid 計算
  const getDefaultGrid = (negLen: number, posLen: number) => ({
    length: [negLen, posLen] as Vector2,
    direction: "both" as const,
    skipZero: true,
    dash: "dotted" as const,
  });

  const xGrid = normalizeGrid(
    normX.grid,
    getDefaultGrid(
      scaleY(0) - (scaleY(normY.domain[1]) - normY.extendEnd),
      scaleY(normY.domain[0]) + normY.extendStart - scaleY(0),
    ),
  );

  const yGrid = normalizeGrid(
    normY.grid,
    getDefaultGrid(
      scaleX(0) - (scaleX(normX.domain[0]) - normX.extendStart),
      scaleX(normX.domain[1]) + normX.extendEnd - scaleX(0),
    ),
  );

  const _xAxis: CartesianAxisRenderConfig = {
    ...normX,
    start: pt(normX.domain[0], 0),
    end: pt(normX.domain[1], 0),
    grid: xGrid,
    label: normalizeLabel(normX.label, {
      align: "bottom",
      offset: 8,
      text: "x",
    }),
  };

  const _yAxis: CartesianAxisRenderConfig = {
    ...normY,
    start: pt(0, normY.domain[0]),
    end: pt(0, normY.domain[1]),
    grid: yGrid,
    label: normalizeLabel(normY.label, { align: "left", offset: 8, text: "y" }),
  };

  return {
    _xAxis,
    _yAxis,
    scaleX,
    scaleY,
    pt,
    originLabelObj,
  };
}
