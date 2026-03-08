// src/utils/measure.ts

import katex from "katex";
import { LAYOUT } from "../constants";
import { normalizeFontSize } from "./type";

export interface MeasureResult {
  width: number;
  height: number;
}

// 🌟 1. 設置估算模式專用的常數變數 (可以依照字型隨時微調)
const ESTIMATION_CONFIG = {
  MAX_LENGTH: 10, // 允許估算的最大字串長度
  WIDTH_NARROW: 0.3, // 窄字元權重 (如 i, j, l, 1, 標點, 空白)
  WIDTH_WIDE: 0.7, // 寬字元權重 (如 大寫字母, +, -)
  WIDTH_EXTRA_WIDE: 0.9, // 超寬字元權重 (如 m, w, M, W)
  WIDTH_DEFAULT: 0.55, // 一般字元權重 (如 一般小寫, 數字)
  HEIGHT_BASE: 1.1, // 基礎高度比例
  HEIGHT_DESCENDER: 0.25, // 下行字母額外高度比例 (如 g, j, p, q, y)
  WIDTH_SAFETY_MARGIN: 1.05, // 寬度安全容錯比例 (預設加寬 5%)
};

const measureCache = new Map<string, MeasureResult>();
let measureNode: HTMLElement | null = null;

// 🌟 2. 將估算邏輯抽離成獨立的函式
function estimateTextSize(
  text: string,
  fontSize: number,
): MeasureResult | null {
  // 預處理：把 \text{...} 剝殼，提取裡面的純文字
  const strippedText = text.replace(/\\text\{([^}]+)\}/g, "$1");

  // 檢查是否符合估算條件 (限制長度且無複雜 KaTeX 符號)
  if (
    strippedText.length > ESTIMATION_CONFIG.MAX_LENGTH ||
    strippedText.includes("\\") ||
    strippedText.includes("^") ||
    strippedText.includes("_")
  ) {
    return null; // 不符合條件，回傳 null 以退回慢速精準通道
  }

  let estimatedWidth = 0;

  // 根據字元特徵給予對應的寬度權重
  for (const char of strippedText) {
    if (/[ijlI1., ]/.test(char)) {
      estimatedWidth += fontSize * ESTIMATION_CONFIG.WIDTH_NARROW;
    } else if (/[A-Z]/.test(char) || char === "-" || char === "+") {
      estimatedWidth += fontSize * ESTIMATION_CONFIG.WIDTH_WIDE;
    } else if (/[mwMW]/.test(char)) {
      estimatedWidth += fontSize * ESTIMATION_CONFIG.WIDTH_EXTRA_WIDE;
    } else {
      estimatedWidth += fontSize * ESTIMATION_CONFIG.WIDTH_DEFAULT;
    }
  }

  // 估算高度與下行字母處理
  let estimatedHeight = fontSize * ESTIMATION_CONFIG.HEIGHT_BASE;
  if (/[gjpqy]/.test(strippedText)) {
    estimatedHeight += fontSize * ESTIMATION_CONFIG.HEIGHT_DESCENDER;
  }

  return {
    width: Math.ceil(estimatedWidth * ESTIMATION_CONFIG.WIDTH_SAFETY_MARGIN),
    height: Math.ceil(estimatedHeight),
  };
}

// 🌟 3. 主函式增加 allowEstimation 參數，預設為 true
export function measureLatex(
  text: string | number,
  fontSize: string | number = LAYOUT.DEFAULT_FONT_SIZE,
  allowEstimation: boolean = true,
): MeasureResult {
  const strText = String(text);
  if (!strText) return { width: 0, height: 0 };

  const numFontSize = normalizeFontSize(fontSize);

  // 🟢 Fast-Path: 如果允許估算，嘗試取得估算結果
  if (allowEstimation) {
    const estimatedResult = estimateTextSize(strText, numFontSize);
    // 如果成功估算出結果，直接回傳
    if (estimatedResult) {
      return estimatedResult;
    }
  }

  // 🔴 Slow-Path: 不允許估算、或是長字串/複雜 KaTeX，進入 Cache 與 DOM 測量
  const cacheKey = `${strText}|${numFontSize}`;

  if (measureCache.has(cacheKey)) {
    return measureCache.get(cacheKey)!;
  }

  // --- 以下為原本的昂貴 DOM 測量邏輯 ---
  if (typeof document !== "undefined" && !measureNode) {
    measureNode = document.createElement("div");
    measureNode.id = "measure-node";
    Object.assign(measureNode.style, {
      position: "absolute",
      visibility: "hidden",
      pointerEvents: "none",
      whiteSpace: "nowrap",
      zIndex: "-1000",
    });
    document.body.appendChild(measureNode);
  }

  let finalWidth = 0;
  let finalHeight = 0;

  if (measureNode) {
    measureNode.style.fontSize =
      typeof fontSize === "number" ? `${fontSize}px` : fontSize;

    measureNode.innerHTML = katex.renderToString(strText, {
      throwOnError: false,
      displayMode: false,
    });

    const elements = measureNode.querySelectorAll("*");
    let minTop = Infinity;
    let maxBottom = -Infinity;
    let minLeft = Infinity;
    let maxRight = -Infinity;

    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        if (rect.top < minTop) minTop = rect.top;
        if (rect.bottom > maxBottom) maxBottom = rect.bottom;
        if (rect.left < minLeft) minLeft = rect.left;
        if (rect.right > maxRight) maxRight = rect.right;
      }
    });

    if (minTop !== Infinity && maxBottom !== -Infinity) {
      finalWidth = maxRight - minLeft;
      finalHeight = maxBottom - minTop;
    } else {
      const fallbackRect = measureNode.getBoundingClientRect();
      finalWidth = fallbackRect.width;
      finalHeight = fallbackRect.height;
    }
  }

  const result = {
    width: Math.ceil(finalWidth),
    height: Math.ceil(finalHeight),
  };

  if (measureCache.size > 2000) {
    measureCache.clear();
  }

  measureCache.set(cacheKey, result);

  return result;
}
