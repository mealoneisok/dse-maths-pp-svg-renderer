// src/utils/layout/geometryFrame.ts

import { createLinearScale } from "../scale";
import {
  type PointProps,
  type SegmentProps,
  type PolygonProps,
  type EllipseProps,
  type SectorProps,
  type ArcProps,
  type AngleMarkerProps,
  type RegionProps,
  type LabelConfig,
  type Vector2,
  type DimLineProps,
} from "../../components/elements";
import { normalizePadding } from "../type";
import { LAYOUT } from "@/constants";
import {
  getLabelPixelBounds,
  normalizeBoundingBox,
  getArcExtremePoints,
  createOverflowAccumulator,
  getElementsMaxStroke,
} from "./geometryUtils";

export interface GeometryLayoutConfig {
  width: number;
  height?: number;
  padding: number | [number, number, number, number];
  elements: {
    points?: PointProps[];
    segments?: SegmentProps[];
    polygons?: PolygonProps[];
    ellipses?: EllipseProps[];
    sectors?: SectorProps[];
    arcs?: ArcProps[];
    angleMarkers?: AngleMarkerProps[];
    regions?: RegionProps[];
    dimLines?: DimLineProps[];
  };
}

export interface GeometryPaddingConfig extends Omit<
  GeometryLayoutConfig,
  "padding"
> {
  basePadding: [number, number, number, number];
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
}

export function getPadding({
  width,
  height,
  basePadding,
  bounds,
  elements: {
    points = [],
    segments = [],
    polygons = [],
    ellipses = [],
    sectors = [],
    arcs = [],
    angleMarkers = [],
    regions = [],
    dimLines = [],
  },
}: GeometryPaddingConfig) {
  const { minX, maxX, minY, maxY } = bounds;

  // 1. 計算最大 Stroke Padding
  const maxPixelOffset = getElementsMaxStroke(
    [
      segments,
      polygons,
      ellipses,
      sectors,
      arcs,
      angleMarkers,
      regions,
      dimLines,
    ],
    points,
    LAYOUT.DEFAULT_STROKE_WIDTH,
  );

  const strokePadding = maxPixelOffset / 2;
  const [pTop, pRight, pBot, pLeft] = basePadding.map((p) => p + strokePadding);

  // 2. 初始比例尺計算
  const mathW = maxX - minX;
  const mathH = maxY - minY;
  const prelimHeight =
    height ?? (width - pLeft - pRight) * (mathH / mathW) + pTop + pBot;
  const prelimDrawW = width - pLeft - pRight;
  const prelimDrawH = prelimHeight - pTop - pBot;
  const prelimScale = Math.min(prelimDrawW / mathW, prelimDrawH / mathH);

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  const prelimScaleX = createLinearScale(
    cx - prelimDrawW / prelimScale / 2,
    cx + prelimDrawW / prelimScale / 2,
    pLeft,
    width - pRight,
  );
  const prelimScaleY = createLinearScale(
    cy - prelimDrawH / prelimScale / 2,
    cy + prelimDrawH / prelimScale / 2,
    prelimHeight - pBot,
    pTop,
  );

  // 3. 標籤溢出預測
  const accumulator = createOverflowAccumulator(
    pTop,
    pRight,
    pBot,
    pLeft,
    width,
    prelimHeight,
  );

  const checkLabelOverflow = (lbl?: LabelConfig) => {
    if (!lbl || !lbl.pos) return;
    const pxX = prelimScaleX(lbl.pos[0]);
    const pxY = prelimScaleY(lbl.pos[1]);
    accumulator.add(getLabelPixelBounds(pxX, pxY, lbl));
  };

  points.forEach((p) => checkLabelOverflow(p.label as LabelConfig));
  segments.forEach((s) => checkLabelOverflow(s.label as LabelConfig));
  polygons.forEach((p) => checkLabelOverflow(p.label as LabelConfig));
  ellipses.forEach((c) => checkLabelOverflow(c.label as LabelConfig));
  arcs.forEach((a) => checkLabelOverflow(a.label as LabelConfig));
  sectors.forEach((s) => checkLabelOverflow(s.label as LabelConfig));
  angleMarkers.forEach((am) => checkLabelOverflow(am.label as LabelConfig));
  dimLines.forEach((dl) => checkLabelOverflow(dl.label as LabelConfig));

  const overflow = accumulator.get();

  return {
    top: pTop + overflow.top,
    right: pRight + overflow.right,
    bottom: pBot + overflow.bottom,
    left: pLeft + overflow.left,
  };
}

