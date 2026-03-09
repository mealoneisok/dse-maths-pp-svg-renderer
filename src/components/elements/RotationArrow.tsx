// src/components/elements/RotationArrow.tsx

import type { Vector2 } from "./types";

interface RotationArrowProps {
  pos: Vector2;
  angle: number; // Radian
  size?: number;
  layer?: "all" | "front" | "back";
}

export const RotationArrow: React.FC<RotationArrowProps> = ({
  pos,
  angle,
  size = 45,
  layer = "all",
}) => {
  const [x, y] = pos;
  const scale = size / 667;
  const deg = angle * (180 / Math.PI) + 90;

  const showBack = layer === "back" || layer === "all";
  const showFront = layer === "front" || layer === "all";

  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${deg}) scale(${scale}) translate(-333.5, -322)`}
    >
      <g transform="translate(-256 -597)">
        <g transform="matrix(-1 0 0 1 919.5 600.5)">
          {showBack && (
            <>
              <path
                fill="#CDCDCD"
                fillRule="evenodd"
                d="M 658 159.5 C 396.4 159.5, 159.6 206.5, 54.9 279.1 C -90.4 178.2, 61.7 60.7, 394.8 16.6 C 477.8 5.7, 567.4 0, 658 0 Z"
              />
              <path
                stroke="#000000"
                strokeWidth="6.9"
                strokeMiterlimit="8"
                fill="none"
                fillRule="evenodd"
                d="M 0 199.4 C 0 89.3, 294.6 0, 658 0 L 658 159.5 C 396.4 159.5, 159.6 206.5, 54.9 279.1"
              />
            </>
          )}
          {showFront && (
            <>
              <path
                fill="#FFFFFF"
                fillRule="evenodd"
                d="M 0 199.4 C 0 290.9, 205.5 370.6, 498.5 392.8 L 498.5 313.1, 658 478.5, 498.5 632.1, 498.5 552.3 C 205.5 530.1, 0 450.4, 0 358.9 Z"
              />
              <path
                stroke="#000000"
                strokeWidth="6.9"
                strokeMiterlimit="8"
                fill="none"
                fillRule="evenodd"
                d="M 0 199.4 C 0 290.9, 205.5 370.6, 498.5 392.8 L 498.5 313.1, 658 478.5, 498.5 632.1, 498.5 552.3 C 205.5 530.1, 0 450.4, 0 358.9 Z"
              />
            </>
          )}
        </g>
      </g>
    </g>
  );
};
