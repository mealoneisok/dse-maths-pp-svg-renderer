// src/utils/type.ts

import {
  type LabelConfig,
  type PatternFillProps,
} from "../components/elements";
import { LAYOUT } from "../constants";

export const normalizeLabel = (
  label?: LabelConfig | string | number | null,
  defaultConfig?: LabelConfig,
): LabelConfig | undefined => {
  // 1. 處理 null 或 undefined：直接回傳預設參數
  if (label === null || label === undefined) {
    return defaultConfig;
  }

  // 2. 處理字串或數字：包裝成物件，並與預設參數合併
  if (typeof label === "string" || typeof label === "number") {
    return {
      ...defaultConfig,
      text: label,
    };
  }

  // 3. 處理已是物件的情況：與預設參數合併（外部傳入的 label 優先級較高）
  return {
    ...defaultConfig,
    ...label,
  };
};

export const normalizeDash = (dash?: string | boolean): string | undefined => {
  if (dash === true || dash === "dashed") return "6, 4";
  else if (dash === "dash-dot") return "15,6,4,6";
  else if (dash === "dotted") return "2, 3";
  else if (dash && dash !== "solid" && dash !== "none") return dash as string;
  return undefined;
};

export const normalizePadding = (
  padding?: number | [number, number, number, number],
): [number, number, number, number] => {
  if (typeof padding === "number") return [padding, padding, padding, padding];
  else if (Array.isArray(padding)) return padding;
  else return [0, 0, 0, 0];
};

// 根據參數生成唯一的 ID (過濾掉 # 等特殊符號)
export const generateHatchId = (config: PatternFillProps): string => {
  const spacing = config.spacing ?? LAYOUT.DEFAULT_HATCH_SPACING;
  const angle = config.angle ?? LAYOUT.DEFAULT_HATCH_ANGLE;
  const strokeWidth = config.strokeWidth ?? LAYOUT.DEFAULT_STROKE_WIDTH;
  const color = (config.color ?? LAYOUT.DEFAULT_HATCH_COLOR).replace(
    /[^a-zA-Z0-9]/g,
    "",
  );
  const bg = (config.background ?? LAYOUT.DEFAULT_HATCH_BACKGROUND).replace(
    /[^a-zA-Z0-9]/g,
    "",
  );

  return `hatch-${spacing}-${angle}-${strokeWidth}-${color}-${bg}`;
};

export const normalizeFill = (fill?: string | PatternFillProps) => {
  // 1. 如果沒有提供，預設透明
  if (!fill) {
    return { fillValue: "transparent", hatchDef: null };
  }

  // 2. 如果是字串，直接當作顏色處理
  if (typeof fill === "string") {
    // 兼容之前手動傳入 "default-hatch" 的情況 (可選)
    if (fill === "default-hatch") {
      const id = generateHatchId({}); // 使用全預設值生成 ID
      return { fillValue: `url(#${id})`, hatchDef: { id } };
    }
    return { fillValue: fill, hatchDef: null };
  }

  // 3. 如果是 HatchConfig 物件，產生 ID 與定義
  const id = generateHatchId(fill);
  return {
    fillValue: `url(#${id})`,
    hatchDef: { ...fill, id },
  };
};
