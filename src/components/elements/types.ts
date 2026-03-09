// src/components/elements/types.tsx

export type Vector2 = [number, number];
export type Vector3 = [number, number, number];

export interface LabelConfig {
  text?: string | number;
  pos?: Vector2;
  align?: string;
  offset?: number;
  rotation?: number;
  color?: string;
  fontSize?: string | number;
}

export interface PointProps {
  pos: Vector2; // 實體像素座標 [x, y]
  type?: "circle" | "cross" | "none";
  showMarker?: boolean;
  markerSize?: number;
  markerColor?: string;
  strokeWidth?: number;
  label?: LabelConfig | string | null;
}

export interface Point3DProps {
  pos: Vector3;
  label?: LabelConfig | string | null;
  markerColor?: string;
  showMarker?: boolean;
  markerSize?: number;
}

export interface SegmentProps {
  start: Vector2 | Vector3;
  end: Vector2 | Vector3;
  strokeWidth?: number;
  color?: string;
  dash?: string | boolean;
  label?: LabelConfig | string | null;
}

export interface Segment3DProps {
  start: Vector3;
  end: Vector3;
  color?: string;
  dash?: string;
}

export interface ArcProps {
  center: Vector2;
  radius: number;
  startAngle: number;
  endAngle: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  dash?: string;
  label?: LabelConfig | string | null;
}

export interface PolygonProps {
  vertices: Vector2[] | Vector3[];
  fill?: string | PatternFillConfig;
  stroke?: string;
  strokeWidth?: number;
  label?: LabelConfig | string | null;
}

export interface CircleProps {
  center: Vector2;
  radius: number;
  fill?: string | PatternFillConfig;
  stroke?: string;
  strokeWidth?: number;
  dash?: string;
  label?: LabelConfig | string | null;
}

export interface AngleMarkerProps {
  vertex: Vector2 | Vector3;
  p1: Vector2 | Vector3;
  p2: Vector2 | Vector3;
  size?: number;
  color?: string;
  strokeWidth?: number;
  dash?: string;
  isRightAngle?: boolean;
  label?: LabelConfig | string | null;
}

export interface PatternFillConfig {
  type?: "diagonal" | "wave";
  spacing?: number; // 對角線間距 / 波浪之間的垂直距離
  angle?: number; // 僅對角線使用
  strokeWidth?: number;
  color?: string;
  background?: string;
  // --- 以下為 wave 專屬參數 ---
  waveAmplitude?: number; // 波浪的振幅 (預設 3)
  waveLength?: number; // 單個波浪的長度 (預設 20)
  dash?: string | boolean; // 想要圖片中斷開的效果，可以傳入 "4 6" 這種格式
}

export interface RegionPathProps {
  type: "line" | "arc";
  to: Vector2 | Vector3;
  radius?: number;
  largeArc?: 0 | 1;
  sweepFlag?: 0 | 1;
}

export interface RegionProps {
  start: Vector2 | Vector3;
  paths: RegionPathProps[];
  fill?: string | PatternFillConfig;
  stroke?: string;
  strokeWidth?: number;
}

export interface DimLineProps extends Omit<SegmentProps, "start" | "end"> {
  start: Vector2 | Vector3;
  end: Vector2 | Vector3;
  gapPadding?: number; // 文字兩側的留白斷點距離
  arrowSize?: number;
  arrowAngle?: number;
  extStart?: number | Vector2 | Vector3; // 起點的垂直延伸線長度
  extEnd?: number | Vector2 | Vector3; // 終點的垂直延伸線長度
  extDash?: string; // 延伸線的虛線樣式
  rotation?: number; // 標籤旋轉角度 (degrees)
}

export interface GridConfig {
  length?: number | Vector2;
  direction?: "positive" | "negative" | "both";
  skipZero?: boolean;
  color?: string;
  dash?: string | boolean;
}

export interface TickValue {
  val: number | string;
  t: number;
  isZero: boolean;
}

export interface LoftedSolidProps {
  baseVertices: Vector2[]; // CCW order expected
  height: number;
  topScale?: number;
  shift?: Vector2;
  color?: string;
  fill?: string | PatternFillConfig;
  strokeWidth?: number;
  project?: ProjectFunctionType;
  viewVector?: Vector3;
  dash?: string;
  frontDash?: string; // 控制朝向鏡頭的「可見邊緣」虛線樣式
}

export interface PolyhedronProps {
  vertices: Vector3[];
  faces: number[][]; // 頂點 index 陣列，順序必須從面的外部看是「逆時針 (CCW)」
  strokeWidth?: number;
  color?: string;
  fill?: string | PatternFillConfig;
  project?: ProjectFunctionType;
  viewVector?: Vector3;
  dash?: string;
  frontDash?: string; // 控制朝向鏡頭的「可見邊緣」虛線樣式
}

export interface SphereProps {
  center: Vector3;
  radius: number; // 3D 空間中的半徑
  strokeWidth?: number;
  color?: string;
  fill?: string | PatternFillConfig;
  project?: ProjectFunctionType;
  scale?: number;
  dash?: string;
}

export interface HemisphereProps {
  centerBase: Vector3;
  radius: number; // 3D 空間中的半徑
  strokeWidth?: number;
  color?: string;
  fill?: string | PatternFillConfig;
  project?: ProjectFunctionType;
  scale?: number;
  dash?: string;
}

export interface ConeFrustumProps {
  centerBase: Vector3;
  radiusBottom: number;
  radiusTop: number;
  height: number;
  strokeWidth?: number;
  color?: string;
  fill?: string | PatternFillConfig;
  project?: ProjectFunctionType;
  scale?: number;
  dash?: string;
  topDash?: string; // 控制頂部整個橢圓
  sideDash?: string; // 控制左右兩側的母線
  bottomFrontDash?: string; // 控制底部前半(原本是實線的那一半)
}

export type ProjectFunctionType = (pt: Vector2 | Vector3) => Vector2;

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
