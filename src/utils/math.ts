// src/utils/math.tsx

import { PROJ_ANGLE } from "@/constants";
import { PROJ_DEPTH_SCALE } from "@/constants";
import type { Vector2, Vector3 } from "../components/elements/types";

export const add = (a: Vector3, b: Vector3): Vector3 => [
  a[0] + b[0],
  a[1] + b[1],
  a[2] + b[2],
];

export const sub = (a: Vector3, b: Vector3): Vector3 => [
  a[0] - b[0],
  a[1] - b[1],
  a[2] - b[2],
];

export const dot = (a: Vector3, b: Vector3): number =>
  a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

export const cross = (a: Vector3, b: Vector3): Vector3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

export const scale = (v: Vector3, s: number): Vector3 => [
  v[0] * s,
  v[1] * s,
  v[2] * s,
];

export const magnitude = (v: Vector3): number =>
  Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);

export const normalize = (v: Vector3): Vector3 => scale(v, 1 / magnitude(v));

// 第一階段：無縮放、無原點偏移的純數學 2D 投影
export const projectMath = (pt: Vector3): Vector2 => {
  const [x, y, z] = pt;
  return [
    x + y * PROJ_DEPTH_SCALE * Math.cos(PROJ_ANGLE),
    -z - y * PROJ_DEPTH_SCALE * Math.sin(PROJ_ANGLE), // SVG 的 Y 軸向下
  ];
};

export const project3Dto2D = (
  origin: Vector2,
  scale: number,
  pt: Vector2 | Vector3,
): Vector2 => {
  const [x, y, z = 0] = pt; // 容錯機制：如果只傳入 2D 座標，z 預設為 0
  const px = (x + y * PROJ_DEPTH_SCALE * Math.cos(PROJ_ANGLE)) * scale;
  const py = (-z - y * PROJ_DEPTH_SCALE * Math.sin(PROJ_ANGLE)) * scale;
  return [origin[0] + px, origin[1] + py];
};

export const getMidpoint = (
  p1: Vector2 | Vector3,
  p2: Vector2 | Vector3,
): Vector2 | Vector3 => {
  if (p1.length === 3 || p2.length === 3) {
    return [
      (p1[0] + p2[0]) / 2,
      (p1[1] + p2[1]) / 2,
      ((p1[2] ?? 0) + (p2[2] ?? 0)) / 2,
    ] as Vector3;
  }
  return [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2] as Vector2;
};
