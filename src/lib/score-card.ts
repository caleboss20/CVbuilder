import type { CvReport } from "./cv-check";

/*
 * Draws the shareable "My CV scored 86/100" picture with the canvas, in the browser.
 * No server and no stored image: it is built when the student asks for it.
 *
 * Privacy: the card shows only the score, the band and the area percentages. It
 * never includes the student's name, contact details or any CV text.
 */

const WIDTH = 1080;
const HEIGHT = 1350; // portrait: it fills a phone screen in WhatsApp and Instagram stories

const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

/** Ring and label colour for each score band. */
const TONES = { strong: "#34d399", good: "#7c80ff", weak: "#fbbf24" } as const;

/** Draws a rounded rectangle path, with a fallback for browsers without ctx.roundRect. */
function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Builds the picture and returns it as a PNG. `host` is the site's address, e.g. "cv11.com". */
export function drawScoreCard(report: Pick<CvReport, "score" | "band" | "areas">, host: string): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.reject(new Error("Canvas is not available"));

  const tone = TONES[report.band.tone];
  ctx.textAlign = "center";

  // Background
  const bg = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  bg.addColorStop(0, "#04051a");
  bg.addColorStop(0.6, "#10133a");
  bg.addColorStop(1, "#2f32b0");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Logo and name
  ctx.fillStyle = "#ffffff";
  roundedRect(ctx, 80, 80, 72, 72, 18);
  ctx.fill();
  ctx.fillStyle = "#04051a";
  ctx.font = `700 46px ${FONT}`;
  ctx.fillText("C", 116, 133);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.font = `700 44px ${FONT}`;
  ctx.fillText("CV11", 172, 132);
  ctx.textAlign = "center";

  // Heading
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = `500 46px ${FONT}`;
  ctx.fillText("My CV scored", WIDTH / 2, 290);

  // Score ring
  const cx = WIDTH / 2;
  const cy = 590;
  const radius = 230;
  ctx.lineWidth = 44;
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = tone;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * report.score) / 100);
  ctx.stroke();

  // The number and "/100" sit side by side, centred together inside the ring
  ctx.textAlign = "left";
  ctx.font = `700 170px ${FONT}`;
  const scoreWidth = ctx.measureText(String(report.score)).width;
  ctx.font = `500 46px ${FONT}`;
  const suffixWidth = ctx.measureText("/100").width;
  const gap = 8;
  const startX = cx - (scoreWidth + gap + suffixWidth) / 2;
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 170px ${FONT}`;
  ctx.fillText(String(report.score), startX, cy + 56);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = `500 46px ${FONT}`;
  ctx.fillText("/100", startX + scoreWidth + gap, cy + 56);
  ctx.textAlign = "center";

  // Band
  ctx.fillStyle = tone;
  ctx.font = `700 66px ${FONT}`;
  ctx.fillText(report.band.label, cx, 925);

  // Area bars
  const areas = report.areas.slice(0, 4);
  const barLeft = 190;
  const barWidth = WIDTH - barLeft * 2;
  areas.forEach((a, i) => {
    const y = 1020 + i * 62;
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.font = `500 30px ${FONT}`;
    ctx.fillText(a.area, barLeft, y);
    ctx.textAlign = "right";
    ctx.fillText(`${a.percent}%`, barLeft + barWidth, y);
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    roundedRect(ctx, barLeft, y + 12, barWidth, 10, 5);
    ctx.fill();
    ctx.fillStyle = tone;
    roundedRect(ctx, barLeft, y + 12, Math.max(10, (barWidth * a.percent) / 100), 10, 5);
    ctx.fill();
  });
  ctx.textAlign = "center";

  // Call to action
  ctx.fillStyle = "#ffffff";
  ctx.font = `600 40px ${FONT}`;
  ctx.fillText("Check your CV free", cx, HEIGHT - 120);
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = `500 32px ${FONT}`;
  ctx.fillText(`${host}/cv-checker`, cx, HEIGHT - 70);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not make the image"))), "image/png");
  });
}
