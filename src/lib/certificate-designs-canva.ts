/**
 * The third set of certificate designs: eight landscape designs matched to the reference templates the
 * owner chose, in bright, saturated Canva-style colour. Five of them carry a rosette or badge
 * ("BEST AWARD"); the organiser can switch it off or change its words, so `draw` receives `badge`.
 * Same toolkit and the same rules as certificate-designs.ts.
 */

import type { PDFFont, PDFPage } from "pdf-lib";
import { layout, type DesignDef } from "./certificate-design-types";
import {
  GOLD,
  GOLD_LIGHT,
  PAGE_H,
  PAGE_W,
  Y,
  darken,
  fillPath,
  frame,
  goldBetween,
  hex,
  lighten,
  line,
  polygon,
  roundedSquare,
  shadeBetween,
  softShadow,
  type Paint,
  type Point,
} from "./certificate-draw";

const W = PAGE_W;
const H = PAGE_H;

/** Points given as fractions of the page, turned into page coordinates. */
const P = (list: [number, number][]): Point[] => list.map(([x, y]) => [x * W, y * H]);
/** The same fractions seen from the opposite corner. */
const flip = (list: [number, number][]): [number, number][] => list.map(([x, y]) => [1 - x, 1 - y]);
const wholePage = `M0 0 L${W} 0 L${W} ${H} L0 ${H} Z`;

/** Joins fractions with straight lines of one colour. */
function edge(page: PDFPage, list: [number, number][], thickness: number, color: string) {
  const pts = P(list);
  for (let i = 0; i < pts.length - 1; i++) line(page, pts[i], pts[i + 1], thickness, color);
}

type Rosette = { cx: number; cy: number; r: number; light: string; dark: string; disc?: string; ring: string; text: string; tails?: Paint; lines: string[]; font: PDFFont };

/** A scalloped award rosette in one colour family, with optional ribbon tails and up to two lines of words. */
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
  polygon(page, rim, { kind: "radial", at: [cx - r * 0.3, cy - r * 0.3], r0: 0, r1: r * 1.5, stops: [[0, o.light], [1, o.dark]] });
  page.drawCircle({ x: cx, y: Y(cy), size: r * 0.8, borderColor: hex(o.ring), borderWidth: 1.4 });
  page.drawCircle({ x: cx, y: Y(cy), size: r * 0.72, color: hex(o.disc ?? o.dark) });

  // The words, shrunk until the widest line fits inside the ring
  let size = r * 0.28;
  const widest = () => Math.max(...o.lines.map((l) => o.font.widthOfTextAtSize(l, size)));
  while (size > 4 && widest() > r * 1.15) size -= 0.5;
  o.lines.forEach((word, i, all) => {
    const w = o.font.widthOfTextAtSize(word, size);
    page.drawText(word, { x: cx - w / 2, y: Y(cy + size * 0.35 + (i - (all.length - 1) / 2) * size * 1.3), size, font: o.font, color: hex(o.text) });
  });
}

