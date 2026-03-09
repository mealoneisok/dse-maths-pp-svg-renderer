// src/components/geometry/GeometryFrame3D.tsx

import React, { useMemo } from "react";
import {
  Point,
  Segment,
  LoftedSolid,
  Polyhedron,
  Sphere,
  ConeFrustum,
  Hemisphere,
  Polygon,
  Region,
  DimLine,
  type Point3DProps,
  type Segment3DProps,
  type SolidDef,
  type AngleMarker3DProps,
  type Vector2,
  type Vector3,
  type PolygonProps,
  type RegionProps,
  type DimLineProps,
} from "../elements";
import { AngleMarker3D } from "../elements/3D/AngleMarker3D";
import { calculateLayout3D } from "../../utils/layout/geometryFrame3D";
import { normalizeLabel } from "@/utils/type";
import { LAYOUT } from "@/constants";

interface GeometryFrame3DProps {
  width: number;
  height?: number;
  padding?: number | [number, number, number, number];
  points?: Point3DProps[];
  segments?: Segment3DProps[];
  solids?: SolidDef[];
  angleMarkers?: Omit<AngleMarker3DProps, "project">[];
  polygons?: PolygonProps[];
  regions?: RegionProps[];
  dimLines?: DimLineProps[];
}

export const GeometryFrame3D: React.FC<GeometryFrame3DProps> = ({
  width,
  height,
  padding = 0,
  points = [],
  segments = [],
  solids = [],
  angleMarkers = [],
  polygons = [],
  regions = [],
  dimLines = [],
}) => {
  const processedPoints = useMemo(() => {
    return points.map((pt) => {
      const markerSize = pt.markerSize ?? 4;
      return {
        ...pt,
        showMarker: pt.showMarker ?? false,
        markerSize,
        label: normalizeLabel(pt.label, {
          offset: markerSize,
          align: LAYOUT.DEFAULT_POINT_LABEL_ALIGN,
        }),
      };
    });
  }, [points]);

  const processedAngleMarkers = useMemo(() => {
    return angleMarkers.map((am) => ({
      ...am,
      label: normalizeLabel(am.label, {
        offset: 8,
        align: LAYOUT.DEFAULT_POINT_LABEL_ALIGN,
      }),
    }));
  }, [angleMarkers]);

  // 1. 自動計算 Layout (傳入已經清洗過的 processed 資料)
  const layout = useMemo(() => {
    return calculateLayout3D({
      width,
      height,
      padding,
      elements: {
        points: processedPoints,
        segments,
        solids,
        angleMarkers: processedAngleMarkers,
        polygons,
        regions,
        dimLines,
      },
    });
  }, [
    width,
    height,
    padding,
    processedPoints,
    segments,
    solids,
    processedAngleMarkers,
    polygons,
    regions,
    dimLines,
  ]);

  // 2. 根據算出的 scale 和 origin 建立終極 Project 函數
  const angle = Math.PI / 6;
  const depthScale = 0.6;
  const viewVector: Vector3 = [
    depthScale * Math.cos(angle),
    -1,
    depthScale * Math.sin(angle),
  ];

  const project = (pt: Vector2 | Vector3): Vector2 => {
    const [x, y, z = 0] = pt; // 容錯機制：如果只傳入 2D 座標，z 預設為 0
    const px = (x + y * depthScale * Math.cos(angle)) * layout.scale;
    const py = (-z - y * depthScale * Math.sin(angle)) * layout.scale;
    return [layout.origin[0] + px, layout.origin[1] + py];
  };

  return (
    <svg
      width={layout.finalWidth}
      height={layout.finalHeight}
      className="bg-white shadow-md transition-all duration-100 ease-out"
    >
      {/* 🌟 渲染 3D 投影陰影 (Region) */}
      {regions
        .filter((r) => r?.start && r?.paths)
        .map((region, idx) => (
          <Region
            key={`region3d-${idx}`}
            {...region}
            project={project}
            scale={layout.scale}
          />
        ))}

      {/* 渲染 Solids */}
      {solids.map((solid, idx) => {
        switch (solid.type) {
          case "lofted":
            return (
              <LoftedSolid
                key={`solid-${idx}`}
                {...solid}
                project={project}
                viewVector={viewVector}
              />
            );
          case "polyhedron":
            return (
              <Polyhedron
                key={`solid-${idx}`}
                {...solid}
                project={project}
                viewVector={viewVector}
              />
            );
          case "sphere":
            return (
              <Sphere
                key={`solid-${idx}`}
                {...solid}
                project={project}
                scale={layout.scale}
              />
            );
          case "coneFrustum":
            return (
              <ConeFrustum
                key={`solid-${idx}`}
                {...solid}
                project={project}
                scale={layout.scale}
              />
            );
          case "hemisphere":
            return (
              <Hemisphere
                key={`solid-${idx}`}
                {...solid}
                project={project}
                scale={layout.scale}
              />
            );
          default:
            return null;
        }
      })}

      {/* 🌟 渲染 3D 空間中的多邊形 (Polygon) */}
      {polygons.map((poly, idx) => (
        <Polygon
          key={`poly3d-${idx}`}
          {...poly}
          project={project}
          label={poly.label}
        />
      ))}

      {/* 渲染 Segments */}
      {segments.map((seg, idx) => (
        <Segment
          key={`seg3d-${idx}`}
          start={project(seg.start)}
          end={project(seg.end)}
          color={seg.color}
          dash={seg.dash}
        />
      ))}

      {/* 🌟 渲染 3D 空間中的標註線 (DimLine) */}
      {dimLines.map((dl, idx) => (
        <DimLine
          key={`dim3d-${idx}`}
          {...dl}
          project={project}
          label={dl.label}
        />
      ))}

      {/* 渲染 Angle Markers */}
      {angleMarkers.map((marker, idx) => (
        <AngleMarker3D key={`angle3d-${idx}`} {...marker} project={project} />
      ))}

      {/* 渲染 Points */}
      {processedPoints.map((pt, idx) => (
        <Point key={`pt3d-${idx}`} {...pt} pos={project(pt.pos)} />
      ))}
    </svg>
  );
};
