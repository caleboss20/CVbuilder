/**
 * The third set of certificate designs: twelve landscape designs matched to the reference templates the
 * owner chose. The artwork (every band, wave, stripe, frame and corner) is traced from the references
 * themselves (certificate-traced.ts) so the shapes match, and is recoloured when another colour is
 * picked. The ribbons, text and the optional rosette are drawn here on top. Seven designs carry a
 * rosette or badge ("BEST AWARD") that the organiser can switch off or reword (`badge`).
 */

import type { PDFFont, PDFPage } from "pdf-lib";
import { layout, type DesignDef } from "./certificate-design-types";
import { TRACED } from "./certificate-traced";
import { PAGE_H, PAGE_W, Y, darken, goldBetween, hex, lighten, line, polygon, roundedSquare, shadeBetween, softShadow, type Paint, type Point } from "./certificate-draw";

const W = PAGE_W;
const H = PAGE_H;

// ---------------------------------------------------------------------------- recolouring

/** Hue (0-360), saturation and lightness (0-1) of a #rrggbb colour. */
function toHsl(color: string): [number, number, number] {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16) / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn;
  const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}

function fromHsl(h: number, s: number, l: number): string {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return "#" + [f(0), f(8), f(4)].map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("");
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Moves the coloured parts of the artwork (the ones near the design's own colour) to the picked colour:
 * same shading, new hue. Greys, blacks, whites and other accent colours such as gold stay as they are.
 */
function retint(color: string, accent: string, main: string): string {
  if (main.toLowerCase() === accent.toLowerCase()) return color;
  const [h, s, l] = toHsl(color);
  const [ha, sa, la] = toHsl(accent);
  const [hm, sm, lm] = toHsl(main);
  const apart = Math.abs(((h - ha + 540) % 360) - 180);
  if (apart > 36 || s < 0.25) return color;
  return fromHsl(hm, clamp01(s * (sm / Math.max(sa, 0.05))), clamp01(l + (lm - la) * 0.85));
}

// ---------------------------------------------------------------------------- the traced artwork

/** Draws a traced design's background and shapes, recoloured from the design's own colour towards `main`. */
function drawTraced(page: PDFPage, id: string, main: string) {
  const t = TRACED[id];
  const tint = (c: string) => retint(c, t.accent, main);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: hex(t.bg[0]) });
  if (t.bg[0] !== t.bg[1]) {
    polygon(page, [[0, 0], [W, 0], [W, H], [0, H]], shadeBetween([0, 0], [W, H], t.bg[0], t.bg[1]));
  }
  for (const s of t.s) {
    if ("l" in s) {
      line(page, [s.l[0] * W, s.l[1] * H], [s.l[2] * W, s.l[3] * H], Math.max(0.8, s.t * 1.5), tint(s.f));
      continue;
    }
    const pts: Point[] = [];
    for (let i = 0; i < s.p.length; i += 2) pts.push([s.p[i] * W, s.p[i + 1] * H]);
    const paint: Paint = s.g ? shadeBetween([s.g[0] * W, s.g[1] * H], [s.g[2] * W, s.g[3] * H], tint(s.g[4]), tint(s.g[5])) : tint(s.f);
    polygon(page, pts, paint);
  }
}

// ---------------------------------------------------------------------------- rosette and ribbon

type Rosette = {
  cx: number; cy: number; r: number;
  rimLight: string; rimDark: string; disc: string; ring: string; text: string;
  tails?: Paint; lines: string[]; font: PDFFont;
};

