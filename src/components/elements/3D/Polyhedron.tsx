// src/components/elements/3D/Polyhedron.tsx

import React from "react";
import { Segment } from "../Segment";
import { type Vector3 } from "../../geometry/GeometryFrame3D";
import { sub, dot, cross } from "@/utils/math";

export interface PolyhedronProps {
  vertices: Vector3[];
  faces: number[][]; // 頂點 index 陣列，順序必須從面的外部看是「逆時針 (CCW)」
  color?: string;
  project?: (pt: Vector3) => [number, number];
  viewVector?: Vector3;
}

export const Polyhedron: React.FC<PolyhedronProps> = ({
  vertices,
  faces,
  color = "#111827",
  project,
  viewVector,
}) => {
  if (!project || !viewVector) return null;

  const edges = new Map<
    string,
    { start: Vector3; end: Vector3; visible: boolean }
  >();

  faces.forEach((faceIndices) => {
    // 1. 計算該面的法向量 (取前三個點)
    const v1 = sub(vertices[faceIndices[1]], vertices[faceIndices[0]]);
    const v2 = sub(vertices[faceIndices[2]], vertices[faceIndices[0]]);
    const normal = cross(v1, v2);

    // 2. 判斷該面是否朝向鏡頭
    const isVisible = dot(normal, viewVector) > 0;

    // 3. 將邊緣加入 Map，只要相鄰的面有一個是可見的，該邊緣就是實線
    for (let i = 0; i < faceIndices.length; i++) {
      const p1Idx = faceIndices[i];
      const p2Idx = faceIndices[(i + 1) % faceIndices.length];
      const key = p1Idx < p2Idx ? `${p1Idx}-${p2Idx}` : `${p2Idx}-${p1Idx}`;

      if (!edges.has(key)) {
        edges.set(key, {
          start: vertices[p1Idx],
          end: vertices[p2Idx],
          visible: isVisible,
        });
      } else {
        edges.get(key)!.visible = edges.get(key)!.visible || isVisible;
      }
    }
  });

  return (
    <g>
      {Array.from(edges.values()).map((edge, idx) => (
        <Segment
          key={`poly-edge-${idx}`}
          start={project(edge.start)}
          end={project(edge.end)}
          color={color}
          dash={edge.visible ? undefined : "5 5"}
        />
      ))}
    </g>
  );
};
