import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 112,
        }}
      >
        <div
          style={{
            width: 296,
            height: 348,
            display: "flex",
            position: "relative",
            flexDirection: "column",
            justifyContent: "center",
            gap: 34,
            padding: "0 54px",
            borderRadius: 58,
            background: "#f8fafc",
            boxShadow: "0 46px 82px rgba(2,6,23,0.32)",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 88,
              height: 88,
              display: "flex",
              background: "#c7d2fe",
              clipPath: "polygon(100% 0, 100% 100%, 0 0)",
              borderTopRightRadius: 58,
            }}
          />
          <div style={{ width: 142, height: 22, borderRadius: 99, background: "#4f46e5" }} />
          <div style={{ width: 188, height: 20, borderRadius: 99, background: "#94a3b8" }} />
          <div style={{ width: 162, height: 20, borderRadius: 99, background: "#94a3b8" }} />
          <div style={{ width: 178, height: 20, borderRadius: 99, background: "#94a3b8" }} />
          <div
            style={{
              position: "absolute",
              right: -34,
              bottom: 34,
              width: 108,
              height: 108,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 999,
              background: "#4f46e5",
              color: "white",
              fontSize: 74,
              fontWeight: 800,
              boxShadow: "0 22px 46px rgba(49,46,129,0.35)",
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
