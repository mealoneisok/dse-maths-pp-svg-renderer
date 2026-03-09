// src/components/geometry/GeometryFrame.tsx

import {
  AngleMarker,
  Point,
  Segment,
  Polygon,
  Circle,
  Arc,
  DimLine,
  Region,
  type PointProps,
  type SegmentProps,
  type ArcProps,
  type PolygonProps,
  type CircleProps,
  type AngleMarkerProps,
  type RegionProps,
  type DimLineProps,
  type Vector2,
} from "../elements";
import { normalizeLabel } from "@/utils/type";
import { useMemo } from "react";
import { calculateLayout } from "@/utils/layout/geometryFrame";
import { LAYOUT } from "@/constants";
import { getMidpoint } from "@/utils/math";

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
  dimLines?: DimLineProps[];
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
  dimLines = [],
}) => {
  // 🌟 1. 預處理 (Data Normalization)：為所有元素補齊中心點 (pos) 與 label

  const elements = useMemo(() => {
    return {
      points: points.map((pt) => ({
        ...pt,
        label: normalizeLabel(pt.label, {
          offset: 8,
          align: LAYOUT.DEFAULT_POINT_LABEL_ALIGN,
          pos: pt.pos,
        }),
      })),
      segments: segments.map((s) => ({
        ...s,
        label: normalizeLabel(s.label, {
          offset: 8,
          align: "center",
          pos: getMidpoint(s.start, s.end),
        }),
      })),
      polygons: polygons.map((p) => {
        const sum = p.vertices.reduce(
          (acc, v) => [acc[0] + v[0], acc[1] + v[1]],
          [0, 0],
        );
        const center: Vector2 = [
          sum[0] / p.vertices.length,
          sum[1] / p.vertices.length,
        ];
        return {
          ...p,
          label: normalizeLabel(p.label, {
            offset: 8,
            align: "center",
            pos: center,
          }),
        };
      }),
      circles: circles.map((c) => ({
        ...c,
        label: normalizeLabel(c.label, {
          offset: 8,
          align: "center",
          pos: c.center,
        }),
      })),
      arcs: arcs.map((a) => ({
        ...a,
        label: normalizeLabel(a.label, {
          offset: 8,
          align: "center",
          pos: a.center,
        }),
      })),
      angleMarkers: angleMarkers.map((am) => ({
        ...am,
        label: normalizeLabel(am.label, { offset: 8, align: "center" }),
      })),
      dimLines: dimLines.map((dl) => ({
        ...dl,
        label: normalizeLabel(dl.label, {
          offset: 8,
          align: "center",
          pos: getMidpoint(dl.start, dl.end),
        }),
      })),
      regions,
    };
  }, [
    points,
    segments,
    polygons,
    circles,
    arcs,
    angleMarkers,
    dimLines,
    regions,
  ]);

  // 2. 計算 Layout
  const layout = useMemo(() => {
    return calculateLayout({
      width,
      height,
      padding,
      elements: {
        ...elements,
        segments: [...elements.segments, ...elements.dimLines],
      },
    });
  }, [width, height, padding, elements]);

  const project = (pt: Vector2): Vector2 => [
    layout.scaleX(pt[0]),
    layout.scaleY(pt[1]),
  ];

  return (
    <svg
      className="bg-white shadow-md transition-all duration-100 ease-out"
      width={layout.finalWidth}
      height={layout.finalHeight}
      xmlns="http://www.w3.org/2000/svg"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {elements.regions
        .filter((r) => r?.start && r?.paths)
        .map((region, idx) => (
          <Region
            key={`region-${idx}`}
            {...region}
            project={project}
            scale={layout.scale}
          />
        ))}

      {elements.polygons.map((poly, idx) => (
        <Polygon
          key={`poly-${idx}`}
          {...poly}
          project={project}
          label={poly.label}
        />
      ))}

      {elements.circles.map((circle, idx) => (
        <Circle
          key={`circle-${idx}`}
          {...circle}
          project={project}
          scale={layout.scale}
          label={circle.label}
        />
      ))}

      {elements.arcs.map((arc, idx) => (
        <Arc
          key={`arc-${idx}`}
          {...arc}
          project={project}
          scale={layout.scale}
          label={arc.label}
        />
      ))}

      {elements.segments.map((seg, idx) => (
        <Segment
          key={`seg-${idx}`}
          {...seg}
          project={project}
          label={seg.label}
        />
      ))}

      {elements.angleMarkers.map((am, idx) => (
        <AngleMarker
          key={`am-${idx}`}
          {...am}
          project={project}
          label={am.label}
        />
      ))}

      {elements.points.map((pt, idx) => (
        <Point key={`pt-${idx}`} {...pt} project={project} label={pt.label} />
      ))}

      {elements.dimLines.map((dl, idx) => (
        <DimLine
          key={`dim-${idx}`}
          {...dl}
          project={project}
          label={dl.label}
        />
      ))}
    </svg>
  );
};
