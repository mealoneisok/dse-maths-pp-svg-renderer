// src/components/geometry/demo/Pyramid2012_P1_18.tsx

import { GeometryFrame3D, type Vector3 } from "../GeometryFrame3D";

export const Pyramid2012_P1_18 = () => {
  const L = 20;
  const h = 25;

  // Coordinates
  const A: Vector3 = [0, 0, 0];
  const B: Vector3 = [L, 0, 0];
  const C: Vector3 = [L, L, 0];
  const D: Vector3 = [0, L, 0];
  const V: Vector3 = [L / 2, L / 2, h];

  // Proportional points
  const t = 0.45;
  const P: Vector3 = [
    V[0] + (A[0] - V[0]) * t,
    V[1] + (A[1] - V[1]) * t,
    V[2] + (A[2] - V[2]) * t,
  ];
  const Q: Vector3 = [
    V[0] + (D[0] - V[0]) * t,
    V[1] + (D[1] - V[1]) * t,
    V[2] + (D[2] - V[2]) * t,
  ];

  const points = [
    { pos: V, label: { text: "V", offset: 5, align: "top" } },
    { pos: A, label: { text: "A", offset: 5, align: "bottom-left" } },
    { pos: B, label: { text: "B", offset: 5, align: "bottom-right" } },
    { pos: C, label: { text: "C", offset: 5, align: "right" } },
    { pos: D, label: { text: "D", offset: 5, align: "bottom" } },
  ];

  const strokeColor = "#111827";

  return (
    <div className="flex flex-row justify-center items-center gap-16 bg-gray-50">
      {/* ---------------- Figure 5(a) ---------------- */}
      <div className="flex flex-col items-center">
        <GeometryFrame3D
          width={200}
          points={points}
          solids={[
            {
              type: "lofted",
              // Note the CCW order: A -> B -> C -> D
              baseVertices: [
                [0, 0],
                [L, 0],
                [L, L],
                [0, L],
              ],
              height: h,
              topScale: 0, // 0 forces it into a pyramid
              shift: [L / 2, L / 2], // Shifts the apex to the center
              color: strokeColor,
            },
          ]}
        />
        <span className="mt-6 font-serif text-lg">Figure 5(a)</span>
      </div>
      <div className="flex flex-col items-center">
        {/* ---------------- Figure 5(b) ---------------- */}
        <GeometryFrame3D
          width={200}
          points={points}
          solids={[
            {
              type: "polyhedron",
              vertices: [A, B, C, D, P, Q], // Index: 0, 1, 2, 3, 4, 5
              faces: [
                [0, 3, 2, 1], // 底面 ABCD (由下往上看逆時針)
                [0, 1, 4], // 正面 ABP
                [1, 2, 5, 4], // 切割面 BCQP
                [2, 3, 5], // 背面 CDQ
                [0, 4, 5, 3], // 側面 APQD
              ],
              color: strokeColor,
            },
          ]}
          segments={[
            { start: V, end: P, color: "#4b5563", dash: "dotted" },
            { start: V, end: Q, color: "#4b5563", dash: "dotted" },
            { start: V, end: B, color: "#4b5563", dash: "dotted" },
            { start: V, end: C, color: "#4b5563", dash: "dotted" },
          ]}
        />
        <span className="mt-6 font-serif text-lg">Figure 5(b)</span>
      </div>
    </div>
  );
};
