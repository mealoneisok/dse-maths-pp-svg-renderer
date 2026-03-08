// src/components/geometry/GeometryFrame.tsx

import React, { useMemo } from "react";
import { createLinearScale } from "../../utils/scale";
import { Label } from "../elements/Label";
import { AngleMarker } from "../elements/AngleMarker";
import { measureLatex } from "../../utils/measure";

export interface GeoLabel {
  text: string | number;
  align?: string;
  offset?: number;
  color?: string;
  fontSize?: string | number;
  pos?: [number, number];
  rotation?: number;
}

export interface GeoPoint {
  pos: [number, number];
  showMarker?: boolean;
  markerSize?: number;
  markerColor?: string;
  label?: GeoLabel;
}

export interface GeoSegment {
  start: [number, number];
  end: [number, number];
  color?: string;
  strokeWidth?: number;
  dash?: string;
  label?: GeoLabel;
}

export interface GeoPolygon {
  vertices: [number, number][];
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  label?: GeoLabel;
}

export interface GeoCircle {
  center: [number, number];
  radius: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  dash?: string;
  label?: GeoLabel;
}

export interface GeoArc {
  center: [number, number];
  radius: number;
  startAngle: number;
  endAngle: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  dash?: string;
  label?: GeoLabel;
}

export interface GeoAngleMarker {
  vertex: [number, number];
  p1: [number, number];
  p2: [number, number];
  size?: number;
  color?: string;
  strokeWidth?: number;
  isRightAngle?: boolean;
  label?: GeoLabel;
}

export interface GeoRegionPath {
  type: "line" | "arc";
  to: [number, number];
  radius?: number;
  largeArc?: 0 | 1;
  sweepFlag?: 0 | 1;
}

