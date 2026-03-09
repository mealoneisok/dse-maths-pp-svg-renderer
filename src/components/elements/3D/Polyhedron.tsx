// src/components/elements/3D/Polyhedron.tsx

import React from "react";
import { Segment, type PolyhedronProps, type Vector3 } from "..";
import { sub, dot, cross } from "@/utils/math";
import { LAYOUT } from "@/constants";
import { normalizeDash, normalizeFill } from "@/utils/type";
import { PatternFill } from "../PatternFill";

export const Polyhedron: React.FC<PolyhedronProps> = ({
  vertices,
  faces,
  color = LAYOUT.DEFAULT_COLOR,
  fill = "none",
  project,
  viewVector,
  strokeWidth = LAYOUT.DEFAULT_STROKE_WIDTH,
  dash = "dashed", // 控制背向鏡頭的「隱藏邊緣」虛線樣式
  frontDash,
}) => {
  if (!project || !viewVector) return null;

  // 1. 解析 Fill 與 Pattern
  const { fillValue, patternDef } = normalizeFill(fill);

  // 用來儲存帶有深度資訊的面的陣列
  const faceData: {
    verts: number[];
    normal: Vector3;
    visible: boolean;
    depth: number;
  }[] = [];

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

    // 3. 準備畫家演算法所需的深度 (Depth)
    let cx = 0,
      cy = 0,
      cz = 0;
    faceIndices.forEach((idx) => {
      cx += vertices[idx][0];
      cy += vertices[idx][1];
      cz += vertices[idx][2] ?? 0;
    });
    const len = faceIndices.length;
    const depth = dot([cx / len, cy / len, cz / len], viewVector);

    faceData.push({
      verts: faceIndices,
      normal,
      visible: isVisible,
      depth,
    });

    // 4. 將邊緣加入 Map，只要相鄰的面有一個是可見的，該邊緣就是實線
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

  // 畫家演算法：過濾出可見面，並依照深度由遠到近排序
  const filledFaces = faceData
    .filter((f) => f.visible)
    .sort((a, b) => a.depth - b.depth);

  // 智慧判斷背向邊緣是否要顯示：
  // 如果是實心純色填充，隱藏背面邊緣；如果是圖案填充(如水面)或透明，則顯示背面虛線
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

      {/* 3. 先渲染面 (填色)：利用 SVG polygon 畫出實體 */}
      {fill !== "none" &&
        fillValue !== "transparent" &&
        filledFaces.map((face, idx) => {
          // 將 3D 頂點轉成 2D 像素坐標
          const pts2D = face.verts.map((vIdx) => project(vertices[vIdx]));
          return (
            <polygon
              key={`poly-face-${idx}`}
              points={pts2D.map((p) => `${p[0]},${p[1]}`).join(" ")}
              fill={fillValue} // 套用解析出來的 fillValue
              stroke={color}
              strokeWidth={0.5}
              strokeLinejoin="round"
            />
          );
        })}

      {/* 4. 再渲染線 (骨架)：疊加在面上 */}
      {Array.from(edges.values()).map((edge, idx) => (
        <Segment
          key={`poly-edge-${idx}`}
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