/** A scalloped award rosette with a coloured rim, a dark or coloured disc, optional ribbon tails and up to two lines of words. */
function rosette(page: PDFPage, o: Rosette) {
  const { cx, cy, r } = o;
  softShadow(page, cx, cy, r);
  if (o.tails) {
    const tail = (side: 1 | -1): Point[] => [
      [cx + side * 0.6 * r, cy + 0.5 * r],
      [cx + side * 0.05 * r, cy + 0.8 * r],
      [cx + side * 0.35 * r, cy + 1.95 * r],
      [cx + side * 0.62 * r, cy + 1.62 * r],
      [cx + side * 0.95 * r, cy + 1.85 * r],
    ];
    polygon(page, tail(-1), o.tails);
    polygon(page, tail(1), o.tails);
  }
  const rim: Point[] = Array.from({ length: 56 }, (_, i) => {
    const a = (i * Math.PI) / 28;
    const rad = i % 2 === 0 ? r : r * 0.93;
    return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
  });
  polygon(page, rim, { kind: "radial", at: [cx - r * 0.3, cy - r * 0.3], r0: 0, r1: r * 1.5, stops: [[0, o.rimLight], [1, o.rimDark]] });
  page.drawCircle({ x: cx, y: Y(cy), size: r * 0.8, borderColor: hex(o.ring), borderWidth: 1.4 });
  page.drawCircle({ x: cx, y: Y(cy), size: r * 0.72, color: hex(o.disc) });

  // The words, shrunk until the widest line fits inside the ring
  let size = r * 0.3;
  const widest = () => Math.max(...o.lines.map((l) => o.font.widthOfTextAtSize(l, size)));
  while (size > 4 && widest() > r * 1.15) size -= 0.5;
  o.lines.forEach((word, i, all) => {
    const w = o.font.widthOfTextAtSize(word, size);
    page.drawText(word, { x: cx - w / 2, y: Y(cy + size * 0.35 + (i - (all.length - 1) / 2) * size * 1.3), size, font: o.font, color: hex(o.text) });
  });
}

/** A ribbon band with swallow-tail ends, centred on `cy`, between the page fractions `x0` and `x1`. */
function ribbon(page: PDFPage, x0: number, x1: number, cy: number, height: number, paint: Paint, notch = 10) {
  const a = x0 * W, b = x1 * W, top = cy - height / 2, bottom = cy + height / 2;
  polygon(page, [[a, top], [b, top], [b - notch, cy], [b, bottom], [a, bottom], [a + notch, cy]], paint);
}

const logoAt = (cx: number, top: number, maxW: number, maxH: number) => ({ cx, top, maxW, maxH });

