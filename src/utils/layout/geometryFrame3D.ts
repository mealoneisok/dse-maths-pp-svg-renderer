// src/utils/layout/geometryFrame3D.ts

import { measureLatex } from "../measure";
import { normalizePadding } from "../type";
import type {
  SolidDef,
  Point3DProps,
  Segment3DProps,
  RegionProps,
  DimLineProps,
  PolygonProps,
  RegionPathProps,
  LabelConfig,
} from "../../components/elements";
import type {
  AngleMarker3DProps,
  Vector2,
  Vector3,
} from "../../components/elements";

export interface Geometry3DLayoutConfig {
  width: number;
  height?: number;
  padding: number | [number, number, number, number];
  elements: {
    points?: Point3DProps[];
    segments?: Segment3DProps[];
    solids?: SolidDef[];
    angleMarkers?: Omit<AngleMarker3DProps, "project">[];
    polygons?: PolygonProps[];
    regions?: RegionProps[];
    dimLines?: DimLineProps[];
  };
}

// 核心：斜視投影參數 (需與 Frame 內保持一致)
const PROJ_ANGLE = Math.PI / 6;
const PROJ_DEPTH_SCALE = 0.6;

// 第一階段：無縮放、無原點偏移的純數學 2D 投影
export const projectMath = (pt: Vector3): Vector2 => {
  const [x, y, z] = pt;
  return [
    x + y * PROJ_DEPTH_SCALE * Math.cos(PROJ_ANGLE),
    -z - y * PROJ_DEPTH_SCALE * Math.sin(PROJ_ANGLE), // SVG 的 Y 軸向下
  ];
};

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

  const addPoint3D = (pt3d: Vector3) => addMathPoint(projectMath(pt3d));

  // 1. Points & Segments
  elements.points?.forEach((p) => addPoint3D(p.pos));
  elements.segments?.forEach((s) => {
    addPoint3D(s.start);
    addPoint3D(s.end);
  });
  elements.angleMarkers?.forEach((am) => {
    addPoint3D(am.vertex);
    addPoint3D(am.p1);
    addPoint3D(am.p2);
  });

  // 🌟 1.5 處理新的 2D 圖形轉換
  elements.polygons?.forEach((p) =>
    p.vertices.forEach((v) => addPoint3D(v as Vector3)),
  );
  elements.dimLines?.forEach((dl) => {
    addPoint3D(dl.start as Vector3);
    addPoint3D(dl.end as Vector3);
  });
  elements.regions?.forEach((r) => {
    addPoint3D(r.start as Vector3);
    r.paths.forEach((p: RegionPathProps) => {
      if (p.to) addPoint3D(p.to as Vector3);
    });
  });

  // 2. Solids
  elements.solids?.forEach((solid) => {
    switch (solid.type) {
      case "polyhedron":
        solid.vertices.forEach(addPoint3D);
        break;
      case "lofted":
        solid.baseVertices.forEach(([x, y]) => {
          addPoint3D([x, y, 0]); // 底面
          addPoint3D([
            x * (solid.topScale ?? 1) + (solid.shift?.[0] ?? 0),
            y * (solid.topScale ?? 1) + (solid.shift?.[1] ?? 0),
            solid.height,
          ]); // 頂面
        });
        break;
      case "sphere": {
        const center2D = projectMath(solid.center);
        // 球體的 2D 輪廓永遠是正圓，因此 Y 軸無需壓縮
        addMathPoint([center2D[0] - solid.radius, center2D[1] - solid.radius]);
        addMathPoint([center2D[0] + solid.radius, center2D[1] + solid.radius]);
        break;
      }
      case "hemisphere": {
        const center2D = projectMath(solid.centerBase);
        // 半球的上方是完美圓弧 (未壓縮)，下方是橢圓底面 (壓縮 0.3)
        addMathPoint([center2D[0] - solid.radius, center2D[1] - solid.radius]);
        addMathPoint([
          center2D[0] + solid.radius,
          center2D[1] + solid.radius * 0.3,
        ]);
        break;
      }
      case "coneFrustum": {
        const bottom2D = projectMath(solid.centerBase);
        // 🌟 修正點：底面橢圓的 Y 軸極值需乘上 0.3 透視常數
        addMathPoint([
          bottom2D[0] - solid.radiusBottom,
          bottom2D[1] - solid.radiusBottom * 0.3,
        ]);
        addMathPoint([
          bottom2D[0] + solid.radiusBottom,
          bottom2D[1] + solid.radiusBottom * 0.3,
        ]);

        const top3D: Vector3 = [
          solid.centerBase[0],
          solid.centerBase[1],
          solid.centerBase[2] + solid.height,
        ];
        const top2D = projectMath(top3D);
        // 🌟 修正點：頂面橢圓的 Y 軸極值需乘上 0.3 透視常數
        addMathPoint([
          top2D[0] - solid.radiusTop,
          top2D[1] - solid.radiusTop * 0.3,
        ]);
        addMathPoint([
          top2D[0] + solid.radiusTop,
          top2D[1] + solid.radiusTop * 0.3,
        ]);
        break;
      }
    }
  });

  // Default fallback
  if (minX === Infinity) return { minX: -10, maxX: 10, minY: -10, maxY: 10 };

  // 避免單點造成的無效 BBox
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

