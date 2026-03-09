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
            {...region} // 自動展開 fill, stroke, strokeWidth 等樣式
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
            {...poly} // 展開全部樣式參數
            vertices={poly.vertices.map(toPx)}
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
          {...circle} // 展開 fill, stroke, dash 等
          center={toPx(circle.center)} // 後方屬性會覆寫前面展開的 math 座標
          radius={toPxDist(circle.radius, circle.center[0])}
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
        );
        const sx = toPxX(arc.center[0] + arc.radius * Math.cos(arc.startAngle));
        const sy = toPxY(arc.center[1] + arc.radius * Math.sin(arc.startAngle));
        const ex = toPxX(arc.center[0] + arc.radius * Math.cos(arc.endAngle));
        const ey = toPxY(arc.center[1] + arc.radius * Math.sin(arc.endAngle));

        let diff = arc.endAngle - arc.startAngle;
        while (diff < 0) diff += 2 * Math.PI;

        return (
          <Arc
            key={`arc-${idx}`}
            {...arc} // 展開 fill, stroke 等
            center={toPx(arc.center)}
            radius={rx} // 覆寫成計算後的 px 半徑
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
            label={getScaledLabel(arc.label, arc.center[0], arc.center[1])}
          />
        );
      })}

      {/* 4. 渲染線段 */}
      {segments.map((seg, idx) => (
        <Segment
          key={`seg-${idx}`}
          {...seg} // 展開 strokeWidth, color, dash 等
          start={toPx(seg.start)}
          end={toPx(seg.end)}
          label={getScaledLabel(
            seg.label,
            (seg.start[0] + seg.end[0]) / 2,
            (seg.start[1] + seg.end[1]) / 2,
          )}
        />
      ))}

      {/* 5. 渲染角度標記 */}
      {angleMarkers.map((am, idx) => (
        <AngleMarker
          key={`am-${idx}`}
          {...am} // 展開 size, color, strokeWidth 等
          vertex={toPx(am.vertex)}
          p1={toPx(am.p1)}
          p2={toPx(am.p2)}
        />
      ))}

      {/* 6. 渲染點與標籤 */}
      {points.map((pt, idx) => (
        <Point
          key={`pt-${idx}`}
          {...pt} // 展開 type, markerSize, color 等
          pos={toPx(pt.pos)}
          label={getScaledLabel(pt.label, pt.pos[0], pt.pos[1])}
        />
      ))}
    </svg>
  );
};
