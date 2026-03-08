// src/utils/layout/geometryFrame.ts

import { createLinearScale } from "../scale";
import {
  type PointProps,
  type SegmentProps,
  type PolygonProps,
  type CircleProps,
  type ArcProps,
  type AngleMarkerProps,
  type RegionProps,
  type LabelConfig,
} from "../../components/elements";
import { normalizeLabel, normalizePadding } from "../type";
import { measureLatex } from "../measure";

export interface GeometryLayoutConfig {
  width: number;
  height?: number;
  padding: number | [number, number, number, number];
  elements: {
    points?: PointProps[];
    segments?: SegmentProps[];
    polygons?: PolygonProps[];
    circles?: CircleProps[];
    arcs?: ArcProps[];
    angleMarkers?: AngleMarkerProps[];
    regions?: RegionProps[];
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
    circles = [],
    arcs = [],
    angleMarkers = [],
    regions = [],
  },
}: GeometryPaddingConfig) {
  const { minX, maxX, minY, maxY } = bounds;

  const getMaxStroke = (items: any[], fallback: number) =>
    items.reduce((max, item) => Math.max(max, item.strokeWidth ?? fallback), 0);

  const maxPixelOffset = Math.max(
    getMaxStroke(segments, 1.5),
    getMaxStroke(polygons, 1.5),
    getMaxStroke(circles, 1.5),
    getMaxStroke(arcs, 1.5),
    getMaxStroke(angleMarkers, 1.5),
    getMaxStroke(regions, 0),
    points.reduce(
      (max, p) => Math.max(max, p.showMarker ? (p.markerSize ?? 3) * 2 : 0),
      0,
    ),
  );

  const strokePadding = maxPixelOffset / 2;
  const [pTop, pRight, pBot, pLeft] = basePadding.map((p) => p + strokePadding);

  const mathW = maxX - minX;
  const mathH = maxY - minY;
  const finalWidth = width;

  const prelimHeight =
    height ?? (finalWidth - pLeft - pRight) * (mathH / mathW) + pTop + pBot;
  const prelimDrawW = finalWidth - pLeft - pRight;
  const prelimDrawH = prelimHeight - pTop - pBot;
  const prelimScale = Math.min(prelimDrawW / mathW, prelimDrawH / mathH);

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  const prelimScaleX = createLinearScale(
    cx - prelimDrawW / prelimScale / 2,
    cx + prelimDrawW / prelimScale / 2,
    pLeft,
    finalWidth - pRight,
  );
  const prelimScaleY = createLinearScale(
    cy - prelimDrawH / prelimScale / 2,
    cy + prelimDrawH / prelimScale / 2,
    prelimHeight - pBot,
    pTop,
  );

  let overflowTop = 0,
    overflowRight = 0,
    overflowBot = 0,
    overflowLeft = 0;

  const checkLabelOverflow = (
    mathX: number,
    mathY: number,
    rawLabel?: LabelConfig | string | null,
  ) => {
    const labelObj = normalizeLabel(rawLabel);
    if (!labelObj || (!labelObj.text && labelObj.text !== 0)) return;

    const pxX = prelimScaleX(mathX);
    const pxY = prelimScaleY(mathY);
    const { width: boxW, height: boxH } = measureLatex(
      labelObj.text,
      labelObj.fontSize || 14,
    );

    const offset = labelObj.offset ?? 8;
    const align = labelObj.align || "center";

    let foreignX = pxX,
      foreignY = pxY;

    if (align.includes("top")) foreignY = pxY - offset - boxH;
    else if (align.includes("bottom")) foreignY = pxY + offset;
    else foreignY = pxY - boxH / 2;

    if (align.includes("left")) foreignX = pxX - offset - boxW;
    else if (align.includes("right")) foreignX = pxX + offset;
    else foreignX = pxX - boxW / 2;

    if (foreignX < pLeft)
      overflowLeft = Math.max(overflowLeft, pLeft - foreignX);
    if (foreignX + boxW > finalWidth - pRight)
      overflowRight = Math.max(
        overflowRight,
        foreignX + boxW - (finalWidth - pRight),
      );
    if (foreignY < pTop) overflowTop = Math.max(overflowTop, pTop - foreignY);
    if (foreignY + boxH > prelimHeight - pBot)
      overflowBot = Math.max(
        overflowBot,
        foreignY + boxH - (prelimHeight - pBot),
      );
  };

  points.forEach((p) => checkLabelOverflow(p.pos[0], p.pos[1], p.label));
  segments.forEach((s) => {
    const lbl = normalizeLabel(s.label);
    checkLabelOverflow(
      lbl?.pos?.[0] ?? (s.start[0] + s.end[0]) / 2,
      lbl?.pos?.[1] ?? (s.start[1] + s.end[1]) / 2,
      lbl,
    );
  });
  polygons.forEach((p) => {
    const lbl = normalizeLabel(p.label);
    if (!lbl) return;
    const center = p.vertices.reduce(
      (acc, v) => [acc[0] + v[0], acc[1] + v[1]],
      [0, 0],
    );
    checkLabelOverflow(
      lbl.pos?.[0] ?? center[0] / p.vertices.length,
      lbl.pos?.[1] ?? center[1] / p.vertices.length,
      lbl,
    );
  });
  circles.forEach((c) => {
    const lbl = normalizeLabel(c.label);
    checkLabelOverflow(
      lbl?.pos?.[0] ?? c.center[0],
      lbl?.pos?.[1] ?? c.center[1],
      lbl,
    );
  });
  arcs.forEach((a) => {
    const lbl = normalizeLabel(a.label);
    checkLabelOverflow(
      lbl?.pos?.[0] ?? a.center[0],
      lbl?.pos?.[1] ?? a.center[1],
      lbl,
    );
  });
  angleMarkers.forEach((am) =>
    checkLabelOverflow(am.vertex[0], am.vertex[1], am.label),
  );

  return {
    top: pTop + overflowTop,
    right: pRight + overflowRight,
    bottom: pBot + overflowBot,
    left: pLeft + overflowLeft,
  };
}