export function calculateLayout3D({
  width,
  height,
  padding,
  elements,
}: Geometry3DLayoutConfig) {
  const bounds = computeBoundingBox3D(elements);
  const basePadding = normalizePadding(padding);

  // 初步 BBox 計算 (Math 空間)
  const mathW = bounds.maxX - bounds.minX;
  const mathH = bounds.maxY - bounds.minY;
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;

  // 加入基礎 Padding 後的繪製區
  const prelimHeight =
    height ??
    (width - basePadding[1] - basePadding[3]) * (mathH / mathW) +
      basePadding[0] +
      basePadding[2];
  const drawW = width - basePadding[1] - basePadding[3];
  const drawH = prelimHeight - basePadding[0] - basePadding[2];

  // 🌟 3D 最關鍵：必須取 Uniform Scale (X, Y 共用同一個縮放比例)
  const scale = Math.min(drawW / mathW, drawH / mathH);

  // --- 標籤溢出預測 (Label Overflow Check) ---
  let overflowTop = 0,
    overflowRight = 0,
    overflowBot = 0,
    overflowLeft = 0;

  const checkLabel = (pt3d: Vector3, lbl?: LabelConfig) => {
    // lbl 已經在元件層被 normalize，如果有值就一定包含預設的 offset 與 align
    if (!lbl || (!lbl.text && lbl.text !== 0)) return;

    const pt2D = projectMath(pt3d);
    const pxX = basePadding[3] + drawW / 2 + (pt2D[0] - cx) * scale;
    const pxY = basePadding[0] + drawH / 2 + (pt2D[1] - cy) * scale;

    const { width: boxW, height: boxH } = measureLatex(lbl.text);

    // 🌟 不用再寫 fallback 了，直接拿！
    const offset = lbl.offset;
    const align = lbl.align;

    let foreignX = pxX;
    let foreignY = pxY;

    if (align && offset && align.includes("top"))
      foreignY = pxY - offset - boxH;
    else if (align && offset && align.includes("bottom"))
      foreignY = pxY + offset;
    else foreignY = pxY - boxH / 2;

    if (align && offset && align.includes("left"))
      foreignX = pxX - offset - boxW;
    else if (align && offset && align.includes("right"))
      foreignX = pxX + offset;
    else foreignX = pxX - boxW / 2;

    const leftExt = foreignX;
    const rightExt = foreignX + boxW;
    const topExt = foreignY;
    const botExt = foreignY + boxH;

    if (leftExt < basePadding[3])
      overflowLeft = Math.max(overflowLeft, basePadding[3] - leftExt);
    if (rightExt > width - basePadding[1])
      overflowRight = Math.max(
        overflowRight,
        rightExt - (width - basePadding[1]),
      );
    if (topExt < basePadding[0])
      overflowTop = Math.max(overflowTop, basePadding[0] - topExt);
    if (botExt > prelimHeight - basePadding[2])
      overflowBot = Math.max(
        overflowBot,
        botExt - (prelimHeight - basePadding[2]),
      );
  };

  elements.points?.forEach((p) => checkLabel(p.pos, p.label as LabelConfig));
  elements.angleMarkers?.forEach((am) =>
    checkLabel(am.vertex, am.label as LabelConfig),
  );

  // 計算最終的畫布與 Origin
  // 1. 取得真正的可用寬度 (扣除原本 padding 與 label overflow)
  const finalDrawW =
    width - (basePadding[1] + overflowRight) - (basePadding[3] + overflowLeft);

  // 2. 若未指定 height，則根據最終可用寬度動態推算所需高度 (這行是修正空白的關鍵！)
  const finalHeight =
    height ??
    finalDrawW * (mathH / mathW) +
      (basePadding[0] + overflowTop) +
      (basePadding[2] + overflowBot);

  // 3. 取得真正的可用高度
  const finalDrawH =
    finalHeight -
    (basePadding[0] + overflowTop) -
    (basePadding[2] + overflowBot);

  // 最終的精準縮放
  const finalScale = Math.min(finalDrawW / mathW, finalDrawH / mathH);

  // 讓數學中心對齊繪製區的中心
  const centerX_px = basePadding[3] + overflowLeft + finalDrawW / 2;
  const centerY_px = basePadding[0] + overflowTop + finalDrawH / 2;

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
