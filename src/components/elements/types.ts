// src/components/elements/types.tsx

export interface LabelConfig {
  text?: string | number;
  pos?: [number, number];
  align?: string;
  offset?: number;
  rotation?: number;
  color?: string;
}

export interface PointProps {
  pos: [number, number]; // 實體像素座標 [x, y]
  type?: "circle" | "cross" | "none";
  size?: number;
  color?: string;
  strokeWidth?: number;
  label?: LabelConfig;
}

export interface SegmentProps {
  start: [number, number];
  end: [number, number];
  strokeWidth?: number;
  color?: string;
  dash?: string | boolean;
  label?: LabelConfig | string | null;
}

export interface GridConfig {
  length?: number | [number, number];
  direction?: "positive" | "negative" | "both";
  skipZero?: boolean;
  color?: string;
  dash?: string | boolean;
}

export interface TitleConfig {
  text: string;
  pos?: [number, number];
  align?: string;
  offset?: number;
  rotation?: number;
}

export interface TickValue {
  val: number | string;
  t: number;
  isZero: boolean;
}