export const CANVA_DESIGNS: DesignDef[] = [
  // Navy ribbon in the top-left, outlined in gold, with navy bands along the top and bottom
  {
    id: "navyRibbon",
    label: "Navy Gold Ribbon",
    color: "#1b4fb5",
    layout: (main) =>
      layout({
        cx: W / 2, w: 580, title: 127, subtitle: 158, intro: 239, name: 316, nameLine: 330, body: 386, sig: 474,
        slots: (two) => (two ? [286, 554] : [W / 2]), titleColor: darken(main, 0.25), subtitleColor: darken(main, 0.25), introColor: darken(main, 0.25),
        nameColor: main, titleFont: "display", titleSize: 44, titleSpacing: 2, subtitleSize: 12, subtitleSpacing: 4.5, noNameLine: true,
      }),
    draw({ page, main }) {
      fillPath(page, wholePage, shadeBetween([0, 0], [W, H], "#ffffff", lighten(main, 0.9)));
      const navy = shadeBetween([0, 0], [W, 0], lighten(main, 0.1), darken(main, 0.2));
      polygon(page, P([[0.34, 0], [1, 0], [1, 0.063], [0.355, 0.063]]), navy);
      const ribbon: [number, number][] = [[0, 0.14], [0.115, 0], [0.34, 0], [0.355, 0.063], [0.3, 0.07], [0.22, 0.11], [0.07, 0.25], [0.04, 0.31], [0.045, 0.36], [0.03, 0.4], [0, 0.488]];
      polygon(page, P(ribbon), navy);
      edge(page, ribbon.slice(3), 2.6, GOLD);
      edge(page, [[0, 0.14], [0.115, 0]], 2.6, GOLD);
      polygon(page, P([[0, 0.935], [1, 0.935], [1, 1], [0, 1]]), shadeBetween([0, 0], [W, 0], lighten(main, 0.7), darken(main, 0.1)));
      const corner: [number, number][] = [[1, 0.66], [0.965, 0.665], [0.8, 0.8], [0.78, 0.86], [0.8, 0.935], [1, 0.935]];
      polygon(page, P(corner), shadeBetween([W, H], [0.78 * W, 0.7 * H], darken(main, 0.1), lighten(main, 0.15)));
      edge(page, corner.slice(1, 4), 2.6, GOLD);
      line(page, [0.375 * W, 177], [0.775 * W, 177], 1, darken(main, 0.25));
    },
  },
  // White sheet with two sweeping red ribbons and an optional red rosette
  {
    id: "redWaves",
    label: "Red Waves",
    color: "#e11d2e",
    layout: (main) =>
      layout({
        cx: W / 2, w: 500, title: 133, subtitle: 161, intro: 226, name: 300, nameLine: 316, body: 350, sig: 466,
        slots: (two) => (two ? [222, 620] : [W / 2]), titleColor: "#111827", subtitleColor: "#374151", introColor: darken(main, 0.25), nameColor: main,
        lineColor: "#9ca3af", titleFont: "bold", titleSize: 44, titleSpacing: 3, subtitleSize: 12, subtitleSpacing: 4.5,
      }),
    badge: true,
    draw({ page, main, bold, badge }) {
      fillPath(page, wholePage, shadeBetween([0, 0], [W, H], "#ffffff", "#fff4f4"));
      const red = shadeBetween([0, 0], [W * 0.5, H], lighten(main, 0.15), darken(main, 0.2));
      fillPath(page, `M0 ${0.02 * H} C${0.15 * W} ${0.08 * H} ${0.36 * W} ${0.56 * H} ${0.58 * W} ${H} L${0.4 * W} ${H} C${0.26 * W} ${0.62 * H} ${0.12 * W} ${0.34 * H} 0 ${0.3 * H} Z`, "#e5e7eb", 0.85);
      fillPath(page, `M0 ${0.12 * H} C${0.12 * W} ${0.16 * H} ${0.3 * W} ${0.6 * H} ${0.47 * W} ${H} L${0.36 * W} ${H} C${0.22 * W} ${0.66 * H} ${0.1 * W} ${0.4 * H} 0 ${0.26 * H} Z`, red);
      fillPath(page, `M${0.72 * W} 0 C${0.8 * W} ${0.3 * H} ${0.9 * W} ${0.5 * H} ${W} ${0.72 * H} L${W} ${0.4 * H} C${0.93 * W} ${0.36 * H} ${0.86 * W} ${0.22 * H} ${0.84 * W} 0 Z`, "#e5e7eb", 0.85);
      fillPath(page, `M${0.8 * W} 0 C${0.84 * W} ${0.22 * H} ${0.92 * W} ${0.34 * H} ${W} ${0.4 * H} L${W} ${0.58 * H} C${0.92 * W} ${0.5 * H} ${0.84 * W} ${0.3 * H} ${0.76 * W} 0 Z`, shadeBetween([W, 0], [0.7 * W, 0.4 * H], lighten(main, 0.1), darken(main, 0.2)));
      if (badge.on) rosette(page, { cx: W / 2, cy: 468, r: 28, light: lighten(main, 0.25), dark: darken(main, 0.15), ring: "#ffd6d6", text: "#ffffff", tails: shadeBetween([W / 2, 460], [W / 2, 540], main, darken(main, 0.3)), lines: badge.lines, font: bold });
    },
  },
  // Red and charcoal frame, a black ribbon carrying the presented-to line, and an optional dark rosette
  {
    id: "redFrame",
    label: "Red Frame",
    color: "#e11d2e",
    layout: () =>
      layout({
        cx: W / 2, w: 560, title: 122, subtitle: 160, intro: 221, name: 297, nameLine: 311, body: 340, sig: 466,
        slots: (two) => (two ? [263, 579] : [W / 2]), titleColor: "#1f2128", subtitleColor: "#1f2128", introColor: "#ffffff", nameColor: "#111827",
        lineColor: "#9ca3af", titleFont: "bold", titleSize: 46, titleSpacing: 3, subtitleSize: 12, subtitleSpacing: 4.5,
      }),
    badge: true,
    draw({ page, main, bold, badge }) {
      fillPath(page, wholePage, "#ffffff");
      const red = shadeBetween([0, 0], [0, H], lighten(main, 0.12), darken(main, 0.15));
      const charcoal = shadeBetween([0, 0], [W, 0], "#2a2c33", "#43464f");
      polygon(page, P([[0, 0], [0.05, 0], [0.05, 1], [0, 1]]), red);
      polygon(page, P([[0.95, 0], [1, 0], [1, 1], [0.95, 1]]), red);
      polygon(page, P([[0.05, 0], [0.078, 0.075], [0.078, 0.925], [0.05, 1]]), "#d9dce1");
      polygon(page, P([[0.95, 0], [0.922, 0.075], [0.922, 0.925], [0.95, 1]]), "#d9dce1");
      polygon(page, P([[0, 0], [1, 0], [1, 0.075], [0, 0.075]]), charcoal);
      polygon(page, P([[0, 0], [0.3, 0], [0.26, 0.075], [0, 0.075]]), red);
      polygon(page, P([[0.7, 0.925], [1, 0.925], [1, 1], [0.74, 1]]), red);
      polygon(page, P([[0.05, 0.955], [0.95, 0.955], [0.95, 1], [0.05, 1]]), charcoal);
      // The black ribbon behind the presented-to line
      polygon(page, P([[0.22, 0.343], [0.78, 0.343], [0.762, 0.3645], [0.78, 0.386], [0.22, 0.386], [0.238, 0.3645]]), "#15161a");
      if (badge.on) rosette(page, { cx: W / 2, cy: 462, r: 27, light: "#5a5d66", dark: "#17181c", ring: main, text: "#ffffff", lines: badge.lines, font: bold });
    },
  },
  // Blue diagonal stripes in two corners, a blue ribbon and an optional black badge
  {
    id: "blueStripes",
    label: "Blue Stripes",
    color: "#1f7ae0",
    layout: (main) =>
      layout({
        cx: W / 2, w: 500, title: 108, subtitle: 148, intro: 222, name: 296, nameLine: 310, body: 338, sig: 472,
        slots: (two) => (two ? [267, 575] : [W / 2]), titleColor: "#111827", subtitleColor: "#111827", introColor: "#ffffff", nameColor: darken(main, 0.1),
        lineColor: "#9ca3af", titleFont: "bold", titleSize: 46, titleSpacing: 3, subtitleSize: 12, subtitleSpacing: 4.5, noNameLine: true,
      }),
    badge: true,
    draw({ page, main, bold, badge }) {
      fillPath(page, wholePage, "#ffffff");
      const strips: { pts: [number, number][]; paint: Paint }[] = [
        { pts: [[0, 0], [0.12, 0], [0, 0.5]], paint: shadeBetween([0, 0], [0.12 * W, 0.5 * H], darken(main, 0.05), lighten(main, 0.1)) },
        { pts: [[0.12, 0], [0.17, 0], [0, 0.74], [0, 0.5]], paint: lighten(main, 0.35) },
        { pts: [[0.17, 0], [0.24, 0], [0, 0.98], [0, 0.74]], paint: lighten(main, 0.72) },
      ];
      for (const s of strips) {
        polygon(page, P(s.pts), s.paint);
        polygon(page, P(flip(s.pts)), s.paint);
      }
      polygon(page, P([[0.25, 0.343], [0.75, 0.343], [0.75, 0.386], [0.25, 0.386]]), shadeBetween([0.25 * W, 0], [0.75 * W, 0], lighten(main, 0.15), darken(main, 0.1)));
      line(page, [0.37 * W, 310], [0.63 * W, 310], 1, main);
      if (badge.on) rosette(page, { cx: W / 2, cy: 436, r: 28, light: "#4b5563", dark: "#0b0f19", ring: main, text: "#ffffff", lines: badge.lines, font: bold });
    },
  },
  // Big blue arrow shapes either side, no badge, a blue underlined name
  {
    id: "blueArrows",
    label: "Blue Arrows",
    color: "#1d4ed8",
    layout: (main) =>
      layout({
        cx: W / 2, w: 440, title: 146, subtitle: 178, intro: 214, name: 292, nameLine: 306, body: 336, sig: 458,
        slots: (two) => (two ? [295, 547] : [W / 2]), titleColor: "#0b1220", subtitleColor: "#0b1220", introColor: "#1f2937", nameColor: main,
        lineColor: main, titleFont: "bold", titleSize: 44, titleSpacing: 3, subtitleSize: 12, subtitleSpacing: 4.5,
      }),
    draw({ page, main }) {
      fillPath(page, wholePage, "#ffffff");
      const left: { pts: [number, number][]; paint: Paint }[] = [
        { pts: [[0, 0.04], [0.28, 0.04], [0.15, 0.3], [0, 0.3]], paint: "#e9edf3" },
        { pts: [[0, 0.3], [0.18, 0.3], [0.2, 0.5], [0, 0.82]], paint: shadeBetween([0, 0.3 * H], [0.2 * W, 0.6 * H], lighten(main, 0.1), darken(main, 0.1)) },
        { pts: [[0, 0.52], [0.075, 0.52], [0.075, 0.74], [0, 0.82]], paint: darken(main, 0.25) },
        { pts: [[0, 0.76], [0.06, 0.76], [0.06, 0.98], [0, 0.98]], paint: lighten(main, 0.3) },
      ];
      for (const s of left) {
        polygon(page, P(s.pts), s.paint);
        polygon(page, P(s.pts.map(([x, y]) => [1 - x, y] as [number, number])), s.paint);
      }
      // Thin outlines that echo the arrow
      edge(page, [[0.03, 0.12], [0.215, 0.5], [0.03, 0.88]], 1.2, darken(main, 0.3));
      edge(page, [[0.97, 0.12], [0.785, 0.5], [0.97, 0.88]], 1.2, darken(main, 0.3));
    },
  },
  // Blue dashed stripes with white pill-shaped dashes, a blue pill ribbon and an optional black and gold badge
  {
    id: "blueDash",
    label: "Blue Dashes",
    color: "#2563eb",
    layout: () =>
      layout({
        cx: W / 2, w: 500, title: 133, subtitle: 170, intro: 218, name: 292, nameLine: 306, body: 336, sig: 470,
        slots: (two) => (two ? [258, 584] : [W / 2]), titleColor: "#0b1220", subtitleColor: "#0b1220", introColor: "#ffffff", nameColor: "#111827",
        lineColor: "#9ca3af", titleFont: "bold", titleSize: 46, titleSpacing: 3, subtitleSize: 12, subtitleSpacing: 4.5, noNameLine: true,
      }),
    badge: true,
    draw({ page, main, bold, badge }) {
      fillPath(page, wholePage, "#ffffff");
      const blue = shadeBetween([0, 0], [0.27 * W, 0.4 * H], darken(main, 0.1), lighten(main, 0.12));
      polygon(page, P([[0, 0], [0.27, 0], [0, 0.4]]), blue);
      polygon(page, P(flip([[0, 0], [0.27, 0], [0, 0.4]])), shadeBetween([W, H], [0.73 * W, 0.6 * H], darken(main, 0.1), lighten(main, 0.12)));
      // Pill-shaped white dashes, lying along the slope of each corner
      const dashes: [number, number, number][] = [[30, 30, 60], [55, 55, 90], [50, 110, 70], [110, 50, 40], [60, 150, 90], [150, 60, 40], [85, 100, 40]];
      for (const [x, y, len] of dashes) {
        roundedSquare(page, x, y, len, 11, -45, 5.5, "#ffffff", 0.95);
        roundedSquare(page, W - x, H - y, len, 11, -45, 5.5, "#ffffff", 0.95);
      }
      roundedSquare(page, W / 2, 214, 0.5 * W, 22, 0, 11, shadeBetween([0.25 * W, 0], [0.75 * W, 0], lighten(main, 0.15), darken(main, 0.1)));
      line(page, [0.37 * W, 306], [0.63 * W, 306], 1, "#9ca3af");
      if (badge.on) rosette(page, { cx: W / 2, cy: 432, r: 28, light: "#4b5563", dark: "#0b0f19", ring: GOLD_LIGHT, text: "#f3dc86", lines: badge.lines, font: bold });
    },
  },
  // Navy and gold corner triangles with a thin gold frame, and an optional small dark badge
  {
    id: "navyGold",
    label: "Navy & Gold Corners",
    color: "#14409a",
    layout: (main) =>
      layout({
        cx: W / 2, w: 520, title: 150, subtitle: 184, intro: 238, name: 312, nameLine: 326, body: 356, sig: 478,
        slots: (two) => (two ? [250, 592] : [W / 2]), titleColor: "#111827", subtitleColor: "#111827", introColor: "#374151", nameColor: darken(main, 0.1),
        lineColor: "#9ca3af", titleFont: "title", titleSize: 50, subtitleSize: 12, subtitleSpacing: 4.5,
      }),
    badge: true,
    draw({ page, main, bold, badge }) {
      fillPath(page, wholePage, shadeBetween([0, 0], [W, H], "#ffffff", "#eef3ff"));
      frame(page, 0.035 * W, 0.05 * H, 0.93 * W, 0.9 * H, 1.2, GOLD);
      const navy = shadeBetween([0, 0], [0.3 * W, 0.24 * H], darken(main, 0.15), lighten(main, 0.12));
      const tris: [number, number][][] = [
        [[0, 0], [0.3, 0], [0, 0.24]],
        [[0, 0.78], [0, 1], [0.21, 1]],
        [[0.74, 0], [1, 0], [1, 0.16]],
        [[1, 0.8], [1, 1], [0.8, 1]],
      ];
      for (const t of tris) polygon(page, P(t), navy);
      // Gold edge lines parallel to the long side of each triangle
      edge(page, [[0.3, 0], [0, 0.24]], 2, GOLD);
      edge(page, [[0.34, 0], [0, 0.28]], 1, GOLD);
      edge(page, [[0, 0.78], [0.21, 1]], 2, GOLD);
      edge(page, [[0.74, 0], [1, 0.16]], 2, GOLD);
      edge(page, [[1, 0.8], [0.8, 1]], 2, GOLD);
      if (badge.on) rosette(page, { cx: W / 2, cy: 478 - 6, r: 24, light: "#4b5563", dark: "#10131c", ring: GOLD_LIGHT, text: "#f3dc86", lines: badge.lines, font: bold });
    },
  },
  // Maroon corner panels with gold bands and thin gold brackets
  {
    id: "maroonGold",
    label: "Maroon & Gold",
    color: "#8e1022",
    layout: () =>
      layout({
        cx: W / 2, w: 560, title: 134, subtitle: 161, intro: 229, name: 318, nameLine: 339, body: 358, sig: 480,
        slots: (two) => (two ? [277, 564] : [W / 2]), titleColor: "#0b0b0b", subtitleColor: "#d19a12", introColor: "#1f2937", nameColor: "#d19a12",
        lineColor: "#111111", titleFont: "bold", titleSize: 46, titleSpacing: 3, subtitleSize: 14, subtitleSpacing: 5,
      }),
    draw({ page, main }) {
      fillPath(page, wholePage, shadeBetween([0, 0], [W, H], "#ffffff", "#f3f4f6"));
      const maroon = shadeBetween([0, 0], [0.36 * W, 0.2 * H], darken(main, 0.2), lighten(main, 0.1));
      const band = goldBetween([0, 0.2 * H], [0.3 * W, 0]);
      const panel: [number, number][] = [[0, 0], [0.363, 0], [0.19, 0.19], [0.05, 0.2], [0, 0.51]];
      const gold: [number, number][] = [[0.363, 0], [0.38, 0], [0.205, 0.2], [0.05, 0.212], [0.05, 0.2], [0.19, 0.19]];
      for (const flipIt of [false, true]) {
        const m = (l: [number, number][]) => P(flipIt ? flip(l) : l);
        polygon(page, m(panel), maroon);
        polygon(page, m(gold), band);
      }
      // Thin gold brackets
      const bracket = (l: [number, number][]) => edge(page, l, 1.4, GOLD);
      bracket([[0.05, 0.2], [0.05, 0.55]]);
      bracket([[0.0, 0.09], [0.33, 0.09]]);
      bracket([[0.71, 0.09], [0.96, 0.09], [0.96, 0.4]]);
      bracket([[0.04, 0.6], [0.04, 0.93], [0.29, 0.93]]);
      bracket([[0.95, 0.91], [0.67, 0.91]]);
    },
  },
  // White sheet with navy corner bars, thin yellow lines and a gold rosette (and room for a logo top right)
  {
    id: "yellowNavy",
    label: "Navy & Yellow Lines",
    color: "#14307a",
    layout: (main) =>
      layout({
        cx: W / 2, w: 500, title: 169, subtitle: 193, intro: 256, name: 333, nameLine: 349, body: 370, sig: 458,
        slots: (two) => (two ? [264, 578] : [W / 2]), titleColor: darken(main, 0.1), subtitleColor: darken(main, 0.1), introColor: darken(main, 0.1), nameColor: main,
        lineColor: "#9ca3af", titleFont: "display", titleSize: 42, titleSpacing: 2, subtitleSize: 11, subtitleSpacing: 3.5,
        logo: { cx: 0.8 * W, top: 150, maxW: 100, maxH: 56 },
      }),
    badge: true,
    draw({ page, main, bold, badge }) {
      fillPath(page, wholePage, "#ffffff");
      const navy = shadeBetween([0, 0], [W, H], main, darken(main, 0.25));
      const yellow = "#f5b800";
      const rect = (x0: number, y0: number, x1: number, y1: number, paint: Paint) => polygon(page, P([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]), paint);
      // Navy L-shapes in two corners
      rect(0.044, 0.069, 0.5, 0.118, navy);
      rect(0.044, 0.069, 0.079, 0.523, navy);
      rect(0.5, 0.876, 0.96, 0.926, navy);
      rect(0.92, 0.477, 0.955, 0.926, navy);
      // Yellow lines
      rect(0.095, 0.138, 0.594, 0.15, yellow);
      rect(0.406, 0.85, 0.9, 0.862, yellow);
      edge(page, [[0.044, 0.044], [0.248, 0.044]], 1.4, yellow);
      edge(page, [[0.059, 0.52], [0.059, 0.9], [0.495, 0.9]], 1.4, yellow);
      edge(page, [[0.505, 0.085], [0.94, 0.085], [0.94, 0.5]], 1.4, yellow);
      edge(page, [[0.752, 0.79], [0.9, 0.79]], 1.4, yellow);
      edge(page, [[0.96, 0.94], [0.7, 0.94]], 1.2, yellow);
      if (badge.on) rosette(page, { cx: 0.19 * W, cy: 152, r: 34, light: "#fff0a8", dark: "#c9a227", disc: darken(main, 0.1), ring: "#fff0a8", text: "#f3dc86", tails: goldBetween([0.19 * W - 30, 160], [0.19 * W + 30, 240]), lines: badge.lines, font: bold });
    },
  },
  // Black bars top and bottom, silver sweeps, gold crescents and an optional black and gold rosette
  {
    id: "blackSilver",
    label: "Black & Silver",
    color: "#111111",
    layout: (main) =>
      layout({
        cx: W / 2, w: 540, title: 141, subtitle: 167, intro: 231, name: 309, nameLine: 323, body: 348, sig: 476,
        slots: (two) => (two ? [219, 623] : [W / 2]), titleColor: "#0b0b0b", subtitleColor: "#0b0b0b", introColor: "#0b0b0b", nameColor: main,
        lineColor: "#111111", titleFont: "display", titleSize: 44, titleSpacing: 2, subtitleSize: 10.5, subtitleSpacing: 2.5,
      }),
    badge: true,
    draw({ page, bold, badge }) {
      fillPath(page, wholePage, shadeBetween([0, 0], [W, H], "#ffffff", "#d3d9e3"));
      // Long silver sweeps across the page
      polygon(page, P([[0.99, 0.06], [0.28, 0.96], [0.32, 0.96], [1, 0.1]]), "#e4e8ef", 0.9);
      polygon(page, P([[0.99, 0.16], [0.4, 0.96], [0.43, 0.96], [1, 0.2]]), "#eef1f6", 0.9);
      const black = "#0c0c0f";
      polygon(page, P([[0, 0], [1, 0], [1, 0.05], [0, 0.05]]), black);
      polygon(page, P([[0, 0.955], [1, 0.955], [1, 1], [0, 1]]), black);
      fillPath(page, `M0 0 L${0.17 * W} 0 C${0.1 * W} ${0.06 * H} ${0.03 * W} ${0.14 * H} 0 ${0.3 * H} Z`, black);
      fillPath(page, `M${W} ${H} L${0.83 * W} ${H} C${0.9 * W} ${0.94 * H} ${0.97 * W} ${0.86 * H} ${W} ${0.7 * H} Z`, black);
      // Gold crescents
      const crescent = (flipIt: boolean) => {
        const x = (v: number) => (flipIt ? 1 - v : v) * W;
        const y = (v: number) => (flipIt ? 1 - v : v) * H;
        fillPath(page, `M${x(0.135)} ${y(0.14)} C${x(0.08)} ${y(0.17)} ${x(0.05)} ${y(0.24)} ${x(0.07)} ${y(0.325)} C${x(0.075)} ${y(0.24)} ${x(0.1)} ${y(0.19)} ${x(0.135)} ${y(0.14)} Z`, goldBetween([0.06 * W, 0.3 * H], [0.14 * W, 0.14 * H]));
      };
      crescent(false);
      crescent(true);
      if (badge.on) rosette(page, { cx: W / 2, cy: 468, r: 30, light: "#fff0a8", dark: "#c9a227", disc: "#0c0c0f", ring: "#f3dc86", text: "#f3dc86", tails: "#15161a", lines: badge.lines, font: bold });
    },
  },
  // Navy cubes with silver faces on the left, a thin gold frame, bold navy type shifted to the right
  {
    id: "navyCubes",
    label: "Navy Cubes",
    color: "#1b3a63",
    layout: (main) =>
      layout({
        cx: 0.574 * W, w: 440, title: 130, subtitle: 154, intro: 242, name: 312, nameLine: 326, body: 352, sig: 503,
        slots: (two) => (two ? [274, 694] : [0.574 * W]), titleColor: darken(main, 0.2), subtitleColor: darken(main, 0.2), introColor: "#1f2937", nameColor: darken(main, 0.1),
        lineColor: "#9ca3af", titleFont: "bold", titleSize: 40, titleSpacing: 3.5, subtitleSize: 11, subtitleSpacing: 4, nameFont: "bold",
      }),
    draw({ page, main }) {
      fillPath(page, wholePage, "#ffffff");
      const navy = shadeBetween([0, 0], [0.3 * W, 0.7 * H], darken(main, 0.2), lighten(main, 0.12));
      const silver = shadeBetween([0, 0.3 * H], [0.3 * W, 0.6 * H], "#ffffff", "#b9c0cc");
      polygon(page, P([[0, 0], [0.32, 0], [0.14, 0.17], [0, 0.17]]), navy);
      polygon(page, P([[0.14, 0.17], [0.32, 0], [0.345, 0.0], [0.19, 0.2]]), "#e5e9f0");
      polygon(page, P([[0, 0.17], [0.14, 0.17], [0.33, 0.46], [0.2, 0.55], [0, 0.3]]), silver);
      polygon(page, P([[0, 0.55], [0.2, 0.55], [0.31, 0.78], [0.19, 0.88], [0, 0.8]]), navy);
      polygon(page, P([[0, 0.8], [0.19, 0.88], [0.27, 1], [0, 1]]), silver);
      polygon(page, P([[0, 0.92], [0.12, 0.96], [0.15, 1], [0, 1]]), darken(main, 0.15));
      // Thin gold frame
      const gold = "#b08d57";
      edge(page, [[0.31, 0.045], [0.98, 0.045], [0.98, 0.965], [0.33, 0.965]], 1.2, gold);
      edge(page, [[0.2, 0.55], [0.27, 0.7]], 1, gold);
      // The rule with dots under the title
      line(page, [0.574 * W - 70, 172], [0.574 * W + 70, 172], 1.2, darken(main, 0.2));
      for (const dx of [-70, 70]) page.drawCircle({ x: 0.574 * W + dx, y: Y(172), size: 2.4, color: hex(darken(main, 0.2)) });
    },
  },
  // Navy hexagons and a chevron around a white sheet, with grey hexagon accents
  {
    id: "hexNavy",
    label: "Navy Hexagons",
    color: "#1f3347",
    layout: (main) =>
      layout({
        cx: W / 2, w: 520, title: 157, subtitle: 190, intro: 256, name: 340, nameLine: 354, body: 396, sig: 488,
        slots: (two) => (two ? [264, 578] : [W / 2]), titleColor: darken(main, 0.1), subtitleColor: darken(main, 0.1), introColor: "#1f2937", nameColor: "#111827",
        lineColor: "#9ca3af", titleFont: "display", titleSize: 46, titleSpacing: 2.5, subtitleSize: 11, subtitleSpacing: 3.5,
      }),
    draw({ page, main }) {
      fillPath(page, wholePage, "#ffffff");
      const navy = shadeBetween([0, 0], [W, H], main, darken(main, 0.2));
      const hexagon = (fx: number, fy: number, r: number, paint: Paint, rotate = 0) =>
        polygon(page, Array.from({ length: 6 }, (_, i) => [fx * W + r * Math.cos(rotate + (i * Math.PI) / 3), fy * H + r * Math.sin(rotate + (i * Math.PI) / 3)] as Point), paint);
      polygon(page, P([[0.72, 0], [0.98, 0], [0.98, 0.2], [0.85, 0.3], [0.72, 0.2]]), navy);
      polygon(page, P([[0.02, 0.33], [0.1, 0.33], [0.17, 0.55], [0.17, 0.62], [0.1, 0.82], [0.02, 0.82]]), navy);
      polygon(page, P([[0.75, 1], [0.82, 0.83], [1, 0.83], [1, 1]]), navy);
      const grey = "#b9bcc2";
      hexagon(0.1, 0.225, 36, grey, Math.PI / 6);
      hexagon(0.155, 0.114, 15, navy, Math.PI / 6);
      hexagon(0.155, 0.38, 15, navy, Math.PI / 6);
      hexagon(0.07, 0.85, 30, grey, Math.PI / 6);
      hexagon(0.91, 0.685, 47, grey, Math.PI / 6);
      hexagon(0.945, 0.41, 36, navy, Math.PI / 6);
      hexagon(0.945, 0.41, 17, "#ffffff", Math.PI / 6);
      hexagon(0.888, 0.547, 15, navy, Math.PI / 6);
      hexagon(0.81, 0.63, 17, grey, Math.PI / 6);
      hexagon(0.74, 0.93, 36, grey, Math.PI / 6);
      edge(page, [[0.99, 0.35], [0.86, 0.5], [0.99, 0.75]], 1, darken(main, 0.1));
      edge(page, [[0.0, 0.08], [0.04, 0.16], [0.0, 0.24]], 1, darken(main, 0.1));
    },
  },
];
