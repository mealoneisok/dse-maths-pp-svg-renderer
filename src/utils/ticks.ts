// src/utils/ticks.ts

import { type AxisConfig, type TickMapType } from "../components/types";
import { type TickValue, type Vector2 } from "../components/elements";
import { EPSILON } from "../constants";

export function createLinearScale(
  domainMin: number,
  domainMax: number,
  rangeMin: number,
  rangeMax: number,
) {
  return function (value: number): number {
    const ratio = (value - domainMin) / (domainMax - domainMin);
    return rangeMin + ratio * (rangeMax - rangeMin);
  };
}

export function formatTick(
  val: number | string,
  tickMap?: TickMapType | null,
): string | number {
  if (!tickMap) return val;
  if (tickMap instanceof Map) return tickMap.has(val) ? tickMap.get(val)! : val;
  return (tickMap as Record<string | number, string | number>)[val] !==
    undefined
    ? (tickMap as Record<string | number, string | number>)[val]
    : val;
}

export interface ParsedTicksResult {
  tickValues: TickValue[];
  tickMap: TickMapType | null;
}

export function parseTicks(axis: AxisConfig): ParsedTicksResult {
  const { domain, step, ticks } = axis;
  let tickValues: TickValue[] = [];
  let tickMap: TickMapType | null = axis.tickMap || null;

  if (!domain && Array.isArray(ticks)) {
    tickValues = ticks.map((val, i) => ({
      val,
      t: (i + 0.5) / ticks.length,
      isZero: false,
    }));
  } else if (domain) {
    const [minVal, maxVal] = domain;
    const range = maxVal - minVal;

    if (Array.isArray(ticks)) {
      // 增加防呆：過濾掉小於 minVal 或大於 maxVal 的 tick
      tickValues = ticks
        .filter((val) => {
          const numVal = Number(val);
          return numVal >= minVal && numVal <= maxVal;
        })
        .map((val) => ({
          val: typeof val === "string" ? val : val,
          t: (Number(val) - minVal) / range,
          isZero: Number(val) === 0,
        }));
    } else if (typeof ticks === "object" && ticks !== null) {
      tickMap = ticks as TickMapType;
      // 增加防呆：過濾掉小於 minVal 或大於 maxVal 的 tick 鍵值
      tickValues = Object.keys(ticks)
        .map(Number)
        .filter((val) => val >= minVal && val <= maxVal)
        .map((val) => ({
          val,
          t: (val - minVal) / range,
          isZero: val === 0,
        }));
    } else if (step) {
      const numSteps = Math.floor(range / step);
      for (let i = 0; i <= numSteps; i++) {
        const val = minVal + i * step;
        const cleanVal = Math.round(val * 1e8) / 1e8;
        if (cleanVal > maxVal) break;
        tickValues.push({
          val: cleanVal,
          t: (cleanVal - minVal) / range,
          isZero: cleanVal === 0,
        });
      }
    }
  }
  return { tickValues, tickMap };
}

export const generateTicks = (domain: Vector2, step: number): TickValue[] => {
  const ticks: TickValue[] = [];
  const min = Math.ceil(domain[0] / step) * step;
  for (let v = min; v <= domain[1]; v += step) {
    ticks.push({
      val: parseFloat(v.toPrecision(12)),
      t: (v - domain[0]) / (domain[1] - domain[0]),
      isZero: Math.abs(v) < EPSILON,
    });
  }
  return ticks;
};
