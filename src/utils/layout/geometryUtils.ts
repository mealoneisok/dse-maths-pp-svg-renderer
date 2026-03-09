// src/utils/layout/geometryUtils.ts

import { measureLatex } from "../measure";
import { LAYOUT } from "@/constants";
import type { LabelConfig, Vector2 } from "../../components/elements";

export interface LabelPixelBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/**
 * 輸入像素座標與 Label 設定，回傳該 Label 在畫面上的實際佔用邊界
 */
export const getLabelPixelBounds = (
  pxX: number,
  pxY: number,
  lbl?: LabelConfig,
): LabelPixelBounds | null => {
  if (!lbl || (!lbl.text && lbl.text !== 0)) return null;

  const { width: boxW, height: boxH } = measureLatex(
    lbl.text,
    lbl.fontSize || 14,
  );
  const offset = lbl.offset ?? 8;
  const align = lbl.align || LAYOUT.DEFAULT_POINT_LABEL_ALIGN;

  let fX = pxX;
  let fY = pxY;

  // 計算 Y 軸對齊
  if (align.includes("top")) fY = pxY - offset - boxH;
  else if (align.includes("bottom")) fY = pxY + offset;
  else fY = pxY - boxH / 2;

  // 計算 X 軸對齊
  if (align.includes("left")) fX = pxX - offset - boxW;
  else if (align.includes("right")) fX = pxX + offset;
  else fX = pxX - boxW / 2;

  return {
    left: fX,
    right: fX + boxW,
    top: fY,
    bottom: fY + boxH,
  };
};

export const createOverflowAccumulator = (
  pTop: number,
  pRight: number,
  pBot: number,
  pLeft: number,
  canvasWidth: number,
  canvasHeight: number,
) => {
  const overflow = { top: 0, right: 0, bottom: 0, left: 0 };

  return {
    add: (bounds: LabelPixelBounds | null) => {
      if (!bounds) return;
      if (bounds.left < pLeft)
        overflow.left = Math.max(overflow.left, pLeft - bounds.left);
      if (bounds.right > canvasWidth - pRight)
        overflow.right = Math.max(
          overflow.right,
          bounds.right - (canvasWidth - pRight),
        );
      if (bounds.top < pTop)
        overflow.top = Math.max(overflow.top, pTop - bounds.top);
      if (bounds.bottom > canvasHeight - pBot)
        overflow.bottom = Math.max(
          overflow.bottom,
          bounds.bottom - (canvasHeight - pBot),
        );
    },
    get: () => overflow,
  };
};

export const normalizeBoundingBox = (
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
  fallback: { minX: number; maxX: number; minY: number; maxY: number },
) => {
  if (minX === Infinity) return fallback;

  let finalMinX = minX,
    finalMaxX = maxX,
    finalMinY = minY,
    finalMaxY = maxY;
  if (finalMaxX === finalMinX) {
    finalMinX -= 1;
    finalMaxX += 1;
  }
  if (finalMaxY === finalMinY) {
    finalMinY -= 1;
    finalMaxY += 1;
  }
  return { minX: finalMinX, maxX: finalMaxX, minY: finalMinY, maxY: finalMaxY };
};

export const getArcExtremePoints = (
  center: Vector2,
  rx: number,
  ry: number,
  startAngle: number,
  endAngle: number,
): Vector2[] => {
  const pts: Vector2[] = [];
  let e = endAngle;
  while (e < startAngle) e += 2 * Math.PI;

  // 起終點
  pts.push([
    center[0] + rx * Math.cos(startAngle),
    center[1] + ry * Math.sin(startAngle),
  ]);
  pts.push([center[0] + rx * Math.cos(e), center[1] + ry * Math.sin(e)]);

  // 極值點 (0, 90, 180, 270 度)
  for (let i = 0; i < 4; i++) {
    let ext = (i * Math.PI) / 2;
    while (ext < startAngle) ext += 2 * Math.PI;
    if (ext <= e) {
      pts.push([
        center[0] + rx * Math.cos(ext),
        center[1] + ry * Math.sin(ext),
      ]);
    }
  }
  return pts;
};

export const getElementsMaxStroke = (
  elementsGroups: Array<Array<{ strokeWidth?: number }> | undefined>,
  points: Array<{ showMarker?: boolean; markerSize?: number }> = [],
  fallback = LAYOUT.DEFAULT_STROKE_WIDTH,
): number => {
  let maxStroke = 0;

  elementsGroups.forEach((group) => {
    if (!group) return;
    group.forEach((item) => {
      maxStroke = Math.max(maxStroke, item.strokeWidth ?? fallback);
    });
  });

  points.forEach((p) => {
    maxStroke = Math.max(maxStroke, p.showMarker ? (p.markerSize ?? 3) * 2 : 0);
  });

  return maxStroke;
};
