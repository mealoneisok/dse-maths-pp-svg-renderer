// src/utils/layout/geometryFrame3D.ts

import { normalizePadding } from "../type";
import type {
  SolidDef,
  PointProps,
  SegmentProps,
  RegionProps,
  DimLineProps,
  PolygonProps,
  RegionPathProps,
  LabelConfig,
} from "../../components/elements";
import type { AngleMarkerProps, Vector3 } from "../../components/elements";
import { projectMath } from "../math";
import { LAYOUT, PROJ_ELLIPSE_RATIO } from "@/constants";
import {
  getLabelPixelBounds,
  normalizeBoundingBox,
  createOverflowAccumulator,
  getElementsMaxStroke,
} from "./geometryUtils";

const ensureVector3 = (v: any): Vector3 => {
  if (v.length === 3) return v as Vector3;
  return [v[0], v[1], 0] as Vector3; // 2D 點自動補 Z=0
};

interface Geometry3DLayoutConfig {
  width: number;
  height?: number;
  padding: number | [number, number, number, number];
  elements: {
    points?: PointProps[];
    segments?: SegmentProps[];
    solids?: SolidDef[];
    angleMarkers?: Omit<AngleMarkerProps, "project">[];
    polygons?: PolygonProps[];
    regions?: RegionProps[];
    dimLines?: DimLineProps[];
  };
}

export const computeBoundingBox3D = (
  elements: Geometry3DLayoutConfig["elements"],
) => {
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;

  const addMathPoint = (pt2d: [number, number]) => {
    if (pt2d[0] < minX) minX = pt2d[0];
    if (pt2d[0] > maxX) maxX = pt2d[0];
    if (pt2d[1] < minY) minY = pt2d[1];
    if (pt2d[1] > maxY) maxY = pt2d[1];
  };

  const addPoint3D = (pt: any) => addMathPoint(projectMath(ensureVector3(pt)));

  // 1. 基礎元素
  elements.points?.forEach((p: any) => addPoint3D(p.pos));
  elements.segments?.forEach((s: any) => {
    addPoint3D(s.start);
    addPoint3D(s.end);
  });
  elements.angleMarkers?.forEach((am) => {
    addPoint3D(am.vertex);
    addPoint3D(am.p1);
    addPoint3D(am.p2);
  });

  // 2. 2D-in-3D 元素
  elements.polygons?.forEach((p) => p.vertices.forEach((v) => addPoint3D(v)));
  elements.dimLines?.forEach((dl) => {
    addPoint3D(dl.start);
    addPoint3D(dl.end);
  });
  elements.regions?.forEach((r) => {
    addPoint3D(r.start);
    r.paths.forEach((p: RegionPathProps) => {
      if (p.to) addPoint3D(p.to);
    });
  });

  // 3. 固體實體
  elements.solids?.forEach((solid) => {
    switch (solid.type) {
      case "polyhedron":
        solid.vertices.forEach(addPoint3D);
        break;
      case "lofted":
        solid.baseVertices.forEach(([x, y]) => {
          addPoint3D([x, y, 0]);
          addPoint3D([
            x * (solid.topScale ?? 1) + (solid.shift?.[0] ?? 0),
            y * (solid.topScale ?? 1) + (solid.shift?.[1] ?? 0),
            solid.height,
          ]);
        });
        break;
      case "sphere": {
        const center2D = projectMath(solid.center);
        addMathPoint([center2D[0] - solid.radius, center2D[1] - solid.radius]);
        addMathPoint([center2D[0] + solid.radius, center2D[1] + solid.radius]);
        break;
      }
      case "hemisphere": {
        const center2D = projectMath(solid.centerBase);
        addMathPoint([center2D[0] - solid.radius, center2D[1] - solid.radius]);
        addMathPoint([
          center2D[0] + solid.radius,
          center2D[1] + solid.radius * PROJ_ELLIPSE_RATIO,
        ]);
        break;
      }
      case "coneFrustum": {
        const bottom2D = projectMath(solid.centerBase);
        addMathPoint([
          bottom2D[0] - solid.radiusBottom,
          bottom2D[1] - solid.radiusBottom * PROJ_ELLIPSE_RATIO,
        ]);
        addMathPoint([
          bottom2D[0] + solid.radiusBottom,
          bottom2D[1] + solid.radiusBottom * PROJ_ELLIPSE_RATIO,
        ]);
        const top2D = projectMath([
          solid.centerBase[0],
          solid.centerBase[1],
          solid.centerBase[2] + solid.height,
        ]);
        addMathPoint([
          top2D[0] - solid.radiusTop,
          top2D[1] - solid.radiusTop * PROJ_ELLIPSE_RATIO,
        ]);
        addMathPoint([
          top2D[0] + solid.radiusTop,
          top2D[1] + solid.radiusTop * PROJ_ELLIPSE_RATIO,
        ]);
        break;
      }
    }
  });

  return normalizeBoundingBox(minX, maxX, minY, maxY, {
    minX: -10,
    maxX: 10,
    minY: -10,
    maxY: 10,
  });
};

