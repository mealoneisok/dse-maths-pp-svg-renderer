// src/components/elements/Label.tsx

import { LAYOUT } from "../../constants";
import { measureLatex } from "../../utils/measure";
import katex from "katex";
import type { Vector2, Vector3 } from "./types";

interface LabelProps {
  pos: Vector2 | Vector3;
  align?: string;
  offset?: number;
  text?: string | number | null;
  color?: string;
  rotation?: number;
  fontSize?: string | number;
  debug?: boolean;
}

export const Label: React.FC<LabelProps> = ({
  pos,
  align = "center",
  offset = LAYOUT.DEFAULT_OFFSET,
  text,
  color = LAYOUT.DEFAULT_COLOR,
  rotation = 0,
  fontSize = LAYOUT.DEFAULT_AXIS_LABEL_FONT_SIZE,
  debug = false,
}) => {
  if (!pos || !Array.isArray(pos) || pos.length < 2) return null;
  if (!text && text !== 0) return null;
  const strText = String(text);

  // 🌟 陣列解構天生支援「只取前兩個」：就算傳入的是 [x, y, z]，這裡也只會抓出 x 和 y！
  const [x, y] = pos;

  const { width: boxWidth, height: boxHeight } = measureLatex(
    strText,
    fontSize,
  );

  let foreignX = x,
    foreignY = y;
  if (align.includes("top")) foreignY = y - offset - boxHeight;
  else if (align.includes("bottom")) foreignY = y + offset;
  else foreignY = y - boxHeight / 2;

  if (align.includes("left")) foreignX = x - offset - boxWidth;
  else if (align.includes("right")) foreignX = x + offset;
  else foreignX = x - boxWidth / 2;

  const html = katex.renderToString(strText, {
    throwOnError: false,
    displayMode: false,
  });
  const transformStr =
    rotation !== 0 ? `rotate(${rotation} ${x} ${y})` : undefined;

  return (
    <g transform={transformStr}>
      {debug && (
        <>
          {/* 畫出 measureLatex 算出來的真實邊框 (虛線) */}
          <rect
            x={foreignX}
            y={foreignY}
            width={boxWidth}
            height={boxHeight}
            fill="rgba(0, 255, 0, 0.1)"
            stroke="red"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
        </>
      )}

      <foreignObject
        x={foreignX}
        y={foreignY}
        width={boxWidth}
        height={boxHeight}
        style={{ pointerEvents: "none", overflow: "visible" }}
      >
        <div
          style={{
            fontSize,
            color,
            margin: 0,
            padding: 0,
            lineHeight: 1,
            whiteSpace: "nowrap",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </foreignObject>
    </g>
  );
};
