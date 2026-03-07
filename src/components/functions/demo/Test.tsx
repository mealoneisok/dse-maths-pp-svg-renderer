// src/components/functions/demo/Test.tsx

import React from "react";
import { Cartesian } from "../Cartesian";

export const Test: React.FC<{ canvasWidth: number }> = ({ canvasWidth }) => {
  return (
    <Cartesian
      width={canvasWidth}
      height={400}
      padding={0}
      showOrigin={true}
      xAxis={{
        domain: [-5, 5],
        step: 1,
        label: "x",
        //showRotationArrow: true,
        grid: true, // 開啟 X 軸的十字網格
        showArrow: true,
      }}
      yAxis={{
        domain: [-4, 4],
        step: 1,
        label: "y",
        //showRotationArrow: true,
        grid: true, // 開啟 Y 軸的十字網格
      }}
      graphs={[
        {
          fn: (x) => 0.5 * x - 1,
          domain: [-4, 4],
          color: "blue",
          label: {
            text: "y = \\frac{1}{2}x - 1",
            x: 4,
            align: "bottom-right",
          },
        },
      ]}
      points={[
        {
          mathX: 2,
          mathY: 0,
          type: "circle",
          color: "red",
          size: 5,
          label: { text: "A(2, 0)", align: "top-left" },
        },
        {
          mathX: -2,
          mathY: -2,
          type: "cross",
          color: "green",
          size: 6,
          label: { text: "B", align: "bottom-right" },
        },
      ]}
    />
  );
};
