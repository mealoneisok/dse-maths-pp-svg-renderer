// src/components/elements/3D/LoftedSolid.tsx

import React from "react";
import { Segment, type LoftedSolidProps, type Vector3 } from "..";
import { sub, dot, cross } from "@/utils/math";
import { normalizeDash, normalizeFill } from "@/utils/type";
import { LAYOUT } from "@/constants";
import { PatternFill } from "../PatternFill";

export const LoftedSolid: React.FC<LoftedSolidProps> = ({
  baseVertices,
  height,
  topScale = 1,
  shift = [0, 0],
  color = LAYOUT.DEFAULT_COLOR,
  fill = "none", // 預設不填色，維持線框模式
  strokeWidth = LAYOUT.DEFAULT_STROKE_WIDTH,
  project,
  viewVector,
  dash = "dashed",
  frontDash,
}) => {
  if (!project || !viewVector) return null;

  // 1. 解析 Fill 與 Pattern
  const { fillValue, patternDef } = normalizeFill(fill);

  const n = baseVertices.length;

  // Generate 3D Vertices
  const bottom3D: Vector3[] = baseVertices.map(([x, y]) => [x, y, 0]);
  const top3D: Vector3[] = baseVertices.map(([x, y]) => [
    x * topScale + shift[0],
    y * topScale + shift[1],
    height,
  ]);
  const allVerts = [...bottom3D, ...top3D];

  // Define Faces (Indices of allVerts) and compute normals
  const faces: { verts: number[]; normal: Vector3; visible: boolean }[] = [];

  faces.push({
    verts: Array.from({ length: n }, (_, i) => i).reverse(),
    normal: [0, 0, -1],
    visible: dot([0, 0, -1], viewVector) > 0,
  });

  if (topScale > 0) {
    faces.push({
      verts: Array.from({ length: n }, (_, i) => n + i),
      normal: [0, 0, 1],
      visible: dot([0, 0, 1], viewVector) > 0,
    });
  }

  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n;
    const vIdx = [i, next, n + next, n + i];

    const v1 = sub(allVerts[vIdx[1]], allVerts[vIdx[0]]);
    const v2 = sub(allVerts[vIdx[3]], allVerts[vIdx[0]]);
    const normal = cross(v1, v2);

    faces.push({
      verts: vIdx,
      normal,
      visible: dot(normal, viewVector) > 0,
    });
  }

  // 畫家演算法：過濾出可見面，並依照深度由遠到近排序
  const filledFaces = faces
    .filter((f) => f.visible)
    .map((face) => {
      let cx = 0,
        cy = 0,
        cz = 0;
      face.verts.forEach((idx) => {
        cx += allVerts[idx][0];
        cy += allVerts[idx][1];
        cz += allVerts[idx][2];
      });
      const depth = dot(
        [
          cx / face.verts.length,
          cy / face.verts.length,
          cz / face.verts.length,
        ],
        viewVector,
      );
      return { ...face, depth };
    })
    .sort((a, b) => a.depth - b.depth);

  // Extract Edges & Determine Line Visibility
  const edges = new Map<
    string,
    { start: Vector3; end: Vector3; visible: boolean }
  >();

  faces.forEach((face) => {
    for (let i = 0; i < face.verts.length; i++) {
      const p1Idx = face.verts[i];
      const p2Idx = face.verts[(i + 1) % face.verts.length];

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

  // 智慧判斷背向邊緣是否要顯示
  const isSolidFill =
    fill !== "none" && !patternDef && fillValue !== "transparent";
  const backDash = isSolidFill ? "none" : normalizeDash(dash);

  return (
    <g>
      {/* 2. 如果是圖案填充，渲染 <defs> 定義 */}
      {patternDef && (
        <defs>
          <PatternFill {...patternDef} />
        </defs>
      )}

      {/* 3. 先渲染面 (填色)：利用 Polygon 畫出實體 */}
      {fill !== "none" &&
        fillValue !== "transparent" &&
        filledFaces.map((face, idx) => {
          const pts2D = face.verts.map((vIdx) => project(allVerts[vIdx]));
          return (
            <polygon
              key={`face-${idx}`}
              points={pts2D.map((p) => `${p[0]},${p[1]}`).join(" ")}
              fill={fillValue}
              stroke={color}
              strokeWidth={0.5}
              strokeLinejoin="round"
            />
          );
        })}

      {/* 4. 再渲染線 (骨架)：疊加在面上 */}
      {Array.from(edges.values()).map((edge, idx) => (
        <Segment
          key={`edge-${idx}`}
          start={project(edge.start)}
          end={project(edge.end)}
          color={color}
          dash={edge.visible ? normalizeDash(frontDash) : backDash}
          strokeWidth={strokeWidth}
        />
      ))}
    </g>
  );
};
