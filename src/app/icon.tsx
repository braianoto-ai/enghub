import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
          borderRadius: 112,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "white",
            fontSize: 300,
            fontWeight: 900,
            fontFamily: "sans-serif",
            lineHeight: 1,
            marginTop: 20,
          }}
        >
          E
        </span>
      </div>
    ),
    { ...size }
  );
}