export const CANVA_DESIGNS: DesignDef[] = [
  // 1. Navy ribbon with gold edging top-left, navy bands, a gold-edged panel bottom-right
  {
    id: "navyRibbon",
    label: "Navy Gold Ribbon",
    color: "#183166",
    layout: (main) =>
      layout({
        cx: W / 2, w: 580, title: 127, subtitle: 159, intro: 239, name: 311, nameLine: 330, body: 384, sig: 474,
        slots: (two) => (two ? [286, 554] : [W / 2]), titleColor: darken(main, 0.1), subtitleColor: darken(main, 0.1), introColor: darken(main, 0.1), nameColor: lighten(main, 0.15),
        titleFont: "display", titleSize: 43, titleSpacing: 2, subtitleSize: 11.5, subtitleSpacing: 4.5, nameSize: 62, noNameLine: true,
        logo: logoAt(W * 0.8, 52, 130, 56),
      }),
    draw({ page, main }) {
      drawTraced(page, "navyRibbon", main);
      line(page, [0.286 * W, 178], [0.698 * W, 178], 1, darken(main, 0.1));
    },
  },
  // 2. Two sweeping red ribbons and an optional red rosette
  {
    id: "redWaves",
    label: "Red Waves",
    color: "#a01514",
    layout: (main) =>
      layout({
        cx: W / 2, w: 520, title: 127, subtitle: 152, intro: 218, name: 272, nameLine: 292, body: 322, sig: 429,
        slots: (two) => (two ? [295, 544] : [W / 2]), titleColor: "#14171c", subtitleColor: "#4b5563", introColor: darken(main, 0.1), nameColor: lighten(main, 0.1),
        lineColor: "#c9ccd1", titleFont: "bold", titleSize: 44, titleSpacing: 3, subtitleSize: 11.5, subtitleSpacing: 4.5, nameSize: 48,
      }),
    badge: true,
    draw({ page, main, bold, badge }) {
      drawTraced(page, "redWaves", main);
      if (badge.on)
        rosette(page, { cx: 0.498 * W, cy: 0.731 * H, r: 33, rimLight: lighten(main, 0.35), rimDark: darken(main, 0.15), disc: main, ring: "#ffe0e0", text: "#ffffff", tails: shadeBetween([0.5 * W, 440], [0.5 * W, 520], lighten(main, 0.1), darken(main, 0.3)), lines: badge.lines, font: bold });
    },
  },
  // 3. Red and charcoal frame, a black ribbon and an optional dark rosette
  {
    id: "redFrame",
    label: "Red Frame",
    color: "#de222a",
    layout: () =>
      layout({
        cx: W / 2, w: 560, title: 129, subtitle: 160, intro: 221, name: 296, nameLine: 312, body: 346, sig: 465,
        slots: (two) => (two ? [259, 581] : [W / 2]), titleColor: "#2b2f38", subtitleColor: "#2b2f38", introColor: "#ffffff", nameColor: "#1a1a1a",
        lineColor: "#c9ccd1", titleFont: "bold", titleSize: 45, titleSpacing: 3, subtitleSize: 11.5, subtitleSpacing: 4.5, nameSize: 52, noNameLine: true,
      }),
    badge: true,
    draw({ page, main, bold, badge }) {
      drawTraced(page, "redFrame", main);
      ribbon(page, 0.28, 0.72, 0.3655 * H, 0.063 * H, "#16171b", 11);
      line(page, [0.37 * W, 312], [0.63 * W, 312], 1, "#b6bac2");
      if (badge.on) rosette(page, { cx: 0.499 * W, cy: 0.77 * H, r: 30, rimLight: lighten(main, 0.2), rimDark: darken(main, 0.15), disc: "#25272e", ring: "#ffffff", text: "#ffffff", lines: badge.lines, font: bold });
    },
  },
  // 4. Blue diagonal stripes in two corners, a blue ribbon and an optional black badge
  {
    id: "blueBands",
    label: "Blue Stripes",
    color: "#1b93ee",
    layout: () =>
      layout({
        cx: W / 2, w: 520, title: 126, subtitle: 162, intro: 222, name: 289, nameLine: 310, body: 340, sig: 468,
        slots: (two) => (two ? [242, 599] : [W / 2]), titleColor: "#111827", subtitleColor: "#111827", introColor: "#ffffff", nameColor: "#1f2430",
        titleFont: "bold", titleSize: 40, titleSpacing: 3, subtitleSize: 10.5, subtitleSpacing: 4, nameSize: 50, noNameLine: true,
      }),
    badge: true,
    draw({ page, main, bold, badge }) {
      drawTraced(page, "blueBands", main);
      ribbon(page, 0.264, 0.725, 0.365 * H, 0.04 * H, shadeBetween([0.264 * W, 0], [0.725 * W, 0], lighten(main, 0.05), darken(main, 0.1)), 9);
      if (badge.on) rosette(page, { cx: 0.494 * W, cy: 0.764 * H, r: 40, rimLight: lighten(main, 0.2), rimDark: darken(main, 0.25), disc: "#0b0f19", ring: "#ffffff", text: "#ffffff", lines: badge.lines, font: bold });
    },
  },
  // 5. Big blue arrow shapes either side, no badge, a blue underlined name
  {
    id: "blueArrows",
    label: "Blue Arrows",
    color: "#055fd5",
    layout: (main) =>
      layout({
        cx: W / 2, w: 440, title: 150, subtitle: 182, intro: 214, name: 312, nameLine: 325, body: 354, sig: 457,
        slots: (two) => (two ? [288, 551] : [W / 2]), titleColor: "#0b1220", subtitleColor: "#0b1220", introColor: "#1f2937", nameColor: main,
        lineColor: main, titleFont: "bold", titleSize: 31, titleSpacing: 4, subtitleSize: 11, subtitleSpacing: 3.5, nameSize: 40,
      }),
    draw({ page, main }) {
      drawTraced(page, "blueArrows", main);
    },
  },
  // 6. Blue dashed stripes with white pill-shaped dashes, a blue pill ribbon and an optional black and gold badge
  {
    id: "blueDash",
    label: "Blue Dashes",
    color: "#1f5dca",
    layout: () =>
      layout({
        cx: W / 2, w: 520, title: 128, subtitle: 163, intro: 222, name: 296, nameLine: 312, body: 340, sig: 469,
        slots: (two) => (two ? [257, 584] : [W / 2]), titleColor: "#0b1220", subtitleColor: "#0b1220", introColor: "#ffffff", nameColor: "#111827",
        titleFont: "bold", titleSize: 40, titleSpacing: 3, subtitleSize: 10.5, subtitleSpacing: 4, nameSize: 50, noNameLine: true,
      }),
    badge: true,
    draw({ page, main, bold, badge }) {
      drawTraced(page, "blueDash", main);
      roundedSquare(page, W / 2, 0.366 * H, 0.455 * W, 0.04 * H, 0, 0.02 * H, shadeBetween([0.27 * W, 0], [0.725 * W, 0], lighten(main, 0.12), darken(main, 0.18)));
      if (badge.on) rosette(page, { cx: 0.494 * W, cy: 0.764 * H, r: 40, rimLight: "#fff0a8", rimDark: "#c9a227", disc: "#0b0f19", ring: "#f3dc86", text: "#f3dc86", lines: badge.lines, font: bold });
    },
  },
  // 7. Navy and gold corner triangles with a thin gold frame, and an optional small dark badge
  {
    id: "navyGold",
    label: "Navy & Gold Corners",
    color: "#082140",
    layout: () =>
      layout({
        cx: W / 2, w: 540, title: 165, subtitle: 190, intro: 262, name: 352, nameLine: 366, body: 404, sig: 568,
        slots: (two) => (two ? [260, 578] : [W / 2]), titleColor: "#111827", subtitleColor: "#111827", introColor: "#374151", nameColor: "#3b2f93",
        titleFont: "title", titleSize: 45, subtitleSize: 11, subtitleSpacing: 4, nameSize: 42, noNameLine: true,
      }),
    badge: true,
    draw({ page, main, bold, badge }) {
      drawTraced(page, "navyGold", main);
      if (badge.on) rosette(page, { cx: 0.497 * W, cy: 0.91 * H, r: 30, rimLight: "#fff0a8", rimDark: "#a87a14", disc: "#10131c", ring: "#f3dc86", text: "#f3dc86", tails: "#15161a", lines: badge.lines, font: bold });
    },
  },
  // 8. Maroon corner panels with gold bands and thin gold brackets
  {
    id: "maroonGold",
    label: "Maroon & Gold",
    color: "#4b0807",
    layout: () =>
      layout({
        cx: W / 2, w: 560, title: 134, subtitle: 161, intro: 229, name: 319, nameLine: 339, body: 360, sig: 480,
        slots: (two) => (two ? [277, 565] : [W / 2]), titleColor: "#0b0b0b", subtitleColor: "#d19a12", introColor: "#1f2937", nameColor: "#d19a12",
        lineColor: "#111111", titleFont: "bold", titleSize: 38, titleSpacing: 3, subtitleSize: 13, subtitleSpacing: 5, nameSize: 58,
      }),
    draw({ page, main }) {
      drawTraced(page, "maroonGold", main);
      line(page, [0.34 * W, 183], [0.66 * W, 183], 1.4, "#d19a12");
    },
  },
  // 9. White sheet with navy corner bars, thin yellow lines and a gold rosette (room for a logo top right)
  {
    id: "yellowNavy",
    label: "Navy & Yellow Lines",
    color: "#0c2669",
    layout: (main) =>
      layout({
        cx: W / 2, w: 520, title: 170, subtitle: 188, intro: 255, name: 333, nameLine: 350, body: 375, sig: 448,
        slots: (two) => (two ? [264, 577] : [W / 2]), titleColor: darken(main, 0.05), subtitleColor: darken(main, 0.05), introColor: darken(main, 0.05), nameColor: lighten(main, 0.1),
        lineColor: "#c9ccd1", titleFont: "bold", titleSize: 42, titleSpacing: 4, subtitleSize: 10.5, subtitleSpacing: 3.5, nameSize: 60,
        logo: logoAt(0.8 * W, 120, 110, 60),
      }),
    badge: true,
    draw({ page, main, bold, badge }) {
      drawTraced(page, "yellowNavy", main);
      if (badge.on) rosette(page, { cx: 0.194 * W, cy: 0.253 * H + 8, r: 34, rimLight: "#fff0a8", rimDark: "#c9a227", disc: darken(main, 0.1), ring: "#fff0a8", text: "#f3dc86", tails: goldBetween([0.194 * W - 30, 170], [0.194 * W + 30, 250]), lines: badge.lines, font: bold });
    },
  },
  // 10. Black bars top and bottom, silver sweeps, gold crescents and an optional black and gold rosette
  {
    id: "blackSilver",
    label: "Black & Silver",
    color: "#bc9950",
    layout: () =>
      layout({
        cx: W / 2, w: 540, title: 141, subtitle: 170, intro: 238, name: 267, nameLine: 273, body: 355, sig: 477,
        slots: (two) => (two ? [223, 628] : [W / 2]), titleColor: "#0b0b0b", subtitleColor: "#0b0b0b", introColor: "#0b0b0b", nameColor: "#111111",
        lineColor: "#111111", titleFont: "display", titleSize: 46, titleSpacing: 1.5, subtitleSize: 10, subtitleSpacing: 2.5, nameSize: 38,
      }),
    badge: true,
    draw({ page, bold, badge, main }) {
      drawTraced(page, "blackSilver", main);
      // The long silver sweeps across the page
      polygon(page, [[0, 0.9 * H], [0.99 * W, 0.1 * H], [W, 0.14 * H], [0.04 * W, 0.945 * H]], "#ffffff", 0.7);
      polygon(page, [[0.3 * W, 0.945 * H], [0.98 * W, 0.3 * H], [0.99 * W, 0.34 * H], [0.34 * W, 0.945 * H]], "#e3e7ed", 0.8);
      if (badge.on) rosette(page, { cx: 0.524 * W, cy: 0.79 * H, r: 32, rimLight: "#fff0a8", rimDark: "#c9a227", disc: "#0c0c0f", ring: "#f3dc86", text: "#f3dc86", tails: "#15161a", lines: badge.lines, font: bold });
    },
  },
  // 11. Navy cubes with silver faces on the left, a thin gold frame, bold navy type shifted to the right
  {
    id: "navyCubes",
    label: "Navy Cubes",
    color: "#102439",
    layout: (main) =>
      layout({
        cx: 0.571 * W, w: 440, title: 130, subtitle: 153, intro: 242, name: 312, nameLine: 326, body: 372, sig: 503,
        slots: (two) => (two ? [274, 694] : [0.571 * W]), titleColor: darken(main, 0.1), subtitleColor: darken(main, 0.1), introColor: "#1f2937", nameColor: main,
        lineColor: "#c9ccd1", titleFont: "bold", titleSize: 54, titleSpacing: 3.5, subtitleSize: 11, subtitleSpacing: 4, nameFont: "bold", nameSize: 48, noNameLine: true,
      }),
    draw({ page, main }) {
      drawTraced(page, "navyCubes", main);
      const cx = 0.571 * W;
      line(page, [cx - 90, 172], [cx + 90, 172], 1.2, darken(main, 0.1));
      for (const dx of [-90, 90]) page.drawCircle({ x: cx + dx, y: Y(172), size: 2.6, color: hex(darken(main, 0.1)) });
    },
  },
  // 12. Navy hexagons and a chevron around a white sheet, with grey hexagon accents
  {
    id: "hexNavy",
    label: "Navy Hexagons",
    color: "#233543",
    layout: (main) =>
      layout({
        cx: W / 2, w: 520, title: 164, subtitle: 208, intro: 265, name: 389, nameLine: 405, body: 448, sig: 503,
        slots: (two) => (two ? [250, 575] : [W / 2]), titleColor: darken(main, 0.05), subtitleColor: darken(main, 0.05), introColor: "#1f2937", nameColor: "#111827",
        lineColor: "#c9ccd1", titleFont: "display", titleSize: 44, titleSpacing: 2.5, subtitleSize: 10.5, subtitleSpacing: 3.5, nameSize: 66, noNameLine: true,
      }),
    draw({ page, main }) {
      drawTraced(page, "hexNavy", main);
    },
  },
];
