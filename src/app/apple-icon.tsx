import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "linear-gradient(135deg, #4b5563, #374151)",
          borderRadius: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "white",
            fontSize: 110,
            fontWeight: 900,
            fontFamily: "sans-serif",
            lineHeight: 1,
            marginTop: 8,
          }}
        >
          E
        </span>
      </div>
    ),
    { ...size }
  );
}
