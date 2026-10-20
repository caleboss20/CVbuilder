/**
 * The second set of certificate designs: four portrait (tall) and four landscape, matched to the
 * reference templates the owner chose. Same toolkit and same rules as certificate-designs.ts.
 * Portrait designs set `orientation: "portrait"`; the engine then draws on an A4 portrait page.
 */

import type { PDFPage } from "pdf-lib";
import { layout, type DesignDef } from "./certificate-design-types";
import {
  GOLD,
  GOLD_DARK,
  GOLD_LIGHT,
  INK,
  PAGE_H,
  PAGE_W,
  Y,
  curve,
  darken,
  fillPath,
  frame,
  goldBetween,
  hex,
  laurel,
  lighten,
  line,
  polygon,
  seal,
  shadeBetween,
  type Point,
} from "./certificate-draw";

/** Landscape size, and the same page turned upright. */
const W = PAGE_W;
const H = PAGE_H;
const PW = PAGE_H;
const PH = PAGE_W;

const fill = (page: PDFPage, w: number, h: number, color: string) => page.drawRectangle({ x: 0, y: 0, width: w, height: h, color: hex(color) });

/** The same points seen from another corner of a `w` by `h` page. */
const corner = (pts: Point[], flipX: boolean, flipY: boolean, w: number, h: number): Point[] => pts.map(([x, y]) => [flipX ? w - x : x, flipY ? h - y : y]);

/** A gold or coloured scroll in one corner of a page: a few curves and a dot, mirrored for the other corners. */
function cornerScroll(page: PDFPage, w: number, h: number, flipX: boolean, flipY: boolean, color: string) {
  const map = ([x, y]: Point): Point => [flipX ? w - x : x, flipY ? h - y : y];
  const stroke = (pts: [Point, Point, Point, Point], thickness: number) => curve(page, pts.map(map) as [Point, Point, Point, Point], thickness, color);
  stroke([[52, 110], [50, 80], [72, 54], [104, 52]], 2.2);
  stroke([[62, 110], [60, 86], [78, 64], [104, 62]], 1.2);
  stroke([[104, 52], [134, 50], [156, 58], [182, 52]], 1.4);
  stroke([[52, 110], [50, 140], [58, 160], [52, 190]], 1.4);
  stroke([[72, 72], [96, 62], [108, 92], [84, 98]], 1.6);
  const [dx, dy] = map([92, 84]);
  page.drawCircle({ x: dx, y: Y(dy), size: 3, color: hex(color) });
}

/** A red wax seal with a wavy edge and a ring. */
function waxSeal(page: PDFPage, cx: number, cy: number, r: number) {
  const edge: Point[] = Array.from({ length: 36 }, (_, i) => {
    const a = (i * Math.PI) / 18;
    const rad = r * (0.94 + 0.08 * Math.sin(i * 1.7) + (i % 2 ? 0 : 0.02));
    return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
  });
  polygon(page, edge, { kind: "radial", at: [cx - r * 0.3, cy - r * 0.3], r0: 0, r1: r * 1.5, stops: [[0, "#c92a2a"], [1, "#6b0c0c"]] });
  page.drawCircle({ x: cx, y: Y(cy), size: r * 0.66, borderColor: hex("#8a1414"), borderWidth: 1.6 });
}

/** A scalloped badge in one flat colour, with a four-point star in the middle. */
function flatBadge(page: PDFPage, cx: number, cy: number, r: number, color: string, star: string) {
  const edge: Point[] = Array.from({ length: 48 }, (_, i) => {
    const a = (i * Math.PI) / 24;
    const rad = i % 2 === 0 ? r : r * 0.92;
    return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
  });
  polygon(page, edge, color);
  const s = r * 0.5;
  polygon(page, [[cx, cy - s], [cx + s * 0.22, cy - s * 0.22], [cx + s, cy], [cx + s * 0.22, cy + s * 0.22], [cx, cy + s], [cx - s * 0.22, cy + s * 0.22], [cx - s, cy], [cx - s * 0.22, cy - s * 0.22]], star);
}

