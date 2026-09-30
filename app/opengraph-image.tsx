import { ImageResponse } from "next/og";
import geo from "@/content/geo/geo.generated.json";

export const alt = "Digital Bangladesh — a living journey through land, water, history & people";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social card drawn from the same geography as the site: the silhouette and its rivers. */
export default function OpengraphImage() {
  const [, , w, h] = geo.viewBox;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#07090a", color: "#f3ede1", padding: 64, position: "relative" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", width: 640 }}>
          <div style={{ fontSize: 22, letterSpacing: 6, opacity: 0.6, textTransform: "uppercase" }}>A living journey</div>
          <div style={{ fontSize: 112, lineHeight: 0.9, marginTop: 20 }}>Digital</div>
          <div style={{ fontSize: 112, lineHeight: 0.9 }}>Bangladesh</div>
          <div style={{ fontSize: 26, marginTop: 28, opacity: 0.8, textTransform: "uppercase", letterSpacing: 3 }}>Land · Water · History · People</div>
        </div>
        <svg width={(560 * w) / h} height={560} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", right: 70, top: 35 }}>
          <path d={geo.outline} fill="#141a17" stroke="#d9c7a3" strokeWidth={2} />
          {geo.rivers.map((r) => (
            <path key={r.id} d={r.path} fill="none" stroke="#8cc7da" strokeWidth={3} />
          ))}
        </svg>
      </div>
    ),
    size,
  );
}
