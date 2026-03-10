import { GeometryFrame3D } from "@/components/geometry/GeometryFrame3D";

export const CircularCone2012_P1_12 = () => {
  return (
    <GeometryFrame3D
      width={500}
      height={500}
      padding={40}
      solids={[
        // 1. 外部半球體 (碗狀)
        {
          type: "hemisphere",
          id: "bowl", // 我叫做 bowl
          occludedBy: ["waterCone"], // 我被 waterCone 擋住了 (底層自動幫我套用它的 Mask！)
          centerBase: [0, 0, 0],
          radius: 60,
          inverted: true,
          color: "black",
        } as any,

        // 2. 內部倒立圓錐
        {
          type: "coneFrustum",
          id: "waterCone", // 我叫做 waterCone (底層自動幫我把輪廓做成 Mask！)
          zSplit: 0, // 我在 Z=0 的地方被截斷了 (底層自動幫我把以下的線變虛線！)
          centerBase: [0, 0, -36],
          height: 96,
          radiusBottom: 48,
          radiusTop: 0,
          topDash: "none",
          bottomFrontDash: "dashed",
          dash: "dashed",
          sideDash: "solid",
          color: "black",
        } as any,
      ]}
      points={[
        {
          pos: [0, 0, -80],
          showMarker: false,
          label: { text: "Figure 3(b)", fontSize: 16 },
        },
      ]}
    />
  );
};
