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

    // --- 計算「所有子元素」的真實視覺邊界 ---
    // 因為 KaTeX 內部使用 absolute 定位推擠多行文字，父節點無法準確反映高度
    const elements = measureNode.querySelectorAll("*");
    let minTop = Infinity;
    let maxBottom = -Infinity;
    let minLeft = Infinity;
    let maxRight = -Infinity;

    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      // 過濾掉沒有實際尺寸的元素 (例如隱藏的輔助節點)
      if (rect.width > 0 && rect.height > 0) {
        if (rect.top < minTop) minTop = rect.top;
        if (rect.bottom > maxBottom) maxBottom = rect.bottom;
        if (rect.left < minLeft) minLeft = rect.left;
        if (rect.right > maxRight) maxRight = rect.right;
      }
    });

    let width = 0;
    let height = 0;

    // 如果成功計算出內部元素的邊界
    if (minTop !== Infinity && maxBottom !== -Infinity) {
      width = maxRight - minLeft;
      height = maxBottom - minTop;
    } else {
      // 備用方案：如果遇到純空白或其他無法解析的情況
      const fallbackRect = measureNode.getBoundingClientRect();
      width = fallbackRect.width;
      height = fallbackRect.height;
    }

    return {
      width: Math.ceil(width),
      height: Math.ceil(height),
    };
  }
  return { width: 0, height: 0 };
}
