// src/components/geometry/GeometryFrame.tsx

import React, { useMemo } from "react";
import { createLinearScale } from "../../utils/scale";
import { Label } from "../elements/Label";
import { AngleMarker } from "../elements/AngleMarker";

export interface GeoPoint {
  pos: [number, number];
  showMarker?: boolean;
  markerSize?: number;
  markerColor?: string;
  label?: {
    text: string | number;
    align?: string;
    offset?: number;
    color?: string;
    fontSize?: string | number;
  };
}

export interface GeoSegment {
  start: [number, number];
  end: [number, number];
  color?: string;
  strokeWidth?: number;
  dash?: string;
}

export interface GeoPolygon {
  vertices: [number, number][];
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface GeoCircle {
  center: [number, number];
  radius: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  dash?: string;
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
}

export interface GeoAngleMarker {
  vertex: [number, number];
  p1: [number, number];
  p2: [number, number];
  size?: number;
  color?: string;
  strokeWidth?: number;
  isRightAngle?: boolean;
  label?: {
    text: string | number;
    align?: string;
    offset?: number;
    color?: string;
  };
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

    const [pTop, pRight, pBot, pLeft] = Array.isArray(padding)
      ? padding
      : [padding, padding, padding, padding];

    const mathW = maxX - minX;
    const mathH = maxY - minY;

    // 🌟 關鍵修改：如果沒有提供 height，就根據幾何圖形的真實比例自動推算
    const finalWidth = width;
    const finalHeight =
      height ?? (finalWidth - pLeft - pRight) * (mathH / mathW) + pTop + pBot;

    const drawW = finalWidth - pLeft - pRight;
    const drawH = finalHeight - pTop - pBot;

    const scale = Math.min(drawW / mathW, drawH / mathH);

    const actualMathW = drawW / scale;
    const actualMathH = drawH / scale;
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
  ]);

  return (
    <svg
      className="bg-white shadow-md transition-all duration-100 ease-out"
      width={layout.finalWidth}
      height={layout.finalHeight}
      xmlns="http://www.w3.org/2000/svg"
      // 🌟 修正點 1：在根節點統一設定圓角端點與連接點，解決「左右沒有完美貼合」的問題
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

      {/* 1. 渲染多邊形 */}
      {polygons.map((poly, idx) => (
        <polygon
          key={`poly-${idx}`}
          points={poly.vertices
            .map((p) => `${layout.scaleX(p[0])},${layout.scaleY(p[1])}`)
            .join(" ")}
          fill={poly.fill || "none"}
          stroke={poly.stroke || "#000"}
          strokeWidth={poly.strokeWidth || 1.5}
        />
      ))}

      {/* 2. 渲染圓形 */}
      {circles.map((circle, idx) => {
        const cx = layout.scaleX(circle.center[0]);
        const cy = layout.scaleY(circle.center[1]);
        const r = Math.abs(
          layout.scaleX(circle.center[0] + circle.radius) -
            layout.scaleX(circle.center[0]),
        );
        return (
          <circle
            key={`circle-${idx}`}
            cx={cx}
            cy={cy}
            r={r}
            fill={circle.fill || "none"}
            stroke={circle.stroke || "#000"}
            strokeWidth={circle.strokeWidth || 1.5}
            strokeDasharray={circle.dash}
          />
        );
      })}

      {/* 3. 渲染圓弧 */}
      {arcs.map((arc, idx) => {
        const cx = layout.scaleX(arc.center[0]);
        const cy = layout.scaleY(arc.center[1]);
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
          <path
            key={`arc-${idx}`}
            d={`M ${sx} ${sy} A ${rx} ${ry} 0 ${largeArc} ${sweep} ${ex} ${ey}`}
            fill={arc.fill || "none"}
            stroke={arc.stroke || "#000"}
            strokeWidth={arc.strokeWidth || 1.5}
            strokeDasharray={arc.dash}
          />
        );
      })}

      {/* 4. 渲染線段 */}
      {segments.map((seg, idx) => (
        <line
          key={`seg-${idx}`}
          x1={layout.scaleX(seg.start[0])}
          y1={layout.scaleY(seg.start[1])}
          x2={layout.scaleX(seg.end[0])}
          y2={layout.scaleY(seg.end[1])}
          stroke={seg.color || "#000"}
          strokeWidth={seg.strokeWidth || 1.5}
          strokeDasharray={seg.dash}
        />
      ))}

      {/* 5. 渲染角度標記 */}
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
              <Label
                pos={[x, y]}
                text={pt.label.text}
                align={pt.label.align}
                offset={pt.label.offset || 8}
                color={pt.label.color}
                fontSize={pt.label.fontSize}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
};