export const computeBoundingBox = ({
  points = [],
  segments = [],
  polygons = [],
  circles = [],
  arcs = [],
  regions = [],
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
  polygons.forEach((p) => p.vertices.forEach((v) => addPoint(v[0], v[1])));
  circles.forEach((c) => {
    addPoint(c.center[0] - c.radius, c.center[1] - c.radius);
    addPoint(c.center[0] + c.radius, c.center[1] + c.radius);
  });
  regions.forEach((r) => {
    addPoint(r.start[0], r.start[1]);
    r.paths.forEach((p) => addPoint(p.to[0], p.to[1]));
  });

  arcs.forEach((a) => {
    let s = a.startAngle,
      e = a.endAngle;
    while (e < s) e += 2 * Math.PI;

    addPoint(
      a.center[0] + a.radius * Math.cos(s),
      a.center[1] + a.radius * Math.sin(s),
    );
    addPoint(
      a.center[0] + a.radius * Math.cos(e),
      a.center[1] + a.radius * Math.sin(e),
    );

    for (let i = 0; i < 4; i++) {
      let ext = (i * Math.PI) / 2;
      while (ext < s) ext += 2 * Math.PI;
      if (ext <= e) {
        addPoint(
          a.center[0] + a.radius * Math.cos(ext),
          a.center[1] + a.radius * Math.sin(ext),
        );
      }
    }
  });

  // Default fallback 提早 return
  if (minX === Infinity) return { minX: 0, maxX: 100, minY: 0, maxY: 100 };

  if (maxX === minX) {
    minX -= 1;
    maxX += 1;
  }
  if (maxY === minY) {
    minY -= 1;
    maxY += 1;
  }

  return { minX, maxX, minY, maxY };
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
  const finalWidth = width;

  const finalHeight =
    height ?? (finalWidth - pLeft - pRight) * (mathH / mathW) + pTop + pBot;
  const drawW = finalWidth - pLeft - pRight;
  const drawH = finalHeight - pTop - pBot;
  const finalScale = Math.min(drawW / mathW, drawH / mathH);

  const actualMathW = drawW / finalScale;
  const actualMathH = drawH / finalScale;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  const finalDomainX: [number, number] = [
    cx - actualMathW / 2,
    cx + actualMathW / 2,
  ];
  const finalDomainY: [number, number] = [
    cy - actualMathH / 2,
    cy + actualMathH / 2,
  ];

  return {
    finalWidth,
    finalHeight,
    scaleX: createLinearScale(
      finalDomainX[0],
      finalDomainX[1],
      pLeft,
      finalWidth - pRight,
    ),
    scaleY: createLinearScale(
      finalDomainY[0],
      finalDomainY[1],
      finalHeight - pBot,
      pTop,
    ),
  };
}
