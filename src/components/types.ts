// src/components/types.tsx

import {
  type GridConfig,
  type LabelConfig,
  type TickValue,
  type Vector2,
} from "./elements";

export type TickMapType =
  | Record<string | number, string | number>
  | Map<string | number, string | number>;

export interface AxisConfig {
  domain?: Vector2;
  step?: number;
  ticks?: (number | string)[];
  tickMap?: TickMapType | null;
  showNumbers?: boolean;
  showTickLines?: boolean;
  labelStep?: number;
  showArrow?: boolean;
  grid?: boolean | GridConfig;
  extendEnd?: number;
  extendStart?: number;
  title?: string | LabelConfig | undefined;
  showLabel?: boolean;
  label?: string | LabelConfig | undefined;
  tickLength?: number;
  tickLineAlign?: number;
  tickTextPos?: string;
  skipZero?: boolean;
}

export interface ParsedAxisConfig extends AxisConfig {
  tickValues?: TickValue[];
}

export interface AxisRenderConfig extends ParsedAxisConfig {
  start: Vector2;
  end: Vector2;
  tickTextPos: string;
  grid?: GridConfig;
}

export interface CartesianAxisConfig extends AxisConfig {
  showRotationArrow?: boolean;
}

export interface CartesianAxisRenderConfig extends CartesianAxisConfig {
  start: Vector2;
  end: Vector2;
  tickValues: TickValue[];
  extendStart: number;
  extendEnd: number;
  tickTextPos: string;
  grid?: GridConfig;
  label?: LabelConfig;
}
