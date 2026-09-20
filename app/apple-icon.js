import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(145deg, #0b1220 0%, #172554 52%, #4f46e5 100%)",
          borderRadius: 38,
        }}
      >
        <div
          style={{
            width: 104,
            height: 122,
            display: "flex",
            position: "relative",
            flexDirection: "column",
            justifyContent: "center",
            gap: 12,
            padding: "0 19px",
            borderRadius: 20,
            background: "#f8fafc",
            boxShadow: "0 16px 30px rgba(2,6,23,0.32)",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 31,
              height: 31,
              display: "flex",
              background: "#c7d2fe",
              clipPath: "polygon(100% 0, 100% 100%, 0 0)",
              borderTopRightRadius: 20,
            }}
          />
          <div style={{ width: 50, height: 8, borderRadius: 99, background: "#4f46e5" }} />
          <div style={{ width: 66, height: 7, borderRadius: 99, background: "#94a3b8" }} />
          <div style={{ width: 57, height: 7, borderRadius: 99, background: "#94a3b8" }} />
          <div style={{ width: 63, height: 7, borderRadius: 99, background: "#94a3b8" }} />
          <div
            style={{
              position: "absolute",
              right: -12,
              bottom: 12,
              width: 38,
              height: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 999,
              background: "#4f46e5",
              color: "white",
              fontSize: 25,
              fontWeight: 800,
              boxShadow: "0 8px 18px rgba(49,46,129,0.35)",
            }}
          >
            +
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
