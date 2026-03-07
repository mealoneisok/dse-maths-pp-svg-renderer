// src/utils/measure.ts

import katex from "katex";
import { LAYOUT } from "../constants";

export interface MeasureResult {
  width: number;
  height: number;
}

// 實時測量 KaTeX 渲染後的長寬
let measureNode: HTMLElement | null = null;
export function measureLatex(
  text: string | number,
  fontSize: string | number = LAYOUT.DEFAULT_FONT_SIZE,
): MeasureResult {
  const strText = String(text);
  if (!strText) return { width: 0, height: 0 };

  if (typeof document !== "undefined" && !measureNode) {
    measureNode = document.createElement("div");
    measureNode.id = "measure-node";
    Object.assign(measureNode.style, {
      position: "absolute",
      visibility: "hidden",
      pointerEvents: "none",
      whiteSpace: "nowrap",
      lineHeight: "1",
      zIndex: "-1000",
    });
    document.body.appendChild(measureNode);
  }

  if (measureNode) {
    measureNode.style.fontSize =
      typeof fontSize === "number" ? `${fontSize}px` : fontSize;

    measureNode.innerHTML = katex.renderToString(strText, {
      throwOnError: false,
      displayMode: false,
    });
    const katexSpan = measureNode.querySelector(".katex");
    const elementToMeasure = katexSpan || measureNode;
    const rect = elementToMeasure.getBoundingClientRect();

    // 計算字體下伸部 (Descender) 的額外空間
    // 提取數值化的 fontSize (預設 16)，並取 25% 作為緩衝 (大約 4px)
    const numericFontSize =
      typeof fontSize === "number"
        ? fontSize
        : parseFloat(fontSize) || LAYOUT.DEFAULT_FONT_SIZE;
    const descenderBuffer = numericFontSize * 0.25;

    return {
      width: Math.ceil(rect.width),
      // 加上緩衝值，讓 ChartFrame 將 pBot 撐開，SVG 畫布就不會切到文字尾巴
      height: Math.ceil(rect.height + descenderBuffer),
    };
  }
  return { width: 0, height: 0 };
}