export function calculateLayout3D({
  width,
  height,
  padding,
  elements,
}: Geometry3DLayoutConfig) {
  const bounds = computeBoundingBox3D(elements);
  const basePadding = normalizePadding(padding);

  // --- 計算 Pixel-Perfect 退讓半徑 ---
  const maxPixelOffset = getElementsMaxStroke(
    [
      elements.segments,
      elements.polygons,
      elements.dimLines,
      elements.solids,
      elements.angleMarkers,
      elements.regions,
    ],
    elements.points,
    LAYOUT.DEFAULT_STROKE_WIDTH,
  );

  const strokePadding = maxPixelOffset / 2;
  const [pTop, pRight, pBot, pLeft] = basePadding.map((p) => p + strokePadding);

  const mathW = bounds.maxX - bounds.minX;
  const mathH = bounds.maxY - bounds.minY;
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;

  const prelimHeight =
    height ?? (width - pLeft - pRight) * (mathH / mathW) + pTop + pBot;
  const drawW = width - pLeft - pRight;
  const drawH = prelimHeight - pTop - pBot;
  const scale = Math.min(drawW / mathW, drawH / mathH);

  // --- 標籤溢出預測 ---
  const accumulator = createOverflowAccumulator(
    pTop,
    pRight,
    pBot,
    pLeft,
    width,
    prelimHeight,
  );

  const checkLabelOverflow = (pt3d: Vector3, lbl?: LabelConfig) => {
    const pt2D = projectMath(pt3d);
    const pxX = pLeft + drawW / 2 + (pt2D[0] - cx) * scale;
    const pxY = pTop + drawH / 2 + (pt2D[1] - cy) * scale;
    accumulator.add(getLabelPixelBounds(pxX, pxY, lbl));
  };

  elements.points?.forEach((p) =>
    checkLabelOverflow(p.pos as unknown as Vector3, p.label as LabelConfig),
  );
  elements.segments?.forEach((s) => {
    const mid3D: Vector3 = [
      (s.start[0] + s.end[0]) / 2,
      (s.start[1] + s.end[1]) / 2,
      ((s.start[2] ?? 0) + (s.end[2] ?? 0)) / 2,
    ];
    checkLabelOverflow(mid3D, s.label as LabelConfig);
  });
  elements.dimLines?.forEach((dl) => {
    const mid3D: Vector3 = [
      (dl.start[0] + dl.end[0]) / 2,
      (dl.start[1] + dl.end[1]) / 2,
      ((dl.start[2] ?? 0) + (dl.end[2] ?? 0)) / 2,
    ];
    checkLabelOverflow(mid3D, dl.label as LabelConfig);
  });
  elements.angleMarkers?.forEach((am) =>
    checkLabelOverflow(am.vertex as Vector3, am.label as LabelConfig),
  );
  elements.polygons?.forEach((p) => {
    const sum = p.vertices.reduce(
      (acc, v) => [acc[0] + v[0], acc[1] + v[1], (acc[2] ?? 0) + (v[2] ?? 0)],
      [0, 0, 0],
    );
    const center = [
      sum[0] / p.vertices.length,
      sum[1] / p.vertices.length,
      sum[2] ? sum[2] / p.vertices.length : 0,
    ] as Vector3;
    checkLabelOverflow(center, p.label as LabelConfig);
  });

  const overflow = accumulator.get();

  const finalDrawW =
    width - (pRight + overflow.right) - (pLeft + overflow.left);
  const finalHeight =
    height ??
    finalDrawW * (mathH / mathW) +
      (pTop + overflow.top) +
      (pBot + overflow.bottom);
  const finalDrawH =
    finalHeight - (pTop + overflow.top) - (pBot + overflow.bottom);
  const finalScale = Math.min(finalDrawW / mathW, finalDrawH / mathH);

  const centerX_px = pLeft + overflow.left + finalDrawW / 2;
  const centerY_px = pTop + overflow.top + finalDrawH / 2;

  return {
    finalWidth: width,
    finalHeight,
    scale: finalScale,
    origin: [centerX_px - cx * finalScale, centerY_px - cy * finalScale] as [
      number,
      number,
    ],
  };
}