export const MORE_DESIGNS: DesignDef[] = [
  // Portrait. Teal triangles with a gold ribbon in two corners and a yellow rosette
  {
    id: "tealDiagonal",
    label: "Teal Diagonal",
    color: "#17687c",
    orientation: "portrait",
    layout: (main) =>
      layout({
        cx: PW / 2, w: 480, title: 237, subtitle: 287, intro: 363, name: 447, nameLine: 460, body: 498, sig: 672,
        slots: (two) => (two ? [153, 443] : [153]), titleColor: main, subtitleColor: INK, introColor: INK, nameColor: main, lineColor: "#ffffff",
        titleFont: "bold", titleSize: 58, titleSpacing: 1, subtitleSize: 20, subtitleSpacing: 7, noNameLine: true,
      }),
    draw({ page, main, bold }) {
      const teal = shadeBetween([0, 0], [330, 215], lighten(main, 0.2), main);
      const parts: { pts: Point[]; paint: Parameters<typeof polygon>[2] }[] = [
        { pts: [[0, 0], [335, 0], [0, 215]], paint: teal },
        { pts: [[335, 0], [445, 0], [210, 105]], paint: darken(main, 0.15) },
        { pts: [[0, 150], [325, 0], [358, 0], [0, 208]], paint: goldBetween([0, 210], [360, 0]) },
      ];
      for (const p of parts) polygon(page, p.pts, p.paint);
      for (const p of parts) polygon(page, corner(p.pts, true, true, PW, PH), p.paint);
      seal(page, 505, 100, 36, { centre: "#f7c62b", star: false, ribbon: goldBetween([470, 100], [540, 200]), font: bold });
    },
  },
  // Portrait. Soft white waves, gold corner brackets and a wreath medal
  {
    id: "whiteWave",
    label: "White Wave",
    color: "#7a5c0a",
    orientation: "portrait",
    layout: () =>
      layout({
        cx: PW / 2, w: 460, title: 212, subtitle: 262, intro: 306, name: 372, nameLine: 384, body: 418, sig: 650,
        slots: (two) => (two ? [195, 400] : [PW / 2]), titleColor: INK, subtitleColor: INK, introColor: "#222222", nameColor: "#7a5c0a", lineColor: "#d9d9d9",
        titleFont: "bold", titleSize: 52, titleSpacing: 1, subtitleSize: 38, subtitleSpacing: 1.5,
      }),
    draw({ page, bold }) {
      fill(page, PW, PH, "#f3f3f3");
      fillPath(page, `M0 520 C130 560 230 680 160 ${PH} L0 ${PH} Z`, "#ffffff", 0.65);
      fillPath(page, `M${PW} 0 L${PW} 520 C520 380 440 190 360 0 Z`, "#ffffff", 0.55);
      fillPath(page, "M0 0 L0 300 C90 220 150 120 190 0 Z", "#ffffff", 0.5);
      curve(page, [[PW, 100], [520, 150], [470, 260], [PW, 430]], 1.2, "#ffffff", 0.9);
      curve(page, [[0, 640], [120, 690], [240, 760], [330, PH]], 1.2, "#ffffff", 0.9);
      // Gold corner brackets, top left and bottom right
      for (const [fx, fy] of [[false, false], [true, true]] as const) {
        const c = (pts: Point[]) => corner(pts, fx, fy, PW, PH);
        const [a, b, d] = c([[205, 52], [56, 52], [56, 190]]);
        line(page, a, b, 2.4, GOLD_DARK);
        line(page, b, d, 2.4, GOLD_DARK);
        const [e, f, g] = c([[180, 62], [66, 62], [66, 168]]);
        line(page, e, f, 1, GOLD_DARK, 0.7);
        line(page, f, g, 1, GOLD_DARK, 0.7);
      }
      seal(page, PW / 2, 118, 44, { centre: "#d9a834", star: true, wreath: true, tails: false, font: bold });
    },
  },
  // Portrait. A cream page in a gold frame with scroll corners, a wreath shield and a wax seal
  {
    id: "ornateCream",
    label: "Ornate Cream",
    color: "#14142b",
    orientation: "portrait",
    layout: (main) =>
      layout({
        cx: PW / 2, w: 440, title: 218, subtitle: 247, intro: 339, name: 400, nameLine: 412, body: 452, sig: 708,
        slots: (two) => (two ? [150, 445] : [150]), titleColor: main, subtitleColor: main, introColor: main, nameColor: "#b8863b", lineColor: "#cfa95b", ink: "#1d1d33",
        titleSize: 56, subtitleSize: 16, subtitleSpacing: 8,
      }),
    draw({ page, main }) {
      fill(page, PW, PH, "#f1ede6");
      fillPath(page, `M470 0 L${PW} 0 L${PW} 220 C560 130 520 60 470 0 Z`, shadeBetween([470, 0], [PW, 220], lighten(main, 0.1), "#000000"));
      fillPath(page, `M440 0 L470 0 C520 60 560 130 ${PW} 220 L${PW} 242 C550 140 500 66 440 0 Z`, goldBetween([440, 0], [PW, 240]));
      fillPath(page, `M0 640 C40 700 90 770 180 ${PH} L0 ${PH} Z`, shadeBetween([0, 640], [180, PH], lighten(main, 0.1), "#000000"));
      fillPath(page, `M0 612 C45 690 105 770 215 ${PH} L180 ${PH} C90 770 40 700 0 640 Z`, goldBetween([0, 612], [215, PH]));
      frame(page, 30, 30, PW - 60, PH - 60, 3, GOLD);
      frame(page, 38, 38, PW - 76, PH - 76, 1, GOLD_LIGHT);
      for (const [fx, fy] of [[false, false], [true, false], [false, true], [true, true]] as const) cornerScroll(page, PW, PH, fx, fy, GOLD);
      // A gold shield inside a wreath
      const gold = goldBetween([258, 70], [338, 160]);
      polygon(page, [[260, 72], [336, 72], [336, 126], [298, 160], [260, 126]], gold);
      laurel(page, 298, 118, 46, gold, 9);
      // A flourish under the subtitle
      line(page, [198, 294], [286, 294], 1.2, main);
      line(page, [310, 294], [398, 294], 1.2, main);
      polygon(page, [[298, 287], [305, 294], [298, 301], [291, 294]], main);
      waxSeal(page, PW / 2, 632, 38);
    },
  },
  // Portrait. A pale page with blue and gold stripes at the edges, a double frame and a medal with navy ribbons
  {
    id: "excellence",
    label: "Excellence",
    color: "#0b2a6f",
    orientation: "portrait",
    layout: () =>
      layout({
        cx: PW / 2, w: 440, title: 331, subtitle: 366, intro: 432, name: 492, nameLine: 506, body: 540, sig: 700,
        slots: (two) => (two ? [195, 400] : [195]), titleColor: INK, subtitleColor: INK, introColor: INK, nameColor: INK, lineColor: INK,
        titleSize: 52, subtitleSize: 16, subtitleSpacing: 9,
      }),
    draw({ page, main, bold }) {
      fill(page, PW, PH, "#ffffff");
      const blue = (a: Point, b: Point) => shadeBetween(a, b, lighten(main, 0.1), darken(main, 0.35));
      polygon(page, [[0, 190], [130, 340], [130, PH], [0, PH]], blue([0, 190], [130, PH]));
      polygon(page, [[0, 300], [130, 450], [130, 480], [0, 330]], goldBetween([0, 300], [130, 480]));
      polygon(page, [[PW, 0], [PW - 130, 0], [PW - 130, 560], [PW, 430]], blue([PW, 0], [PW - 130, 560]));
      polygon(page, [[PW - 80, 0], [PW - 50, 0], [PW - 50, 40], [PW - 80, 40]], goldBetween([PW - 80, 0], [PW - 50, 40]));
      polygon(page, [[PW, 430], [PW - 130, 560], [PW - 130, 590], [PW, 460]], goldBetween([PW, 430], [PW - 130, 590]));
      polygon(page, [[0, 790], [210, PH], [0, PH]], blue([0, 790], [210, PH]));
      polygon(page, [[130, 820], [190, 820], [190, PH], [150, PH]], goldBetween([130, 820], [190, PH]));
      // The pale panel with the stripes showing only at its edges
      page.drawRectangle({ x: 17, y: Y(822), width: PW - 34, height: 803, color: hex("#eceded") });
      polygon(page, [[120, 250], [230, 350], [230, PH - 30], [120, PH - 30]], "#ffffff", 0.22);
      frame(page, 30, 32, PW - 60, PH - 64, 1.3, "#141414");
      frame(page, 38, 40, PW - 76, PH - 80, 0.9, "#141414");
      seal(page, PW / 2, 180, 52, { centre: "#e6c874", star: true, wreath: true, ribbon: shadeBetween([250, 200], [350, 310], lighten(main, 0.1), darken(main, 0.35)), font: bold });
    },
  },
  // Landscape. A navy panel with crossing gold lines and a big medal on the left, a gold frame with corner brackets
  {
    id: "navyPanel",
    label: "Navy Panel",
    color: "#23227a",
    layout: () =>
      layout({
        cx: 570, w: 440, title: 160, subtitle: 190, intro: 242, name: 306, nameLine: 318, body: 352, sig: 478,
        slots: (two) => (two ? [470, 690] : [570]), titleColor: "#4b4033", subtitleColor: "#4b4033", introColor: "#4b4033", nameColor: GOLD_DARK, lineColor: GOLD, ink: "#2e2a25",
        titleSize: 50, subtitleSize: 20, subtitleSpacing: 3,
      }),
    draw({ page, main, bold }) {
      frame(page, 18, 19, W - 36, H - 38, 2.5, GOLD);
      // Nested gold brackets in the top right and bottom right corners
      for (let i = 0; i < 3; i++) {
        const o = i * 6;
        line(page, [W - 120 + o * 2, 30 + o], [W - 30 - o, 30 + o], 1.3, GOLD);
        line(page, [W - 30 - o, 30 + o], [W - 30 - o, 110 - o * 2], 1.3, GOLD);
        line(page, [W - 120 + o * 2, H - 30 - o], [W - 30 - o, H - 30 - o], 1.3, GOLD);
        line(page, [W - 30 - o, H - 30 - o], [W - 30 - o, H - 110 + o * 2], 1.3, GOLD);
      }
      polygon(page, [[18, 19], [275, 19], [174, 284], [247, 577], [18, 577]], shadeBetween([18, 0], [275, 0], lighten(main, 0.1), darken(main, 0.7)));
      const goldLine = (a: Point, b: Point) => {
        line(page, a, b, 4, GOLD);
        line(page, a, b, 1.2, GOLD_LIGHT);
      };
      goldLine([18, 72], [128, 262]);
      goldLine([18, 120], [114, 288]);
      goldLine([164, 346], [214, 577]);
      goldLine([194, 330], [246, 577]);
      seal(page, 140, 300, 58, { centre: "#b8862a", star: false, wreath: false, font: bold });
    },
  },
  // Landscape. A white page with a double gold frame, a plain serif name and a white and gold medal
  {
    id: "cleanFrame",
    label: "Clean Frame",
    color: "#c9a043",
    layout: () =>
      layout({
        cx: W / 2, w: 640, title: 152, subtitle: 186, intro: 228, name: 304, nameLine: 318, body: 352, sig: 462,
        slots: (two) => (two ? [W / 2 - 240, W / 2 + 240] : [W / 2 - 240]), titleColor: "#303030", subtitleColor: "#303030", introColor: "#444444", nameColor: "#2a2a2a", lineColor: GOLD, ink: "#333333",
        titleSize: 54, titleSpacing: 12, subtitleSize: 12, subtitleSpacing: 10, nameFont: "title",
      }),
    draw({ page, main, bold }) {
      frame(page, 36, 36, W - 72, H - 72, 3.2, GOLD);
      frame(page, 44, 44, W - 88, H - 88, 3, "#e6e4e2");
      frame(page, 50, 50, W - 100, H - 100, 0.8, GOLD_LIGHT);
      seal(page, W / 2, 468, 36, { centre: main, star: false, wreath: false, ribbon: shadeBetween([380, 470], [460, 560], "#ffffff", "#e0cf8a"), font: bold });
    },
  },
  // Landscape. White with navy and light-blue corners, a thin frame and a flat blue badge
  {
    id: "blueCorners",
    label: "Blue Corners",
    color: "#1b4380",
    layout: () =>
      layout({
        cx: W / 2, w: 640, title: 113, subtitle: 156, intro: 197, name: 284, nameLine: 300, body: 337, sig: 490,
        slots: (two) => (two ? [229, 613] : [229]), titleColor: "#0a1f44", subtitleColor: "#0a1f44", introColor: "#0a1f44", nameColor: "#4a7dc9", lineColor: "#4a7dc9", ink: "#0a1f44",
        titleFont: "display", titleSize: 52, titleSpacing: 2, subtitleSize: 20, subtitleSpacing: 4,
      }),
    draw({ page, main, bold }) {
      void bold;
      const dark = shadeBetween([0, 0], [150, 150], lighten(main, 0.1), darken(main, 0.35));
      const light = lighten(main, 0.35);
      for (const [fx, fy] of [[false, false], [true, false], [false, true], [true, true]] as const) {
        polygon(page, corner([[0, 0], [118, 0], [0, 118]], fx, fy, W, H), dark);
        polygon(page, corner([[118, 0], [150, 0], [0, 150], [0, 118]], fx, fy, W, H), light);
      }
      line(page, [124, 22], [W - 124, 22], 2, main);
      line(page, [124, H - 22], [W - 124, H - 22], 2, main);
      line(page, [22, 124], [22, H - 124], 2, main);
      line(page, [W - 22, 124], [W - 22, H - 124], 2, main);
      // Lines either side of the subtitle
      line(page, [150, 151], [262, 151], 2, "#0a1f44");
      line(page, [W - 150, 151], [W - 262, 151], 2, "#0a1f44");
      flatBadge(page, W / 2, 470, 46, main, light);
    },
  },
  // Landscape. A fine patterned border, scroll corners and a name in capitals with a divider
  {
    id: "ornateBlue",
    label: "Ornate Border",
    color: "#0f1f5c",
    layout: (main) =>
      layout({
        cx: W / 2, w: 600, title: 150, subtitle: 182, intro: 224, name: 285, nameLine: 297, body: 342, sig: 462,
        slots: (two) => (two ? [W / 2 - 200, W / 2 + 200] : [W / 2 - 200]), titleColor: main, subtitleColor: main, introColor: main, nameColor: main, lineColor: main, ink: darken(main, 0.3),
        titleFont: "display", titleSize: 50, titleSpacing: 2, subtitleSize: 16, subtitleSpacing: 6, nameFont: "display", nameCaps: true, noNameLine: true,
      }),
    draw({ page, main }) {
      const soft = lighten(main, 0.55);
      // A chain of small beads around the edge
      for (let x = 34; x < W - 30; x += 9) {
        for (const y of [24, H - 24]) page.drawCircle({ x, y: Y(y), size: 2.4, color: hex(soft) });
        for (const y of [32, H - 32]) page.drawCircle({ x, y: Y(y), size: 1.6, color: hex(soft) });
      }
      for (let y = 34; y < H - 30; y += 9) {
        for (const x of [24, W - 24]) page.drawCircle({ x, y: Y(y), size: 2.4, color: hex(soft) });
        for (const x of [32, W - 32]) page.drawCircle({ x, y: Y(y), size: 1.6, color: hex(soft) });
      }
      frame(page, 18, 18, W - 36, H - 36, 1.4, main);
      frame(page, 46, 46, W - 92, H - 92, 1, main);
      for (const [fx, fy] of [[false, false], [true, false], [false, true], [true, true]] as const) cornerScroll(page, W, H, fx, fy, main);
      // The divider under the name
      const cx = W / 2;
      line(page, [cx - 170, 298], [cx - 18, 298], 1.6, main);
      line(page, [cx + 18, 298], [cx + 170, 298], 1.6, main);
      polygon(page, [[cx, 290], [cx + 8, 298], [cx, 306], [cx - 8, 298]], main);
    },
  },
];
