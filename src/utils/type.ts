// src/utils/type.ts

import {
  type LabelConfig,
  type PatternFillConfig,
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
  // 1. 處理空值與取消虛線的情況
  if (!dash || dash === "solid" || dash === "none") {
    return undefined;
  }

  // 2. 處理預設的關鍵字與布林值
  if (dash === true || dash === "dashed") return "6,4";
  if (dash === "dash-dot") return "15,6,4,6";
  if (dash === "dotted") return "2,3";

  // 3. 處理自訂字串 (如 "14 2" 或 "14, 2" 或 "14,2")
  if (typeof dash === "string") {
    return dash
      .trim()
      .replace(/[\s,-]+/g, ",") // 將一個以上的空格、逗號或連字號，統一替換成單一逗號
      .replace(/^,|,$/g, ""); // 移除頭尾可能多出的逗號
  }

  return undefined;
};

export const normalizePadding = (
  padding?: number | [number, number, number, number],
): [number, number, number, number] => {
  if (typeof padding === "number") return [padding, padding, padding, padding];
  else if (Array.isArray(padding)) return padding;
  else return [0, 0, 0, 0];
};

// 根據參數生成唯一的 ID (過濾掉 # 等特殊符號，並加入防撞名機制)
export const generatePatternId = (config: PatternFillConfig): string => {
  const type = config.type ?? "diagonal";
  const spacing = config.spacing ?? LAYOUT.DEFAULT_HATCH_SPACING;
  const strokeWidth = config.strokeWidth ?? LAYOUT.DEFAULT_STROKE_WIDTH;
  const color = (config.color ?? LAYOUT.DEFAULT_HATCH_COLOR).replace(
    /[^a-zA-Z0-9]/g,
    "",
  );
  const bg = (config.background ?? LAYOUT.DEFAULT_HATCH_BACKGROUND).replace(
    /[^a-zA-Z0-9]/g,
    "",
  );

  // ✨ 1. 使用 normalizeDash 統一處理 boolean 與 string，避開型別錯誤
  const parsedDash = normalizeDash(config.dash);

  // ✨ 2. 如果有 dash，把逗號換成連字號作為 ID 的一部分 (例如 "14,2" 變成 "14-2")
  const dashIdPart = parsedDash ? parsedDash.replace(/,/g, "-") : "solid";

  // === 針對波浪圖案的 ID 產生邏輯 ===
  if (type === "wave") {
    const waveAmplitude = config.waveAmplitude ?? 3;
    const waveLength = config.waveLength ?? 20;

    return `pat-wave-${spacing}-${waveLength}-${waveAmplitude}-${strokeWidth}-${color}-${bg}-${dashIdPart}`;
  }

  // === 針對對角線圖案的 ID 產生邏輯 ===
  const angle = config.angle ?? LAYOUT.DEFAULT_HATCH_ANGLE;
  // ✨ 3. 把 dashIdPart 也加進對角線的 ID，防止虛線與實線圖案撞名
  return `pat-diag-${spacing}-${angle}-${strokeWidth}-${color}-${bg}-${dashIdPart}`;
};

export const normalizeFill = (fill?: string | PatternFillConfig) => {
  // 1. 如果沒有提供，預設透明
  if (!fill) {
    return { fillValue: "transparent", patternDef: null };
  }

  // 2. 如果是字串，直接當作顏色處理
  if (typeof fill === "string") {
    // 兼容之前手動傳入 "default-hatch" 的情況
    if (fill === "default-hatch") {
      const id = generatePatternId({ type: "diagonal" });
      return {
        fillValue: `url(#${id})`,
        patternDef: { id, type: "diagonal" as const },
      };
    }
    return { fillValue: fill, patternDef: null };
  }

  // 3. 如果是 PatternFillConfig 物件，產生 ID 與定義
  const id = generatePatternId(fill);
  return {
    fillValue: `url(#${id})`,
    patternDef: { ...fill, id },
  };
};
