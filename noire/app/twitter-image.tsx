import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = `${site.name} — ${site.descriptor}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#F5F2EC",
        color: "#11110F",
        fontFamily: "serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 24,
          fontFamily: "sans-serif",
          letterSpacing: 2,
        }}
      >
        <span>{site.wordmark}</span>
        <span style={{ color: "#6D6A64" }}>{site.location.toUpperCase()}</span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: 92,
          lineHeight: 0.98,
          letterSpacing: -2,
        }}
      >
        <span>Identities, exhibitions</span>
        <span>
          and rooms that{" "}
          <span style={{ color: "#D9573F", fontStyle: "italic", marginLeft: 20 }}>
            hold attention.
          </span>
        </span>
      </div>
      <div style={{ display: "flex", fontSize: 22, fontFamily: "sans-serif", color: "#6D6A64" }}>
        {site.descriptor}
      </div>
    </div>,
    size,
  );
}