export const computeBoundingBox = ({
  points = [],
  segments = [],
  polygons = [],
  ellipses = [],
  sectors = [],
  arcs = [],
  regions = [],
  dimLines = [],
}: GeometryLayoutConfig["elements"]) => {
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;

  const addPoint = (x: number, y: number) => {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  };

  points.forEach((p) => addPoint(p.pos[0], p.pos[1]));
  segments.forEach((s) => {
    addPoint(s.start[0], s.start[1]);
    addPoint(s.end[0], s.end[1]);
  });
  dimLines.forEach((dl) => {
    addPoint(dl.start[0], dl.start[1]);
    addPoint(dl.end[0], dl.end[1]);
  });
  polygons.forEach((p) => p.vertices.forEach((v) => addPoint(v[0], v[1])));
  ellipses.forEach((c) => {
    addPoint(c.center[0] - c.radius, c.center[1] - c.radius);
    addPoint(c.center[0] + c.radius, c.center[1] + c.radius);
  });
  regions.forEach((r) => {
    addPoint(r.start[0], r.start[1]);
    r.paths.forEach((p) => addPoint(p.to[0], p.to[1]));
  });

  // Sector 與 Arc 共用極值計算
  sectors.forEach((s) => {
    const actualRx = s.rx ?? s.radius ?? 0;
    const actualRy = s.ry ?? s.radius ?? actualRx;
    addPoint(s.center[0], s.center[1]); // Sector 需加入圓心
    getArcExtremePoints(
      s.center,
      actualRx,
      actualRy,
      s.startAngle,
      s.endAngle,
    ).forEach((pt) => addPoint(pt[0], pt[1]));
  });

  arcs.forEach((a) => {
    getArcExtremePoints(
      a.center,
      a.radius,
      a.radius,
      a.startAngle,
      a.endAngle,
    ).forEach((pt) => addPoint(pt[0], pt[1]));
  });

  return normalizeBoundingBox(minX, maxX, minY, maxY, {
    minX: 0,
    maxX: 100,
    minY: 0,
    maxY: 100,
  });
};

export function calculateLayout({
  width,
  height,
  padding,
  elements,
}: GeometryLayoutConfig) {
  const bounds = computeBoundingBox(elements);
  const finalPadding = getPadding({
    width,
    height,
    basePadding: normalizePadding(padding),
    bounds,
    elements,
  });

  const { minX, maxX, minY, maxY } = bounds;
  const { top: pTop, right: pRight, bottom: pBot, left: pLeft } = finalPadding;

  const mathW = maxX - minX;
  const mathH = maxY - minY;
  const finalHeight =
    height ?? (width - pLeft - pRight) * (mathH / mathW) + pTop + pBot;
  const drawW = width - pLeft - pRight;
  const drawH = finalHeight - pTop - pBot;

  const finalScale = Math.min(drawW / mathW, drawH / mathH);
  const actualMathW = drawW / finalScale;
  const actualMathH = drawH / finalScale;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  const finalDomainX: Vector2 = [cx - actualMathW / 2, cx + actualMathW / 2];
  const finalDomainY: Vector2 = [cy - actualMathH / 2, cy + actualMathH / 2];

  return {
    finalWidth: width,
    finalHeight,
    scale: finalScale,
    scaleX: createLinearScale(
      finalDomainX[0],
      finalDomainX[1],
      pLeft,
      width - pRight,
    ),
    scaleY: createLinearScale(
      finalDomainY[0],
      finalDomainY[1],
      finalHeight - pBot,
      pTop,
    ),
  };
}
