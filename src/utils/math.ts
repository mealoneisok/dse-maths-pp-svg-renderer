// src/utils/math.tsx

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

export const getMidpoint = (p1: Vector2, p2: Vector2): Vector2 => [
  (p1[0] + p2[0]) / 2,
  (p1[1] + p2[1]) / 2,
];
