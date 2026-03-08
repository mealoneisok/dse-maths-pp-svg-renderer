// src/components/elements/types.tsx

export interface LabelConfig {
  text?: string | number;
  pos?: [number, number];
  align?: string;
  offset?: number;
  rotation?: number;
  color?: string;
  fontSize?: string | number;
}

export interface PointProps {
  pos: [number, number]; // 實體像素座標 [x, y]
  type?: "circle" | "cross" | "none";
  showMarker?: boolean;
  markerSize?: number;
  markerColor?: string;
  strokeWidth?: number;
  label?: LabelConfig | string | null;
}

export interface SegmentProps {
  start: [number, number];
  end: [number, number];
  strokeWidth?: number;
  color?: string;
  dash?: string | boolean;
  label?: LabelConfig | string | null;
}

export interface ArcProps {
  center: [number, number];
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
  vertices: [number, number][];
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  label?: LabelConfig | string | null;
}

export interface CircleProps {
  center: [number, number];
  radius: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  dash?: string;
  label?: LabelConfig | string | null;
}

export interface AngleMarkerProps {
  vertex: [number, number];
  p1: [number, number];
  p2: [number, number];
  size?: number;
  color?: string;
  strokeWidth?: number;
  dash?: string;
  isRightAngle?: boolean;
  label?: LabelConfig | string | null;
}

export interface PatternFillProps {
  spacing?: number;
  angle?: number;
  strokeWidth?: number;
  color?: string;
  background?: string;
}

export interface RegionPathProps {
  type: "line" | "arc";
  to: [number, number];
  radius?: number;
  largeArc?: 0 | 1;
  sweepFlag?: 0 | 1;
}

export interface RegionProps {
  start: [number, number];
  paths: RegionPathProps[];
  fill?: string | PatternFillProps;
  stroke?: string;
  strokeWidth?: number;
}

export interface GridConfig {
  length?: number | [number, number];
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
