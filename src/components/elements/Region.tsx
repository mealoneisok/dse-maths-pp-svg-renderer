// src/components/elements/Region.tsx

import React from "react";
import { type RegionProps } from "./types";
import { normalizeFill } from "../../utils/type";
import { PatternFill } from "./PatternFill";

export const Region: React.FC<RegionProps> = ({
  start,
  paths,
  fill = "none",
  stroke = "none",
  strokeWidth = 0,
}) => {
  const { fillValue, hatchDef } = normalizeFill(fill);

  // 2. 計算路徑 d
  let d = `M ${start[0]} ${start[1]}`;
  paths.forEach((p) => {
    if (p.type === "line") {
      d += ` L ${p.to[0]} ${p.to[1]}`;
    } else if (p.type === "arc") {
      d += ` A ${p.radius} ${p.radius} 0 ${p.largeArc || 0} ${p.sweepFlag || 0} ${p.to[0]} ${p.to[1]}`;
    }
  });
  d += " Z";

  return (
    <>
      {/* ✨ 3. 如果這個 Region 有專屬的網底，直接在旁邊塞入 defs */}
      {hatchDef && (
        <defs>
          <PatternFill {...hatchDef} />
        </defs>
      )}
      {/* ✨ 4. 套用解析後的 fillValue */}
      <path d={d} fill={fillValue} stroke={stroke} strokeWidth={strokeWidth} />
    </>
  );
};
