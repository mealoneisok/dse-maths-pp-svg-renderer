// src/components/elements/AngleMarker.tsx

import React from "react";
import { type AngleMarkerProps, type Vector2, type Vector3 } from "./types";
import { LAYOUT } from "../../constants";
import { Label } from "./Label";
import { measureLatex } from "../../utils/measure";
import { normalizeLabel, normalizeDash } from "../../utils/type";
import { sub, dot, normalize, add, scale } from "../../utils/math";

export const AngleMarker: React.FC<
  AngleMarkerProps & { project?: (pt: any) => Vector2 }
> = ({
  vertex,
  p1,
  p2,
  size = 20,
  color = LAYOUT.DEFAULT_COLOR,
  strokeWidth = LAYOUT.DEFAULT_STROKE_WIDTH,
  dash = "solid",
  isRightAngle,
  label,
  project,
}) => {
  const labelObj = normalizeLabel(label);
  const dashArray = normalizeDash(dash);

  // 判斷是否為 3D 空間 (藉由座標陣列長度)
  const is3D = vertex.length === 3 && p1.length === 3 && p2.length === 3;

  // 1. 智能偵測直角
  let isOrthogonal = isRightAngle;
  if (isOrthogonal === undefined) {
    if (is3D) {
      const v1 = normalize(sub(p1 as Vector3, vertex as Vector3));
      const v2 = normalize(sub(p2 as Vector3, vertex as Vector3));
      isOrthogonal = Math.abs(dot(v1, v2)) < 1e-5;
    } else {
      // 2D 內積偵測
      const v1 = normalize([p1[0] - vertex[0], p1[1] - vertex[1], 0]);
      const v2 = normalize([p2[0] - vertex[0], p2[1] - vertex[1], 0]);
      isOrthogonal = Math.abs(dot(v1, v2)) < 1e-5;
    }
  }

  // 2. 基礎像素座標投影
  const pxVertex = project ? project(vertex) : (vertex as Vector2);
  const pxP1 = project ? project(p1) : (p1 as Vector2);
  const pxP2 = project ? project(p2) : (p2 as Vector2);

  let element;
  let labelX = pxVertex[0];
  let labelY = pxVertex[1];

  // 重新補回文字高度測量，找回完美的視覺通關留白
  const getClearance = (
    text: string | number | null | undefined,
    fontSize: any,
  ) => {
    if (!text && text !== 0) return 0;
    const metrics = measureLatex(String(text), fontSize);
    return metrics.height * 0.6;
  };

  if (is3D) {
    // ==========================================
    // 3D 模式: size 代表「數學單位」，需要經過嚴謹的 3D 點位推移與投影
    // ==========================================
    const v1Vec = normalize(sub(p1 as Vector3, vertex as Vector3));
    const v2Vec = normalize(sub(p2 as Vector3, vertex as Vector3));

    // 計算出距離頂點 size 單位的 3D 座標
    const pt1Math = add(vertex as Vector3, scale(v1Vec, size));
    const pt2Math = add(vertex as Vector3, scale(v2Vec, size));

    const px1 = project!(pt1Math);
    const px2 = project!(pt2Math);

    if (isOrthogonal) {
      // 真正使用 3D 數學算出平行四邊形的第四個點 (Corner)，然後投影！
      const ptCornerMath = add(
        vertex as Vector3,
        add(scale(v1Vec, size), scale(v2Vec, size)),
      );
      const pxCorner = project!(ptCornerMath);

      element = (
        <polyline
          points={`${px1[0]},${px1[1]} ${pxCorner[0]},${pxCorner[1]} ${px2[0]},${px2[1]}`}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinejoin="round"
          strokeDasharray={dashArray}
        />
      );

      if (labelObj && labelObj.text) {
        const dirX = pxCorner[0] - pxVertex[0];
        const dirY = pxCorner[1] - pxVertex[1];
        const dist = Math.hypot(dirX, dirY);
        const clearance = getClearance(labelObj.text, labelObj.fontSize);
        const offset = labelObj.offset !== undefined ? labelObj.offset : 4;
        const totalOffset = clearance + offset;

        labelX = pxCorner[0] + (dirX / dist) * totalOffset;
        labelY = pxCorner[1] + (dirY / dist) * totalOffset;
      }
    } else {
      // 3D 透視圓弧作弊法
      let a1 = Math.atan2(px1[1] - pxVertex[1], px1[0] - pxVertex[0]);
      let a2 = Math.atan2(px2[1] - pxVertex[1], px2[0] - pxVertex[0]);

      if (a1 < 0) a1 += 2 * Math.PI;
      if (a2 < 0) a2 += 2 * Math.PI;

      let diff = a2 - a1;
      if (diff > Math.PI) a2 -= 2 * Math.PI;
      else if (diff < -Math.PI) a2 += 2 * Math.PI;

      const sweepFlag = a2 > a1 ? 1 : 0;
      const r =
        (Math.hypot(px1[0] - pxVertex[0], px1[1] - pxVertex[1]) +
          Math.hypot(px2[0] - pxVertex[0], px2[1] - pxVertex[1])) /
        2;

      const startX = pxVertex[0] + r * Math.cos(a1);
      const startY = pxVertex[1] + r * Math.sin(a1);
      const endX = pxVertex[0] + r * Math.cos(a2);
      const endY = pxVertex[1] + r * Math.sin(a2);

      element = (
        <path
          d={`M ${startX} ${startY} A ${r} ${r} 0 0 ${sweepFlag} ${endX} ${endY}`}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={dashArray}
        />
      );

      if (labelObj && labelObj.text) {
        const midAngle = (a1 + a2) / 2;
        const clearance = getClearance(labelObj.text, labelObj.fontSize);
        const offset = labelObj.offset !== undefined ? labelObj.offset : 4;
        const totalDist = r + offset + clearance;

        labelX = pxVertex[0] + totalDist * Math.cos(midAngle);
        labelY = pxVertex[1] + totalDist * Math.sin(midAngle);
      }
    }
  } else {
    // ==========================================
    // 2D 模式: size 代表「螢幕像素」，直接套用完美繪圖
    // ==========================================
    let a1 = Math.atan2(pxP1[1] - pxVertex[1], pxP1[0] - pxVertex[0]);
    let a2 = Math.atan2(pxP2[1] - pxVertex[1], pxP2[0] - pxVertex[0]);

    if (a1 < 0) a1 += 2 * Math.PI;
    if (a2 < 0) a2 += 2 * Math.PI;

    let diff = a2 - a1;
    if (diff > Math.PI) a2 -= 2 * Math.PI;
    else if (diff < -Math.PI) a2 += 2 * Math.PI;

    const sweepFlag = a2 > a1 ? 1 : 0;
    const midAngle = (a1 + a2) / 2;

    if (isOrthogonal) {
      const px1X = pxVertex[0] + size * Math.cos(a1);
      const px1Y = pxVertex[1] + size * Math.sin(a1);
      const px2X = pxVertex[0] + size * Math.cos(a2);
      const px2Y = pxVertex[1] + size * Math.sin(a2);

      const cornerX = pxVertex[0] + size * (Math.cos(a1) + Math.cos(a2));
      const cornerY = pxVertex[1] + size * (Math.sin(a1) + Math.sin(a2));

      element = (
        <polyline
          points={`${px1X},${px1Y} ${cornerX},${cornerY} ${px2X},${px2Y}`}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinejoin="round"
          strokeDasharray={dashArray}
        />
      );

      if (labelObj && labelObj.text) {
        const clearance = getClearance(labelObj.text, labelObj.fontSize);
        const offset = labelObj.offset !== undefined ? labelObj.offset : 4;
        // 2D正方形對角線距離 = size * sqrt(2)
        const effSize = size * Math.SQRT2;
        const totalDist = effSize + offset + clearance;
        labelX = pxVertex[0] + totalDist * Math.cos(midAngle);
        labelY = pxVertex[1] + totalDist * Math.sin(midAngle);
      }
    } else {
      const startX = pxVertex[0] + size * Math.cos(a1);
      const startY = pxVertex[1] + size * Math.sin(a1);
      const endX = pxVertex[0] + size * Math.cos(a2);
      const endY = pxVertex[1] + size * Math.sin(a2);

      element = (
        <path
          d={`M ${startX} ${startY} A ${size} ${size} 0 0 ${sweepFlag} ${endX} ${endY}`}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={dashArray}
        />
      );

      if (labelObj && labelObj.text) {
        const clearance = getClearance(labelObj.text, labelObj.fontSize);
        const offset = labelObj.offset !== undefined ? labelObj.offset : 4;
        const totalDist = size + offset + clearance;
        labelX = pxVertex[0] + totalDist * Math.cos(midAngle);
        labelY = pxVertex[1] + totalDist * Math.sin(midAngle);
      }
    }
  }

  // 最終標籤位置決定
  const pxLabelPos = labelObj?.pos
    ? project
      ? project(labelObj.pos)
      : (labelObj.pos as Vector2)
    : ([labelX, labelY] as Vector2);

  return (
    <g>
      {element}
      {labelObj && (
        <Label
          pos={pxLabelPos}
          align={labelObj.align || "center"}
          offset={0}
          text={labelObj.text}
          color={labelObj.color || color}
          fontSize={labelObj.fontSize}
        />
      )}
    </g>
  );
};
