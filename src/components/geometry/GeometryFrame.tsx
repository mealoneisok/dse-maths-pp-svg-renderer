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
import { normalizeLabel } from "../../utils/type";
import { useMemo } from "react";
import { calculateLayout } from "../../utils/layout/geometryFrame";

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
    return calculateLayout({
      width,
      height,
      padding,
      elements: {
        points,
        segments,
        polygons,
        circles,
        arcs,
        angleMarkers,
        regions,
      },
    });
  }, [
    width,
    height,
    padding,
    points,
    segments,
    polygons,
    circles,
    arcs,
    angleMarkers,
    regions,
  ]);

  // --- Helpers: 座標轉換器 ---
  const toPxX = (mathX: number) => layout.scaleX(mathX);
  const toPxY = (mathY: number) => layout.scaleY(mathY);
  const toPx = (pt: [number, number]): [number, number] => [
    toPxX(pt[0]),
    toPxY(pt[1]),
  ];
  const toPxDist = (mathDist: number, refX: number = 0) =>
    Math.abs(toPxX(refX + mathDist) - toPxX(refX));

  const getScaledLabel = (
    rawLabel: LabelConfig | string | null | undefined,
    defaultMathX: number,
    defaultMathY: number,
  ) => {
    const labelObj = normalizeLabel(rawLabel, {});
    if (!labelObj) return undefined;
    return {
      ...labelObj,
      pos: toPx([
        labelObj.pos?.[0] ?? defaultMathX,
        labelObj.pos?.[1] ?? defaultMathY,
      ]),
    };
  };

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
        .filter((r) => r?.start && r?.paths)
        .map((region, idx) => (
          <Region
            key={`region-${idx}`}
            start={toPx(region.start)}
            paths={
              region.paths
                .filter((p) => p?.to)
                .map((p) => ({
                  ...p,
                  to: toPx(p.to),
                  radius: p.radius ? toPxDist(p.radius) : undefined,
                })) as any
            }
            fill={region.fill}
            stroke={region.stroke}
            strokeWidth={region.strokeWidth}
          />
        ))}

      {/* 1. 渲染多邊形 */}
      {polygons.map((poly, idx) => {
        const center = poly.vertices.reduce(
          (acc, v) => [acc[0] + v[0], acc[1] + v[1]],
          [0, 0],
        );
        const defaultMathPos = [
          center[0] / poly.vertices.length,
          center[1] / poly.vertices.length,
        ];

        return (
          <Polygon
            key={`poly-${idx}`}
            vertices={poly.vertices.map(toPx)}
            fill={poly.fill}
            stroke={poly.stroke}
            strokeWidth={poly.strokeWidth}
            label={getScaledLabel(
              poly.label,
              defaultMathPos[0],
              defaultMathPos[1],
            )}
          />
        );
      })}

      {/* 2. 渲染圓形 */}
      {circles.map((circle, idx) => (
        <Circle
          key={`circle-${idx}`}
          center={toPx(circle.center)}
          radius={toPxDist(circle.radius, circle.center[0])}
          fill={circle.fill}
          stroke={circle.stroke}
          strokeWidth={circle.strokeWidth}
          dash={circle.dash}
          label={getScaledLabel(
            circle.label,
            circle.center[0],
            circle.center[1],
          )}
        />
      ))}

      {/* 3. 渲染圓弧 */}
      {arcs.map((arc, idx) => {
        const rx = toPxDist(arc.radius, arc.center[0]);
        const ry = Math.abs(
          layout.scaleY(arc.center[1] + arc.radius) -
            layout.scaleY(arc.center[1]),
        ); // Y軸特定距離
        const sx = toPxX(arc.center[0] + arc.radius * Math.cos(arc.startAngle));
        const sy = toPxY(arc.center[1] + arc.radius * Math.sin(arc.startAngle));
        const ex = toPxX(arc.center[0] + arc.radius * Math.cos(arc.endAngle));
        const ey = toPxY(arc.center[1] + arc.radius * Math.sin(arc.endAngle));

        let diff = arc.endAngle - arc.startAngle;
        while (diff < 0) diff += 2 * Math.PI;

        return (
          <Arc
            key={`arc-${idx}`}
            center={toPx(arc.center)}
            radius={rx}
            startAngle={arc.startAngle}
            endAngle={arc.endAngle}
            _svgParams={{
              sx,
              sy,
              ex,
              ey,
              rx,
              ry,
              largeArc: diff > Math.PI ? 1 : 0,
              sweep: 0,
            }}
            fill={arc.fill}
            stroke={arc.stroke}
            strokeWidth={arc.strokeWidth}
            dash={arc.dash}
            label={getScaledLabel(arc.label, arc.center[0], arc.center[1])}
          />
        );
      })}

      {/* 4. 渲染線段 */}
      {segments.map((seg, idx) => (
        <Segment
          key={`seg-${idx}`}
          start={toPx(seg.start)}
          end={toPx(seg.end)}
          strokeWidth={seg.strokeWidth}
          color={seg.color}
          dash={seg.dash}
          label={getScaledLabel(
            seg.label,
            (seg.start[0] + seg.end[0]) / 2,
            (seg.start[1] + seg.end[1]) / 2,
          )}
        />
      ))}

      {/* 5. 渲染角度標記 (未變動) */}
      {angleMarkers.map((am, idx) => (
        <AngleMarker
          key={`am-${idx}`}
          vertex={toPx(am.vertex)}
          p1={toPx(am.p1)}
          p2={toPx(am.p2)}
          size={am.size}
          color={am.color}
          strokeWidth={am.strokeWidth}
          isRightAngle={am.isRightAngle}
          label={am.label as any}
        />
      ))}

      {/* 6. 渲染點與標籤 */}
      {points.map((pt, idx) => (
        <Point
          key={`pt-${idx}`}
          pos={toPx(pt.pos)}
          type={pt.type}
          markerSize={pt.markerSize}
          showMarker={pt.showMarker}
          markerColor={pt.markerColor}
          strokeWidth={pt.strokeWidth}
          label={getScaledLabel(pt.label, pt.pos[0], pt.pos[1])}
        />
      ))}
    </svg>
  );
};
