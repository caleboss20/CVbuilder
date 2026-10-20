import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";
import { templates } from "@/lib/templates";

/**
 * The picture shown when the site is shared on WhatsApp, X, LinkedIn and so on.
 * Next builds it into a PNG at build time, so there is no image file to maintain.
 */
export const alt = "CV11: a free CV builder for students and graduates in Ghana";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #04051a 0%, #10133a 55%, #2f32b0 140%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#04051a",
              fontSize: 40,
              fontWeight: 700,
            }}
          >
            C
          </div>
          <div style={{ fontSize: 40, fontWeight: 700 }}>CV11</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, maxWidth: 900 }}>
            Build a professional CV in minutes
          </div>
          <div style={{ fontSize: 32, color: "#a5a8ff" }}>{siteConfig.download.enabled ? "Free to build, for students and graduates in Ghana" : "Free for students and graduates in Ghana"}</div>
        </div>

        <div style={{ display: "flex", gap: 14, fontSize: 24, color: "rgba(255,255,255,0.75)" }}>
          <span>{templates.length} templates</span>
          <span>·</span>
          <span>PDF and Word</span>
          <span>·</span>
          <span>No watermark</span>
        </div>
      </div>
    ),
    size,
  );
}
