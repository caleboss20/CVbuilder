/**
 * The certificate designs. Each one is a background drawing plus a layout (where each line of text
 * goes and in which colours). They are drawn from vector shapes with the toolkit in
 * certificate-draw.ts, so the accent colour can change a design's main colour and every one prints
 * sharply. To add a design: write its entry here (or in certificate-designs-more.ts) and add its id
 * to `CertDesign` in certificate-design-types.ts.
 */

import type { PDFFont, PDFPage } from "pdf-lib";
import { layout, type CertDesign, type DesignDef } from "./certificate-design-types";
import { MORE_DESIGNS } from "./certificate-designs-more";
import {
  GOLD,
  GOLD_LIGHT,
  INK,
  PAGE_H,
  PAGE_W,
  darken,
  fillPath,
  flowLines,
  frame,
  goldBetween,
  hex,
  laurel,
  lighten,
  line,
  polygon,
  roundedSquare,
  seal,
  shadeBetween,
  curve,
  type Point,
} from "./certificate-draw";

export type { CertDesign };

const W = PAGE_W;
const H = PAGE_H;

const bg = (page: PDFPage, color: string) => page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: hex(color) });

/** The mirror image of a point or list of points across the page, for designs with matching corners. */
const flipXY = ([x, y]: Point): Point => [W - x, H - y];

function hexagon(cx: number, cy: number, r: number): Point[] {
  return Array.from({ length: 6 }, (_, i) => [cx + r * Math.cos((i * Math.PI) / 3 + Math.PI / 6), cy + r * Math.sin((i * Math.PI) / 3 + Math.PI / 6)] as Point);
}

/** A hexagon ring: a filled hexagon with a smaller one in the page colour on top. */
function hexRing(page: PDFPage, cx: number, cy: number, r: number, color: string, thickness: number, back = "#ffffff") {
  polygon(page, hexagon(cx, cy, r), color);
  polygon(page, hexagon(cx, cy, r - thickness), back);
}

const dots = (page: PDFPage, x: number, y: number, cols: number, rows: number, gap: number, r: number, color: string) => {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) page.drawCircle({ x: x + i * gap, y: H - (y + j * gap), size: r, color: hex(color) });
  }
};

/** Squares and diamonds in two colours, the look of designs 1 and 2 in the reference set. */
function squares(page: PDFPage, main: string, accent: string, mirrored: boolean) {
  const mx = (x: number) => (mirrored ? W - x : x);
  const dark = "#3d3d3d";
  roundedSquare(page, mx(70), 515, 310, 310, mirrored ? 20 : -20, 70, shadeBetween([mx(0), 360], [mx(260), 595], lighten(main, 0.15), darken(main, 0.45)));
  roundedSquare(page, mx(190), 458, 124, 124, 38, 24, dark, 0.88);
  roundedSquare(page, mx(228), 508, 104, 104, 38, 22, "#9aa0a6", 0.55);
  roundedSquare(page, mx(100), 318, 70, 70, 32, 16, shadeBetween([mx(70), 280], [mx(130), 350], lighten(main, 0.2), darken(main, 0.3)));
  roundedSquare(page, mx(58), 244, 34, 34, 30, 9, accent);
  roundedSquare(page, mx(800), 98, 100, 100, 38, 24, dark, 0.9);
  roundedSquare(page, mx(836), 142, 84, 84, 38, 20, shadeBetween([mx(800), 100], [mx(860), 180], lighten(main, 0.2), darken(main, 0.3)));
  roundedSquare(page, mx(805), 262, 34, 34, 30, 9, accent);
}

/** The black ribbon with a round badge at its foot, hanging from the top edge. */
function ribbonBadge(page: PDFPage, x: number, main: string, bold: PDFFont) {
  polygon(page, [[x - 36, 0], [x + 36, 0], [x + 36, 128], [x, 108], [x - 36, 128]], "#161616");
  line(page, [x - 36, 0], [x - 36, 128], 3, main);
  line(page, [x + 36, 0], [x + 36, 128], 3, main);
  seal(page, x, 150, 38, { centre: "#161616", star: true, wreath: true, ribbon: shadeBetween([x - 40, 150], [x + 40, 260], lighten(main, 0.1), darken(main, 0.4)), font: bold });
}