export interface GeoRegion {
  start: [number, number];
  paths: GeoRegionPath[];
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

interface GeometryFrameProps {
  width: number;
  height?: number;
  padding?: number | [number, number, number, number];
  points?: GeoPoint[];
  segments?: GeoSegment[];
  polygons?: GeoPolygon[];
  circles?: GeoCircle[];
  arcs?: GeoArc[];
  angleMarkers?: GeoAngleMarker[];
  regions?: GeoRegion[];
  svgDefs?: React.ReactNode;
}

export const computeBoundingBox = (elements: {
  points?: GeoPoint[];
  segments?: GeoSegment[];
  polygons?: GeoPolygon[];
  circles?: GeoCircle[];
  arcs?: GeoArc[];
  regions?: GeoRegion[];
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
  svgDefs,
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
    const basePadding = Array.isArray(padding)
      ? padding
      : [padding, padding, padding, padding];
    let [pTop, pRight, pBot, pLeft] = basePadding.map((p) => p + strokePadding);

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
      labelObj?: GeoLabel,
    ) => {
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
    points.forEach((p) => checkLabelOverflow(p.pos[0], p.pos[1], p.label));
    segments.forEach((s) =>
      checkLabelOverflow(
        s.label?.pos?.[0] ?? (s.start[0] + s.end[0]) / 2,
        s.label?.pos?.[1] ?? (s.start[1] + s.end[1]) / 2,
        s.label,
      ),
    );
    polygons.forEach((p) => {
      if (!p.label) return;
      const center = p.vertices.reduce(
        (acc, v) => [acc[0] + v[0], acc[1] + v[1]],
        [0, 0],
      );
      checkLabelOverflow(
        p.label.pos?.[0] ?? center[0] / p.vertices.length,
        p.label.pos?.[1] ?? center[1] / p.vertices.length,
        p.label,
      );
    });
    circles.forEach((c) =>
      checkLabelOverflow(
        c.label?.pos?.[0] ?? c.center[0],
        c.label?.pos?.[1] ?? c.center[1],
        c.label,
      ),
    );
    arcs.forEach((a) =>
      checkLabelOverflow(
        a.label?.pos?.[0] ?? a.center[0],
        a.label?.pos?.[1] ?? a.center[1],
        a.label,
      ),
    );
    angleMarkers.forEach((am) =>
      checkLabelOverflow(am.vertex[0], am.vertex[1], am.label),
    );

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
      <defs>{svgDefs}</defs>

      {/* 0. 繪製陰影區域 */}
      {regions.map((region, idx) => {
        let d = `M ${layout.scaleX(region.start[0])} ${layout.scaleY(region.start[1])}`;
        region.paths.forEach((p) => {
          if (p.type === "line") {
            d += ` L ${layout.scaleX(p.to[0])} ${layout.scaleY(p.to[1])}`;
          } else if (p.type === "arc") {
            const r = Math.abs(layout.scaleX(p.radius || 0) - layout.scaleX(0));
            d += ` A ${r} ${r} 0 ${p.largeArc || 0} ${p.sweepFlag || 0} ${layout.scaleX(
              p.to[0],
            )} ${layout.scaleY(p.to[1])}`;
          }
        });
        d += " Z";

        return (
          <path
            key={`region-${idx}`}
            d={d}
            fill={region.fill || "none"}
            stroke={region.stroke || "none"}
            strokeWidth={region.strokeWidth || 0}
          />
        );
      })}

      {/* 1. 渲染多邊形 + 標籤 */}
      {polygons.map((poly, idx) => {
        const center = poly.vertices.reduce(
          (acc, v) => [acc[0] + v[0], acc[1] + v[1]],
          [0, 0],
        );
        const mathX = poly.label?.pos?.[0] ?? center[0] / poly.vertices.length;
        const mathY = poly.label?.pos?.[1] ?? center[1] / poly.vertices.length;

        return (
          <g key={`poly-${idx}`}>
            <polygon
              points={poly.vertices
                .map((p) => `${layout.scaleX(p[0])},${layout.scaleY(p[1])}`)
                .join(" ")}
              fill={poly.fill || "none"}
              stroke={poly.stroke || "#000"}
              strokeWidth={poly.strokeWidth || 1.5}
            />
            {poly.label && (
              <Label
                pos={[layout.scaleX(mathX), layout.scaleY(mathY)]}
                {...poly.label}
              />
            )}
          </g>
        );
      })}

      {/* 2. 渲染圓形 + 標籤 */}
      {circles.map((circle, idx) => {
        const cx = layout.scaleX(circle.center[0]);
        const cy = layout.scaleY(circle.center[1]);
        const r = Math.abs(
          layout.scaleX(circle.center[0] + circle.radius) - cx,
        );
        return (
          <g key={`circle-${idx}`}>
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill={circle.fill || "none"}
              stroke={circle.stroke || "#000"}
              strokeWidth={circle.strokeWidth || 1.5}
              strokeDasharray={circle.dash}
            />
            {circle.label && (
              <Label
                pos={[
                  layout.scaleX(circle.label.pos?.[0] ?? circle.center[0]),
                  layout.scaleY(circle.label.pos?.[1] ?? circle.center[1]),
                ]}
                {...circle.label}
              />
            )}
          </g>
        );
      })}

      {/* 3. 渲染圓弧 + 標籤 */}
      {arcs.map((arc, idx) => {
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
        const sweep = 0;

        return (
          <g key={`arc-${idx}`}>
            <path
              d={`M ${sx} ${sy} A ${rx} ${ry} 0 ${largeArc} ${sweep} ${ex} ${ey}`}
              fill={arc.fill || "none"}
              stroke={arc.stroke || "#000"}
              strokeWidth={arc.strokeWidth || 1.5}
              strokeDasharray={arc.dash}
            />
            {arc.label && (
              <Label
                pos={[
                  layout.scaleX(arc.label.pos?.[0] ?? arc.center[0]),
                  layout.scaleY(arc.label.pos?.[1] ?? arc.center[1]),
                ]}
                {...arc.label}
              />
            )}
          </g>
        );
      })}

      {/* 4. 渲染線段 + 標籤 */}
      {segments.map((seg, idx) => {
        const mathX = seg.label?.pos?.[0] ?? (seg.start[0] + seg.end[0]) / 2;
        const mathY = seg.label?.pos?.[1] ?? (seg.start[1] + seg.end[1]) / 2;
        return (
          <g key={`seg-${idx}`}>
            <line
              x1={layout.scaleX(seg.start[0])}
              y1={layout.scaleY(seg.start[1])}
              x2={layout.scaleX(seg.end[0])}
              y2={layout.scaleY(seg.end[1])}
              stroke={seg.color || "#000"}
              strokeWidth={seg.strokeWidth || 1.5}
              strokeDasharray={seg.dash}
            />
            {seg.label && (
              <Label
                pos={[layout.scaleX(mathX), layout.scaleY(mathY)]}
                {...seg.label}
              />
            )}
          </g>
        );
      })}

      {/* 5. 渲染角度標記 ( AngleMarker 內部自己會渲染 Label ) */}
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
        const x = layout.scaleX(pt.pos[0]);
        const y = layout.scaleY(pt.pos[1]);
        return (
          <g key={`pt-${idx}`}>
            {pt.showMarker && (
              <circle
                cx={x}
                cy={y}
                r={pt.markerSize || 3}
                fill={pt.markerColor || "#000"}
              />
            )}
            {pt.label && (
              <Label pos={[x, y]} {...pt.label} offset={pt.label.offset || 8} />
            )}
          </g>
        );
      })}
    </svg>
  );
};
