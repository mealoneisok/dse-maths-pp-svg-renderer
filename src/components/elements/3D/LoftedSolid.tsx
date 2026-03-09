// src/components/elements/3D/LoftedSolid.tsx

import React from "react";
import { Segment, type LoftedSolidProps, type Vector3 } from "..";
import { sub, dot, cross } from "@/utils/math";

export const LoftedSolid: React.FC<LoftedSolidProps> = ({
  baseVertices,
  height,
  topScale = 1,
  shift = [0, 0],
  color = "#111827",
  project,
  viewVector,
}) => {
  if (!project || !viewVector) return null;

  const n = baseVertices.length;

  // 1. Generate 3D Vertices
  const bottom3D: Vector3[] = baseVertices.map(([x, y]) => [x, y, 0]);
  const top3D: Vector3[] = baseVertices.map(([x, y]) => [
    x * topScale + shift[0],
    y * topScale + shift[1],
    height,
  ]);
  const allVerts = [...bottom3D, ...top3D];

  // 2. Define Faces (Indices of allVerts) and compute normals
  const faces: { verts: number[]; normal: Vector3; visible: boolean }[] = [];

  // Bottom Face (normal points down -Z)
  faces.push({
    verts: Array.from({ length: n }, (_, i) => i).reverse(),
    normal: [0, 0, -1],
    visible: dot([0, 0, -1], viewVector) > 0,
  });

  // Top Face (normal points up +Z)
  if (topScale > 0) {
    faces.push({
      verts: Array.from({ length: n }, (_, i) => n + i),
      normal: [0, 0, 1],
      visible: dot([0, 0, 1], viewVector) > 0,
    });
  }

  // Side Faces
  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n;
    const vIdx = [i, next, n + next, n + i]; // A, B, C, D (CCW from outside)

    // V1 = B - A, V2 = D - A
    const v1 = sub(allVerts[vIdx[1]], allVerts[vIdx[0]]);
    const v2 = sub(allVerts[vIdx[3]], allVerts[vIdx[0]]);
    const normal = cross(v1, v2);

    faces.push({
      verts: vIdx,
      normal,
      visible: dot(normal, viewVector) > 0,
    });
  }

  // 3. Extract Edges & Determine Line Visibility
  // Edge is visible if AT LEAST ONE of its adjacent faces is visible.
  const edges = new Map<
    string,
    { start: Vector3; end: Vector3; visible: boolean }
  >();

  faces.forEach((face) => {
    for (let i = 0; i < face.verts.length; i++) {
      const p1Idx = face.verts[i];
      const p2Idx = face.verts[(i + 1) % face.verts.length];

      // Prevent zero-length edges at the apex of a pyramid
      if (p1Idx === p2Idx || (topScale === 0 && p1Idx >= n && p2Idx >= n))
        continue;

      const key = p1Idx < p2Idx ? `${p1Idx}-${p2Idx}` : `${p2Idx}-${p1Idx}`;

      if (!edges.has(key)) {
        edges.set(key, {
          start: allVerts[p1Idx],
          end: allVerts[p2Idx],
          visible: face.visible,
        });
      } else {
        edges.get(key)!.visible = edges.get(key)!.visible || face.visible;
      }
    }
  });

  // 4. Render Segments
  return (
    <g>
      {Array.from(edges.values()).map((edge, idx) => (
        <Segment
          key={`edge-${idx}`}
          start={project(edge.start)}
          end={project(edge.end)}
          color={color}
          dash={edge.visible ? undefined : "5 5"}
        />
      ))}
    </g>
  );
};