const BASE_DESIGNS: DesignDef[] = [
  // 1. Wave bands top and bottom with a gold ribbon along each, and a seal on the left
  {
    id: "navyWaves",
    label: "Navy Waves",
    color: "#14305c",
    layout: (main) => layout({ cx: 455, w: 620, title: 196, subtitle: 228, intro: 282, name: 352, nameLine: 366, body: 402, sig: 462, titleColor: main, subtitleColor: main }),
    draw({ page, main, bold }) {
      const navy = shadeBetween([0, 0], [W, 0], darken(main, 0.15), lighten(main, 0.2));
      fillPath(page, `M0 0 L${W} 0 L${W} 60 C720 100 560 40 400 62 C250 82 120 100 0 82 Z`, navy);
      fillPath(page, `M0 0 L${W} 0 L${W} 36 C700 74 560 22 400 40 C250 56 120 70 0 54 Z`, lighten(main, 0.4), 0.3);
      fillPath(page, `M0 82 C120 100 250 82 400 62 C560 40 720 100 ${W} 60 L${W} 70 C720 110 560 50 400 72 C250 92 120 110 0 92 Z`, goldBetween([0, 0], [W, 0]));
      fillPath(page, `M0 ${H} L${W} ${H} L${W} 540 C720 500 560 556 400 536 C250 518 120 500 0 520 Z`, navy);
      fillPath(page, `M0 ${H} L${W} ${H} L${W} 562 C720 530 560 576 400 558 C250 542 120 526 0 544 Z`, lighten(main, 0.4), 0.3);
      fillPath(page, `M0 520 C120 500 250 518 400 536 C560 556 720 500 ${W} 540 L${W} 531 C720 491 560 547 400 527 C250 509 120 491 0 511 Z`, goldBetween([0, 0], [W, 0]));
      seal(page, 120, 114, 40, { centre: main, star: true, wreath: true, font: bold });
    },
  },
  // 2. A dark curved panel carrying a big gold medal, with gold ribbons and a gold frame
  {
    id: "blackGold",
    label: "Black & Gold",
    color: "#161616",
    layout: () => layout({ cx: 540, w: 500, title: 190, subtitle: 222, intro: 276, name: 346, nameLine: 360, body: 396, sig: 470 }),
    draw({ page, main, bold }) {
      fillPath(page, "M0 0 L205 0 C140 150 130 330 190 595 L0 595 Z", shadeBetween([0, 0], [205, 595], lighten(main, 0.05), lighten(main, 0.3)));
      fillPath(page, "M205 0 C140 150 130 330 190 595 L232 595 C176 330 190 150 252 0 Z", goldBetween([205, 0], [250, 595]));
      fillPath(page, "M252 0 C190 150 176 330 232 595 L240 595 C186 330 198 150 260 0 Z", goldBetween([250, 0], [210, 595]));
      seal(page, 112, 190, 64, { centre: main, star: true, wreath: true, font: bold });
    },
    foreground({ page }) {
      frame(page, 14, 14, W - 28, H - 28, 5, GOLD);
      frame(page, 25, 25, W - 50, H - 50, 1.2, GOLD_LIGHT);
    },
  },
  // 3. Notched corners, a double gold frame, a flourish on top and a medal below
  {
    id: "goldFrame",
    label: "Gold Frame",
    color: "#14305c",
    layout: (main) =>
      layout({ w: 600, title: 178, subtitle: 208, intro: 256, name: 322, nameLine: 336, body: 370, sig: 470, slots: (two) => (two ? [W / 2 - 215, W / 2 + 215] : [W / 2 - 215]), titleColor: main, subtitleColor: main, nameColor: main }),
    draw({ page, main, bold }) {
      const corner = (flipX: boolean, flipY: boolean) => {
        const place = ([x, y]: Point): Point => [flipX ? W - x : x, flipY ? H - y : y];
        const pts: Point[] = [[0, 0], [150, 0], [118, 32], [32, 32], [32, 118], [0, 150]];
        polygon(page, pts.map(place), shadeBetween([0, 0], [150, 150], lighten(main, 0.15), darken(main, 0.3)));
        const [a, b, c] = ([[125, 40], [40, 40], [40, 125]] as Point[]).map(place);
        line(page, a, b, 3, GOLD);
        line(page, b, c, 3, GOLD);
      };
      corner(false, false);
      corner(true, false);
      corner(false, true);
      corner(true, true);
      const t = 34;
      line(page, [150, t], [W - 150, t], 4, GOLD);
      line(page, [150, H - t], [W - 150, H - t], 4, GOLD);
      line(page, [t, 150], [t, H - 150], 4, GOLD);
      line(page, [W - t, 150], [W - t, H - 150], 4, GOLD);
      frame(page, 48, 48, W - 96, H - 96, 1, GOLD_LIGHT);
      const cx = W / 2;
      line(page, [cx - 90, 92], [cx - 14, 92], 2, GOLD);
      line(page, [cx + 14, 92], [cx + 90, 92], 2, GOLD);
      polygon(page, [[cx, 84], [cx + 8, 92], [cx, 100], [cx - 8, 92]], GOLD);
      seal(page, cx, 452, 31, { centre: main, star: true, wreath: true, font: bold });
    },
  },
  // 4. Black and gold swooshes in two corners, a double gold frame and a wreath medal
  {
    id: "blackSwoosh",
    label: "Black Swoosh",
    color: "#171717",
    layout: () => layout({ cx: 421, w: 580, title: 126, subtitle: 154, intro: 232, name: 312, nameLine: 326, body: 362, sig: 468, nameColor: "#d9a32a", titleColor: "#373737", subtitleColor: "#2a2a2a" }),
    draw({ page, main, bold }) {
      bg(page, "#f6f5f2");
      flowLines(page, [0, 30], [330, 90], 12, 5, GOLD_LIGHT, 0.4);
      flowLines(page, [W - 360, H - 150], [360, 90], 12, 5, GOLD_LIGHT, 0.4);
      frame(page, 30, 30, W - 60, H - 60, 2.5, GOLD);
      frame(page, 39, 39, W - 78, H - 78, 1, GOLD_LIGHT);
      const dark = shadeBetween([600, 0], [W, 260], lighten(main, 0.25), main);
      fillPath(page, `M640 0 L${W} 0 L${W} 240 C800 120 730 50 640 0 Z`, dark);
      fillPath(page, `M618 0 L640 0 C730 50 800 120 ${W} 240 L${W} 264 C790 140 712 66 618 0 Z`, goldBetween([600, 0], [W, 260]));
      fillPath(page, `M596 0 L606 0 C700 66 780 150 ${W} 292 L${W} 282 C776 156 698 80 596 0 Z`, goldBetween([W, 0], [600, 260]));
      fillPath(page, `M0 330 C60 420 160 520 300 ${H} L0 ${H} Z`, shadeBetween([0, 330], [300, H], lighten(main, 0.25), main));
      fillPath(page, `M0 302 C75 405 185 520 345 ${H} L300 ${H} C160 520 60 420 0 330 Z`, goldBetween([0, 300], [340, H]));
      fillPath(page, `M0 282 C85 395 200 520 382 ${H} L352 ${H} C190 520 80 405 0 302 Z`, goldBetween([340, H], [0, 300]));
      seal(page, 132, 128, 42, { centre: "#121212", star: true, wreath: true, font: bold });
    },
  },
  // 5. Green waves with gold lines down the left, and a big gold medal
  {
    id: "emerald",
    label: "Emerald",
    color: "#0f5a3c",
    layout: (main) =>
      layout({ cx: 565, w: 430, title: 170, subtitle: 204, intro: 252, name: 322, nameLine: 336, body: 372, sig: 468, titleColor: main, subtitleColor: main, nameColor: "#b7762b", lineColor: main, titleSize: 50 }),
    draw({ page, main, bold }) {
      bg(page, "#f4f4f1");
      fillPath(page, `M0 0 L150 0 C215 110 95 230 145 360 C180 470 120 540 165 ${H} L0 ${H} Z`, shadeBetween([0, 0], [180, 0], darken(main, 0.3), lighten(main, 0.1)));
      fillPath(page, `M0 0 L96 0 C160 120 40 240 92 360 C128 470 72 540 108 ${H} L0 ${H} Z`, lighten(main, 0.2), 0.35);
      [3.4, 2.4, 1.8, 1.2].forEach((thick, k) => {
        const dx = 6 + k * 11;
        curve(page, [[[150 + dx, 0], [215 + dx, 110], [95 + dx, 230], [145 + dx, 360]], [[145 + dx, 360], [180 + dx, 470], [120 + dx, 540], [165 + dx, H]]], thick, k % 2 ? GOLD_LIGHT : GOLD);
      });
      seal(page, 150, 300, 72, { centre: "#caa238", star: false, wreath: true, font: bold });
    },
  },
  // 6. Purple and blue waves, hexagons and dots, and a medal at the top right
  {
    id: "purpleHex",
    label: "Hexagons",
    color: "#3949ab",
    layout: (main) =>
      layout({ cx: 421, w: 580, title: 168, subtitle: 200, intro: 258, name: 334, nameLine: 348, body: 388, sig: 478, titleColor: darken(main, 0.45), subtitleColor: darken(main, 0.2), nameColor: main, titleFont: "bold", titleSize: 48, slots: (two) => (two ? [215, 625] : [215]) }),
    draw({ page, main, bold }) {
      const band = shadeBetween([0, 0], [W, 0], darken(main, 0.25), lighten(main, 0.4));
      fillPath(page, `M0 0 L${W} 0 L${W} 38 C700 92 520 26 380 52 C240 78 100 112 0 68 Z`, band);
      fillPath(page, `M0 0 L${W} 0 L${W} 20 C700 62 520 4 380 30 C240 56 100 86 0 44 Z`, lighten(main, 0.5), 0.35);
      fillPath(page, `M0 ${H} L${W} ${H} L${W} 557 C700 503 520 569 380 543 C240 517 100 483 0 527 Z`, band);
      fillPath(page, `M0 ${H} L${W} ${H} L${W} 575 C700 533 520 591 380 565 C240 539 100 509 0 551 Z`, lighten(main, 0.5), 0.35);
      page.drawCircle({ x: W / 2, y: H - 330, size: 140, color: hex(lighten(main, 0.93)), opacity: 0.8 });
      polygon(page, hexagon(34, 150, 34), lighten(main, 0.88));
      hexRing(page, 92, 196, 42, main, 9);
      polygon(page, hexagon(38, 240, 26), main);
      dots(page, 24, 92, 4, 2, 16, 4.2, main);
      page.drawCircle({ x: 150, y: H - 96, size: 32, color: hex(main) });
      page.drawCircle({ x: 150, y: H - 96, size: 20, color: hex("#ffffff") });
      polygon(page, hexagon(W - 38, 470, 34), lighten(main, 0.88));
      hexRing(page, W - 96, 420, 42, main, 9);
      polygon(page, hexagon(W - 40, 372, 26), main);
      dots(page, W - 80, 508, 4, 2, 16, 4.2, main);
      seal(page, 735, 150, 44, { centre: main, star: true, wreath: false, ribbon: goldBetween([700, 150], [780, 260]), font: bold });
    },
  },
  // 7. Diagonal blue stripes in two corners, a thin frame and a gold medal at the bottom
  {
    id: "blueStripes",
    label: "Blue Stripes",
    color: "#1d4ed8",
    layout: (main) =>
      layout({ cx: 421, w: 560, title: 150, subtitle: 180, intro: 236, name: 314, nameLine: 328, body: 362, sig: 470, titleColor: darken(main, 0.35), subtitleColor: main, nameColor: main, slots: (two) => (two ? [231, 611] : [231]) }),
    draw({ page, main, bold }) {
      const shapes: { pts: Point[]; paint: string | ReturnType<typeof shadeBetween> }[] = [
        { pts: [[0, 0], [150, 0], [0, 250]], paint: darken(main, 0.4) },
        { pts: [[150, 0], [250, 0], [0, 360], [0, 250]], paint: shadeBetween([0, 0], [250, 360], main, lighten(main, 0.1)) },
        { pts: [[250, 0], [305, 0], [0, 415], [0, 360]], paint: "#38bdf8" },
      ];
      for (const s of shapes) {
        polygon(page, s.pts, s.paint);
        polygon(page, s.pts.map(flipXY), s.paint);
      }
      line(page, [340, 0], [0, 470], 1.4, "#38bdf8", 0.6);
      line(page, [W - 340, H], [W, H - 470], 1.4, "#38bdf8", 0.6);
      line(page, [300, 24], [790, 24], 2, main);
      line(page, [790, 24], [790, 116], 2, main);
      line(page, [44, 480], [44, 572], 2, main);
      line(page, [44, 572], [540, 572], 2, main);
      seal(page, 421, 480, 34, { centre: "#b98a1d", star: true, wreath: true, font: bold });
    },
  },
  // 8. Bright blue blades top right and bottom left, a "best award" badge and a "1st" wreath
  {
    id: "skyBlades",
    label: "Sky Blades",
    color: "#0a8de0",
    layout: (main) =>
      layout({ cx: 421, w: 560, title: 176, subtitle: 208, intro: 262, name: 332, nameLine: 346, body: 380, sig: 474, titleColor: INK, subtitleColor: INK, nameColor: main, titleFont: "bold", titleSize: 44, slots: (two) => (two ? [231, 611] : [231]) }),
    draw({ page, main, bold }) {
      bg(page, "#ffffff");
      polygon(page, [[0, 150], [300, 0], [330, 0], [0, 250]], "#e5e7eb", 0.5);
      polygon(page, [[842, 440], [560, 595], [520, 595], [842, 340]], "#e5e7eb", 0.5);
      fillPath(page, `M470 0 L${W} 0 L${W} 150 C800 118 740 86 700 56 C640 14 540 0 470 0 Z`, shadeBetween([470, 0], [W, 150], lighten(main, 0.15), darken(main, 0.15)));
      fillPath(page, `M600 0 L${W} 0 L${W} 250 C836 150 770 70 600 0 Z`, shadeBetween([600, 0], [W, 250], main, darken(main, 0.4)));
      fillPath(page, `M0 330 C60 420 150 500 250 ${H} L0 ${H} Z`, shadeBetween([0, 330], [250, H], main, darken(main, 0.4)));
      fillPath(page, `M0 400 C50 480 120 545 190 ${H} L0 ${H} Z`, lighten(main, 0.3), 0.5);
      seal(page, 100, 98, 40, { centre: darken(main, 0.1), text: ["BEST", "AWARD"], ribbon: shadeBetween([60, 100], [140, 200], main, darken(main, 0.4)), font: bold });
      laurel(page, 421, 478, 30, INK, 8);
      page.drawText("1st", { x: 421 - bold.widthOfTextAtSize("1st", 14) / 2, y: H - 484, size: 14, font: bold, color: hex(INK) });
    },
  },
  // 9. Red rounded squares and a black ribbon badge
  {
    id: "redSquares",
    label: "Red Squares",
    color: "#b1121f",
    layout: (main) => layout({ cx: 450, w: 500, title: 196, subtitle: 226, intro: 288, name: 346, nameLine: 360, body: 396, sig: 468, titleColor: INK, subtitleColor: main, nameColor: main, lineColor: INK }),
    draw({ page, main, bold }) {
      bg(page, "#f1f1f1");
      squares(page, main, "#f59e0b", false);
      ribbonBadge(page, 180, main, bold);
    },
  },
  // 10. The same idea in orange and black, with the squares on the right
  {
    id: "orangeSquares",
    label: "Orange Squares",
    color: "#f08a00",
    layout: (main) => layout({ cx: 440, w: 500, title: 196, subtitle: 226, intro: 288, name: 346, nameLine: 360, body: 396, sig: 468, titleColor: INK, subtitleColor: darken(main, 0.1), nameColor: "#8a1c1c", lineColor: INK }),
    draw({ page, main, bold }) {
      bg(page, "#f3f2ef");
      squares(page, main, "#ffb347", true);
      ribbonBadge(page, 180, main, bold);
    },
  },
  // 11. A navy wave with red and orange swooshes, and a "best award" medal
  {
    id: "navyRed",
    label: "Navy & Red",
    color: "#12335b",
    layout: (main) =>
      layout({ cx: 575, w: 440, title: 186, subtitle: 216, intro: 276, name: 340, nameLine: 354, body: 388, sig: 470, titleColor: main, subtitleColor: main, nameColor: "#d1481c", lineColor: main, titleFont: "bold", titleSize: 46 }),
    draw({ page, main, bold }) {
      const navy = shadeBetween([0, 0], [430, 200], darken(main, 0.1), lighten(main, 0.25));
      fillPath(page, "M0 0 L440 0 C390 62 310 112 224 152 C140 192 60 212 0 204 Z", navy);
      fillPath(page, "M0 0 L330 0 C290 44 230 84 160 112 C100 134 40 142 0 136 Z", lighten(main, 0.35), 0.3);
      fillPath(page, "M0 150 C90 212 200 192 300 132 C360 96 410 52 444 0 L476 0 C436 72 384 124 314 164 C202 226 82 244 0 192 Z", shadeBetween([0, 200], [470, 0], "#c8102e", "#ff8a1f"));
      fillPath(page, "M0 150 C90 212 200 192 300 132 C360 96 410 52 444 0 L450 0 C412 56 360 104 306 138 C200 200 90 220 0 160 Z", "#ffffff", 0.9);
      fillPath(page, `M0 ${H} L0 520 C70 500 150 520 300 575 L336 ${H} Z`, shadeBetween([0, 520], [340, H], main, lighten(main, 0.25)));
      fillPath(page, "M0 508 C80 486 162 506 322 566 L338 578 C170 514 82 492 0 516 Z", shadeBetween([0, 510], [340, 580], "#ff8a1f", "#c8102e"));
      seal(page, 150, 330, 40, { centre: main, text: ["BEST", "AWARD"], ribbon: shadeBetween([110, 330], [190, 440], main, darken(main, 0.4)), font: bold });
    },
  },
  // 12. A deep navy page with gold writing, round arcs and a gold ribbon seal
  {
    id: "darkGold",
    label: "Dark & Gold",
    color: "#0b1a3a",
    layout: () =>
      layout({ cx: 470, w: 520, title: 190, subtitle: 222, intro: 276, name: 346, nameLine: 360, body: 398, sig: 470, ink: "#d7def0", grey: "#aab4d0", titleColor: "#e2b440", subtitleColor: "#c9d2e8", introColor: "#aab4d0", nameColor: "#e2b440", lineColor: "#e2b440", titleFont: "bold", titleSize: 46 }),
    draw({ page, main, bold }) {
      fillPath(page, `M0 0 L${W} 0 L${W} ${H} L0 ${H} Z`, shadeBetween([0, 0], [W, H], darken(main, 0.25), lighten(main, 0.18)));
      page.drawCircle({ x: 0, y: H - 300, size: 300, color: hex(lighten(main, 0.12)), opacity: 0.4 });
      page.drawCircle({ x: 0, y: H - 330, size: 150, borderColor: hex(lighten(main, 0.3)), borderWidth: 1.2 });
      page.drawCircle({ x: 40, y: H - 560, size: 200, borderColor: hex(lighten(main, 0.3)), borderWidth: 1.2, borderOpacity: 0.8 });
      seal(page, 120, 140, 40, { centre: main, star: true, wreath: true, ribbon: goldBetween([80, 140], [160, 260]), font: bold });
    },
  },
  // 13. A navy top band with a gold swoosh, and a ribbon hanging down the left with a medal
  {
    id: "ribbonBlue",
    label: "Ribbon & Medal",
    color: "#1e3a8a",
    layout: (main) =>
      layout({ cx: 490, w: 520, title: 200, subtitle: 232, intro: 284, name: 352, nameLine: 366, body: 402, sig: 478, titleColor: main, subtitleColor: INK, nameColor: "#8e1c2b", lineColor: main }),
    draw({ page, main, bold }) {
      bg(page, "#f7f7f5");
      flowLines(page, [W - 300, H - 130], [300, 80], 10, 5, GOLD_LIGHT, 0.45);
      fillPath(page, `M0 0 L${W} 0 L${W} 82 C700 112 520 62 380 86 C240 108 100 126 0 102 Z`, shadeBetween([0, 0], [W, 0], darken(main, 0.2), lighten(main, 0.15)));
      fillPath(page, `M0 104 C100 130 240 112 380 90 C520 66 700 116 ${W} 86 L${W} 98 C700 128 520 78 380 102 C240 124 100 142 0 116 Z`, goldBetween([0, 0], [W, 0]));
      polygon(page, [[70, 0], [170, 0], [170, 210], [120, 178], [70, 210]], shadeBetween([70, 0], [170, 210], lighten(main, 0.15), darken(main, 0.25)));
      line(page, [70, 0], [70, 210], 2.5, GOLD);
      line(page, [170, 0], [170, 210], 2.5, GOLD);
      seal(page, 120, 168, 44, { centre: main, text: ["BEST", "AWARD"], tails: false, font: bold });
    },
  },
  // 14. White with light blue flowing lines and a blue wave along the bottom
  {
    id: "lightWave",
    label: "Blue Wave",
    color: "#0b4aa6",
    layout: (main) =>
      layout({ cx: 421, w: 600, title: 168, subtitle: 204, intro: 262, name: 338, nameLine: 352, body: 388, sig: 466, titleColor: main, subtitleColor: main, nameColor: main, lineColor: INK, titleFont: "bold", titleSize: 54, slots: (two) => (two ? [250, 592] : [250]) }),
    draw({ page, main, bold }) {
      flowLines(page, [0, 70], [520, 60], 16, 6, lighten(main, 0.55), 0.55);
      fillPath(page, `M0 ${H} L0 522 C150 470 330 562 520 540 C680 522 770 500 ${W} 478 L${W} ${H} Z`, shadeBetween([0, 500], [W, 560], darken(main, 0.35), lighten(main, 0.1)));
      fillPath(page, `M0 ${H} L0 548 C150 500 330 584 520 566 C680 550 770 532 ${W} 512 L${W} ${H} Z`, lighten(main, 0.4), 0.3);
      seal(page, 421, 470, 32, { centre: "#f7e7a0", star: true, wreath: false, ribbon: shadeBetween([380, 470], [460, 560], main, darken(main, 0.4)), font: bold });
    },
  },
  // 15. Navy swooshes with a thick gold frame, a gold ribbon banner and a medal
  {
    id: "royalGold",
    label: "Royal Gold",
    color: "#14305c",
    layout: (main) =>
      layout({ cx: 421, w: 480, title: 170, subtitle: 200, intro: 232, name: 316, nameLine: 330, body: 364, sig: 450, titleColor: main, subtitleColor: main, introColor: "#ffffff", nameColor: main, lineColor: main, slots: (two) => (two ? [321, 521] : [421]) }),
    draw({ page, main, bold }) {
      bg(page, "#f7f7f6");
      for (let i = 0; i < 16; i++) line(page, [i * 60 - 80, H], [i * 60 + 280, 0], 0.5, "#9aa0a6", 0.1);
      frame(page, 133, 112, 576, 366, 5, GOLD);
      fillPath(page, `M0 0 L170 0 C110 150 100 400 250 ${H} L0 ${H} Z`, shadeBetween([0, 0], [250, H], darken(main, 0.2), lighten(main, 0.2)));
      fillPath(page, `M170 0 C110 150 100 400 250 ${H} L276 ${H} C130 400 140 150 200 0 Z`, goldBetween([170, 0], [276, H]));
      fillPath(page, `M${W} ${H} L${W} 250 C760 380 700 500 640 ${H} Z`, shadeBetween([W, 250], [640, H], lighten(main, 0.15), darken(main, 0.3)));
      fillPath(page, `M${W} 230 C750 370 690 490 626 ${H} L640 ${H} C700 500 760 380 ${W} 250 Z`, goldBetween([W, 230], [626, H]));
      // Gold banner behind the line that introduces the name
      polygon(page, [[300, 214], [542, 214], [554, 224], [542, 236], [300, 236], [288, 224]], goldBetween([288, 214], [554, 236]));
      seal(page, 690, 178, 40, { centre: main, text: ["BEST", "AWARD"], font: bold });
    },
  },
];

/** Every design, in the order the gallery shows them. */
export const DESIGNS: DesignDef[] = [...BASE_DESIGNS, ...MORE_DESIGNS];

export function designById(id: CertDesign): DesignDef {
  return DESIGNS.find((d) => d.id === id) ?? DESIGNS[0];
}
