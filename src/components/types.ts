// src/components/types.tsx

import {
  type GridConfig,
  type LabelConfig,
  type TitleConfig,
  type TickValue,
} from "./elements";

export type TickMapType =
  | Record<string | number, string | number>
  | Map<string | number, string | number>;

export interface AxisConfig {
  domain?: [number, number];
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
  title?: string | TitleConfig;
  showLabel?: boolean;
  label?: string | LabelConfig;
  tickLength?: number;
  tickLineAlign?: number;
  tickTextPos?: string;
  skipZero?: boolean;
}

export interface ParsedAxisConfig extends AxisConfig {
  tickValues?: TickValue[];
}

export interface CartesianAxisConfig extends AxisConfig {
  showRotationArrow?: boolean;
}
