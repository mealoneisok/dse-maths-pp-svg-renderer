// src/components/geometry/GeometryFrame.tsx

import {
  AngleMarker,
  Point,
  Segment,
  Polygon,
  Circle,
  Arc,
  Region,
  type LabelConfig,
  type PointProps,
  type SegmentProps,
  type ArcProps,
  type PolygonProps,
  type CircleProps,
  type AngleMarkerProps,
  type RegionProps,
} from "../elements";
import { normalizeLabel, normalizePadding } from "../../utils/type";
import { createLinearScale } from "../../utils/scale";
import { measureLatex } from "../../utils/measure";
import { useMemo } from "react";

interface GeometryFrameProps {
  width: number;
  height?: number;
  padding?: number | [number, number, number, number];
  points?: PointProps[];
  segments?: SegmentProps[];
  polygons?: PolygonProps[];
  circles?: CircleProps[];
  arcs?: ArcProps[];
  angleMarkers?: AngleMarkerProps[];
  regions?: RegionProps[];
}

export const computeBoundingBox = (elements: {
  points?: PointProps[];
  segments?: SegmentProps[];
  polygons?: PolygonProps[];
  circles?: CircleProps[];
  arcs?: ArcProps[];
  regions?: RegionProps[];
}) => {
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

  elements.points?.forEach((p) => addPoint(p.pos[0], p.pos[1]));
  elements.segments?.forEach((s) => {
    addPoint(s.start[0], s.start[1]);
    addPoint(s.end[0], s.end[1]);
  });
  elements.polygons?.forEach((p) =>
    p.vertices.forEach((v) => addPoint(v[0], v[1])),
  );

  elements.circles?.forEach((c) => {
    addPoint(c.center[0] - c.radius, c.center[1] - c.radius);
    addPoint(c.center[0] + c.radius, c.center[1] + c.radius);
  });

  elements.arcs?.forEach((a) => {
    let s = a.startAngle;
    let e = a.endAngle;
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

  elements.regions?.forEach((r) => {
    addPoint(r.start[0], r.start[1]);
    r.paths.forEach((p) => addPoint(p.to[0], p.to[1]));
  });

  if (minX === Infinity) {
    minX = 0;
    maxX = 100;
    minY = 0;
    maxY = 100;
  }
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

export const GeometryFrame: React.FC<GeometryFrameProps> = ({
  width,
  height,
  padding = 0,
  points = [],
  segments = [],
  polygons = [],
  circles = [],
  arcs = [],
  angleMarkers = [],
  regions = [],
}) => {
  const layout = useMemo(() => {
    const { minX, maxX, minY, maxY } = computeBoundingBox({
      points,
      segments,
      polygons,
      circles,
      arcs,
      regions,
    });

    // 1. 計算基本的 Stroke 退縮半徑
    let maxPixelOffset = 0;
    segments.forEach(
      (s) => (maxPixelOffset = Math.max(maxPixelOffset, s.strokeWidth || 1.5)),
    );
    polygons.forEach(
      (p) => (maxPixelOffset = Math.max(maxPixelOffset, p.strokeWidth || 1.5)),
    );
    circles.forEach(
      (c) => (maxPixelOffset = Math.max(maxPixelOffset, c.strokeWidth || 1.5)),
    );
    arcs.forEach(
      (a) => (maxPixelOffset = Math.max(maxPixelOffset, a.strokeWidth || 1.5)),
    );
    regions.forEach(
      (r) => (maxPixelOffset = Math.max(maxPixelOffset, r.strokeWidth || 0)),
    );
    angleMarkers.forEach(
      (am) =>
        (maxPixelOffset = Math.max(maxPixelOffset, am.strokeWidth || 1.5)),
    );
    points.forEach((p) => {
      if (p.showMarker)
        maxPixelOffset = Math.max(maxPixelOffset, (p.markerSize || 3) * 2);
    });

    const strokePadding = maxPixelOffset / 2;
    const basePadding = normalizePadding(padding);
    let [pTop, pRight, pBot, pLeft] = basePadding.map(
      (p: number) => p + strokePadding,
    );

    const mathW = maxX - minX;
    const mathH = maxY - minY;
    const finalWidth = width;

    // === 🌟 兩階段佈局推算 (2-Pass Layout) ===

    // Pass 1: 建立初步的 Scale，用來測量 Label 實體像素會落在哪裡
    const prelimHeight =
      height ?? (finalWidth - pLeft - pRight) * (mathH / mathW) + pTop + pBot;
    const prelimDrawW = finalWidth - pLeft - pRight;
    const prelimDrawH = prelimHeight - pTop - pBot;
    const prelimScale = Math.min(prelimDrawW / mathW, prelimDrawH / mathH);

    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const prelimDomainX = [
      cx - prelimDrawW / prelimScale / 2,
      cx + prelimDrawW / prelimScale / 2,
    ];
    const prelimDomainY = [
      cy - prelimDrawH / prelimScale / 2,
      cy + prelimDrawH / prelimScale / 2,
    ];

    const prelimScaleX = createLinearScale(
      prelimDomainX[0],
      prelimDomainX[1],
      pLeft,
      finalWidth - pRight,
    );
    const prelimScaleY = createLinearScale(
      prelimDomainY[0],
      prelimDomainY[1],
      prelimHeight - pBot,
      pTop,
    );

    // Pass 2: 測量 Label 溢出量 (Overflow)
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

      // 如果標籤超出了當前的邊距安全區，記錄額外需要的 Padding
      if (foreignX < pLeft)
        overflowLeft = Math.max(overflowLeft, pLeft - foreignX);
      if (foreignX + boxW > finalWidth - pRight)
        overflowRight = Math.max(
          overflowRight,
          foreignX + boxW - (finalWidth - pRight),
        );
      if (foreignY < pTop) overflowTop = Math.max(overflowTop, pTop - foreignY);
      // 注意：如果沒有指定高度，畫布高度是動態的，底部溢出相對寬裕，但仍需計算
      if (foreignY + boxH > prelimHeight - pBot)
        overflowBot = Math.max(
          overflowBot,
          foreignY + boxH - (prelimHeight - pBot),
        );
    };

    // 將所有可能帶有標籤的錨點丟進去測試
    points.forEach((p) => {
      const lbl = normalizeLabel(p.label);
      checkLabelOverflow(p.pos[0], p.pos[1], lbl);
    });

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

    angleMarkers.forEach((am) => {
      const lbl = normalizeLabel(am.label);
      checkLabelOverflow(am.vertex[0], am.vertex[1], lbl);
    });

    // 將溢出量疊加上去，形成最終真正的 Padding
    pLeft += overflowLeft;
    pRight += overflowRight;
    pTop += overflowTop;
    pBot += overflowBot;

    // === Pass 3: 使用最終 Padding 產生正式的 Scale ===
    const finalHeight =
      height ?? (finalWidth - pLeft - pRight) * (mathH / mathW) + pTop + pBot;
    const drawW = finalWidth - pLeft - pRight;
    const drawH = finalHeight - pTop - pBot;
    const finalScale = Math.min(drawW / mathW, drawH / mathH);

    const actualMathW = drawW / finalScale;
    const actualMathH = drawH / finalScale;

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
  }, [
    width,
    height,
    padding,
    points,
    segments,
    polygons,
    circles,
    arcs,
    regions,
    angleMarkers,
  ]);

  return (
    <svg
      className="bg-white shadow-md transition-all duration-100 ease-out"
      width={layout.finalWidth}
      height={layout.finalHeight}
      xmlns="http://www.w3.org/2000/svg"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* 0. 繪製陰影區域 */}
      {regions
        .filter((r) => r && r.start && r.paths) // 防禦性過濾
        .map((region, idx) => {
          // 座標轉換 (Math -> Pixel)
          const startPx: [number, number] = [
            layout.scaleX(region.start[0]),
            layout.scaleY(region.start[1]),
          ];

          const pathsPx = region.paths
            .filter((p) => p && p.to) // 過濾無效路徑
            .map((p) => ({
              ...p,
              to: [layout.scaleX(p.to[0]), layout.scaleY(p.to[1])] as [
                number,
                number,
              ],
              radius: p.radius
                ? Math.abs(layout.scaleX(p.radius) - layout.scaleX(0))
                : undefined,
            }));

          return (
            <Region
              key={`region-${idx}`}
              start={startPx}
              paths={pathsPx as any}
              fill={region.fill}
              stroke={region.stroke}
              strokeWidth={region.strokeWidth}
            />
          );
        })}

      {/* 1. 渲染多邊形 */}
      {polygons.map((poly, idx) => {
        const labelObj = normalizeLabel(poly.label, {});
        const scaledVertices = poly.vertices.map(
          (v) => [layout.scaleX(v[0]), layout.scaleY(v[1])] as [number, number],
        );

        const center = poly.vertices.reduce(
          (acc, v) => [acc[0] + v[0], acc[1] + v[1]],
          [0, 0],
        );
        const mathX = labelObj?.pos?.[0] ?? center[0] / poly.vertices.length;
        const mathY = labelObj?.pos?.[1] ?? center[1] / poly.vertices.length;
        const scaledLabel = labelObj
          ? {
              ...labelObj,
              pos: [layout.scaleX(mathX), layout.scaleY(mathY)] as [
                number,
                number,
              ],
            }
          : undefined;

        return (
          <Polygon
            key={`poly-${idx}`}
            vertices={scaledVertices}
            fill={poly.fill}
            stroke={poly.stroke}
            strokeWidth={poly.strokeWidth}
            label={scaledLabel}
          />
        );
      })}

      {/* 2. 渲染圓形 */}
      {circles.map((circle, idx) => {
        const labelObj = normalizeLabel(circle.label);
        const cx = layout.scaleX(circle.center[0]);
        const cy = layout.scaleY(circle.center[1]);
        const r = Math.abs(
          layout.scaleX(circle.center[0] + circle.radius) - cx,
        );

        const scaledLabel = labelObj
          ? {
              ...labelObj,
              pos: [
                layout.scaleX(labelObj.pos?.[0] ?? circle.center[0]),
                layout.scaleY(labelObj.pos?.[1] ?? circle.center[1]),
              ] as [number, number],
            }
          : undefined;

        return (
          <Circle
            key={`circle-${idx}`}
            center={[cx, cy]}
            radius={r}
            fill={circle.fill}
            stroke={circle.stroke}
            strokeWidth={circle.strokeWidth}
            dash={circle.dash}
            label={scaledLabel}
          />
        );
      })}

      {/* 3. 渲染圓弧 */}
      {arcs.map((arc, idx) => {
        const labelObj = normalizeLabel(arc.label);
        const rx = Math.abs(
          layout.scaleX(arc.center[0] + arc.radius) -
            layout.scaleX(arc.center[0]),
        );
        const ry = Math.abs(
          layout.scaleY(arc.center[1] + arc.radius) -
            layout.scaleY(arc.center[1]),
        );
        const sx = layout.scaleX(
          arc.center[0] + arc.radius * Math.cos(arc.startAngle),
        );
        const sy = layout.scaleY(
          arc.center[1] + arc.radius * Math.sin(arc.startAngle),
        );
        const ex = layout.scaleX(
          arc.center[0] + arc.radius * Math.cos(arc.endAngle),
        );
        const ey = layout.scaleY(
          arc.center[1] + arc.radius * Math.sin(arc.endAngle),
        );

        let diff = arc.endAngle - arc.startAngle;
        while (diff < 0) diff += 2 * Math.PI;
        const largeArc = diff > Math.PI ? 1 : 0;

        const scaledLabel = labelObj
          ? {
              ...labelObj,
              pos: [
                layout.scaleX(labelObj.pos?.[0] ?? arc.center[0]),
                layout.scaleY(labelObj.pos?.[1] ?? arc.center[1]),
              ] as [number, number],
            }
          : undefined;

        return (
          <Arc
            key={`arc-${idx}`}
            center={[
              layout.scaleX(arc.center[0]),
              layout.scaleY(arc.center[1]),
            ]}
            radius={rx} // 傳遞 Dummy 以符合介面要求，真正的繪圖使用 _svgParams
            startAngle={arc.startAngle}
            endAngle={arc.endAngle}
            _svgParams={{ sx, sy, ex, ey, rx, ry, largeArc, sweep: 0 }}
            fill={arc.fill}
            stroke={arc.stroke}
            strokeWidth={arc.strokeWidth}
            dash={arc.dash}
            label={scaledLabel}
          />
        );
      })}

      {/* 4. 渲染線段 */}
      {segments.map((seg, idx) => {
        const labelObj = normalizeLabel(seg.label);
        const mathX = labelObj?.pos?.[0] ?? (seg.start[0] + seg.end[0]) / 2;
        const mathY = labelObj?.pos?.[1] ?? (seg.start[1] + seg.end[1]) / 2;
        const scaledLabel = labelObj
          ? {
              ...labelObj,
              pos: [layout.scaleX(mathX), layout.scaleY(mathY)] as [
                number,
                number,
              ],
            }
          : undefined;

        return (
          <Segment
            key={`seg-${idx}`}
            start={[layout.scaleX(seg.start[0]), layout.scaleY(seg.start[1])]}
            end={[layout.scaleX(seg.end[0]), layout.scaleY(seg.end[1])]}
            strokeWidth={seg.strokeWidth}
            color={seg.color}
            dash={seg.dash}
            label={scaledLabel}
          />
        );
      })}

      {/* 5. 渲染角度標記 (未變動) */}
      {angleMarkers.map((am, idx) => (
        <AngleMarker
          key={`am-${idx}`}
          vertex={[layout.scaleX(am.vertex[0]), layout.scaleY(am.vertex[1])]}
          p1={[layout.scaleX(am.p1[0]), layout.scaleY(am.p1[1])]}
          p2={[layout.scaleX(am.p2[0]), layout.scaleY(am.p2[1])]}
          size={am.size}
          color={am.color}
          strokeWidth={am.strokeWidth}
          isRightAngle={am.isRightAngle}
          label={am.label as any}
        />
      ))}

      {/* 6. 渲染點與標籤 */}
      {points.map((pt, idx) => {
        const labelObj = normalizeLabel(pt.label);
        const pxX = layout.scaleX(pt.pos[0]);
        const pxY = layout.scaleY(pt.pos[1]);
        const scaledLabel = labelObj
          ? {
              ...labelObj,
              pos: [pxX, pxY] as [number, number],
            }
          : undefined;

        return (
          <Point
            key={`pt-${idx}`}
            pos={[pxX, pxY]}
            type={pt.type}
            markerSize={pt.markerSize}
            showMarker={pt.showMarker}
            markerColor={pt.markerColor}
            strokeWidth={pt.strokeWidth}
            label={scaledLabel}
          />
        );
      })}
    </svg>
  );
};
