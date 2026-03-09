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
  type LoftedSolidProps,
  type PolyhedronProps,
  type SphereProps,
  type ConeFrustumProps,
  type HemisphereProps,
  type AngleMarker3DProps,
} from "../elements";
import { AngleMarker3D } from "../elements/3D/AngleMarker3D";
import { calculateLayout3D } from "../../utils/layout/geometryFrame3D";
import { normalizeLabel } from "@/utils/type";
import { LAYOUT } from "@/constants";

type LoftedDef = { type: "lofted" } & Omit<
  LoftedSolidProps,
  "project" | "viewVector"
>;
type PolyhedronDef = { type: "polyhedron" } & Omit<
  PolyhedronProps,
  "project" | "viewVector"
>;
type SphereDef = { type: "sphere" } & Omit<SphereProps, "project" | "scale">;
type ConeFrustumDef = { type: "coneFrustum" } & Omit<
  ConeFrustumProps,
  "project" | "scale"
>;
type HemisphereDef = { type: "hemisphere" } & Omit<
  HemisphereProps,
  "project" | "scale"
>;

export type SolidDef =
  | LoftedDef
  | PolyhedronDef
  | SphereDef
  | ConeFrustumDef
  | HemisphereDef;

export type Vector3 = [number, number, number];

export interface Point3DProps {
  pos: Vector3;
  label?: any;
  markerColor?: string;
  showMarker?: boolean;
  markerSize?: number; // 🌟 補上 markerSize 屬性
}

export interface Segment3DProps {
  start: Vector3;
  end: Vector3;
  color?: string;
  dash?: string;
}

interface GeometryFrame3DProps {
  width: number;
  height?: number;
  padding?: number | [number, number, number, number];
  points?: Point3DProps[];
  segments?: Segment3DProps[];
  solids?: SolidDef[];
  angleMarkers?: Omit<AngleMarker3DProps, "project">[];
}

export const GeometryFrame3D: React.FC<GeometryFrame3DProps> = ({
  width,
  height,
  padding = 0,
  points = [],
  segments = [],
  solids = [],
  angleMarkers = [],
}) => {
  // 🌟 預處理階段：補齊所有預設值，讓下游不用再做 Fallback
  const processedPoints = useMemo(() => {
    return points.map((pt) => {
      const markerSize = pt.markerSize ?? 4;
      return {
        ...pt,
        showMarker: pt.showMarker ?? false,
        markerSize,
        label: normalizeLabel(pt.label, {
          offset: markerSize, // 直接將點的大小作為預設 offset
          align: LAYOUT.DEFAULT_POINT_LABEL_ALIGN,
        }),
      };
    });
  }, [points]);

  const processedAngleMarkers = useMemo(() => {
    return angleMarkers.map((am) => ({
      ...am,
      label: normalizeLabel(am.label, {
        offset: 8, // AngleMarker 預設 offset
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
  ]);

  // 2. 根據算出的 scale 和 origin 建立終極 Project 函數
  const angle = Math.PI / 6;
  const depthScale = 0.6;
  const viewVector: Vector3 = [
    depthScale * Math.cos(angle),
    -1,
    depthScale * Math.sin(angle),
  ];

  const project = (pt3d: Vector3): [number, number] => {
    const [x, y, z] = pt3d;
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
