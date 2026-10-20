/**
 * Drawing toolkit for the certificate designs: colours, real PDF gradients, shapes, laurel wreaths,
 * medals and text helpers. Everything is vector, so certificates stay sharp when printed and each
 * PDF stays small.
 *
 * Coordinates are measured from the TOP LEFT of the page, as on a screen. `Y()` converts to PDF's
 * bottom-left origin only at the moment something is drawn. Colours are "#rrggbb" strings.
 */

import {
  LineCapStyle,
  PDFDict,
  PDFName,
  PDFOperator,
  PDFOperatorNames as Ops,
  appendBezierCurve,
  closePath,
  fill,
  lineTo,
  moveTo,
  popGraphicsState,
  pushGraphicsState,
  rgb,
  type PDFFont,
  type PDFPage,
  type RGB,
} from "pdf-lib";

/** A4 landscape, in PDF points. */
export const PAGE_W = 841.89;
export const PAGE_H = 595.28;
/**
 * Height of the page being drawn. Certificates can be landscape or portrait, so the converter below
 * reads it at the moment of drawing. `setPageHeight` is called once before each page is drawn.
 */
let currentHeight = PAGE_H;
export const setPageHeight = (height: number) => {
  currentHeight = height;
};
export const Y = (top: number) => currentHeight - top;

export type Point = [number, number];

// ---------------------------------------------------------------------- colours

export function hex(color: string): RGB {
  const n = parseInt(color.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

const toHex = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, "0");

/** Blends two colours: 0 gives `a`, 1 gives `b`. */
export function mix(a: string, b: string, t: number): string {
  const x = hex(a);
  const y = hex(b);
  return `#${toHex((x.red + (y.red - x.red) * t) * 255)}${toHex((x.green + (y.green - x.green) * t) * 255)}${toHex((x.blue + (y.blue - x.blue) * t) * 255)}`;
}

/** Lighter (towards white) by `t`. */
export const lighten = (color: string, t: number) => mix(color, "#ffffff", t);
/** Darker (towards black) by `t`. */
export const darken = (color: string, t: number) => mix(color, "#000000", t);

export const GOLD = "#c9a227";
export const GOLD_LIGHT = "#f0dc8a";
export const GOLD_DARK = "#a87a14";
export const INK = "#22262e";
export const GREY = "#555b66";

// -------------------------------------------------------------------- gradients

export type Stop = [number, string];
export type Gradient =
  | { kind: "axial"; from: Point; to: Point; stops: Stop[] }
  | { kind: "radial"; at: Point; r0: number; r1: number; stops: Stop[] };

export type Paint = string | Gradient;

/** A shiny gold running from one point to another, like a metal ribbon. */
export const goldBetween = (from: Point, to: Point): Gradient => ({
  kind: "axial",
  from,
  to,
  stops: [
    [0, "#f6e394"],
    [0.3, "#d9a92c"],
    [0.55, "#fff0a8"],
    [0.8, "#c08f1e"],
    [1, "#efd070"],
  ],
});

/** A lightly shaded fill from the colour to a lighter or darker version of itself. */
export const shadeBetween = (from: Point, to: Point, a: string, b: string): Gradient => ({ kind: "axial", from, to, stops: [[0, a], [1, b]] });

const rgbArray = (color: string) => {
  const c = hex(color);
  return [c.red, c.green, c.blue];
};

/** The PDF function that blends the stops: one blend for two stops, stitched blends for more. */
function colourFunction(stops: Stop[]) {
  const blends = stops.slice(0, -1).map((s, i) => ({ FunctionType: 2, Domain: [0, 1], C0: rgbArray(s[1]), C1: rgbArray(stops[i + 1][1]), N: 1 }));
  if (blends.length === 1) return blends[0];
  return { FunctionType: 3, Domain: [0, 1], Functions: blends, Bounds: stops.slice(1, -1).map((s) => s[0]), Encode: blends.flatMap(() => [0, 1]) };
}

const gradientCount = new WeakMap<PDFPage, number>();

/** Adds the gradient to the page's resources and returns the name to fill with. */
function registerGradient(page: PDFPage, g: Gradient): string {
  const n = (gradientCount.get(page) ?? 0) + 1;
  gradientCount.set(page, n);
  const name = `G${n}`;

  const shading =
    g.kind === "axial"
      ? { ShadingType: 2, Coords: [g.from[0], Y(g.from[1]), g.to[0], Y(g.to[1])] }
      : { ShadingType: 3, Coords: [g.at[0], Y(g.at[1]), g.r0, g.at[0], Y(g.at[1]), g.r1] };

  const context = page.doc.context;
  const ref = context.register(
    context.obj({ PatternType: 2, Shading: { ...shading, ColorSpace: "DeviceRGB", Function: colourFunction(g.stops), Extend: [true, true] } }),
  );

  const resources = page.node.normalizedEntries().Resources;
  let patterns = resources.lookupMaybe(PDFName.of("Pattern"), PDFDict);
  if (!patterns) {
    patterns = context.obj({});
    resources.set(PDFName.of("Pattern"), patterns);
  }
  patterns.set(PDFName.of(name), ref);
  return name;
}

// ------------------------------------------------------------------------ paths

/** Turns a path written with absolute M, L, C and Z commands (top-left coordinates) into PDF operators. */
function pathOperators(d: string): PDFOperator[] {
  const tokens = d.match(/[MLCZ]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? [];
  const ops: PDFOperator[] = [];
  const arity: Record<string, number> = { M: 2, L: 2, C: 6, Z: 0 };
  let i = 0;
  let cmd = "M";
  while (i < tokens.length) {
    if (/[MLCZ]/.test(tokens[i])) cmd = tokens[i++];
    const n = arity[cmd];
    const v = tokens.slice(i, i + n).map(Number);
    i += n;
    if (cmd === "M") ops.push(moveTo(v[0], Y(v[1])));
    else if (cmd === "L") ops.push(lineTo(v[0], Y(v[1])));
    else if (cmd === "C") ops.push(appendBezierCurve(v[0], Y(v[1]), v[2], Y(v[3]), v[4], Y(v[5])));
    else ops.push(closePath());
    if (cmd === "Z" && i >= tokens.length) break;
  }
  return ops;
}

/** Fills a path with a colour or a gradient. `opacity` applies to plain colours. */
export function fillPath(page: PDFPage, d: string, paint: Paint, opacity = 1) {
  if (typeof paint === "string") {
    page.drawSvgPath(d, { x: 0, y: currentHeight, color: hex(paint), opacity });
    return;
  }
  const name = registerGradient(page, paint);
  page.pushOperators(
    pushGraphicsState(),
    PDFOperator.of(Ops.NonStrokingColorspace, [PDFName.of("Pattern")]),
    PDFOperator.of(Ops.NonStrokingColorN, [PDFName.of(name)]),
    ...pathOperators(d),
    fill(),
    popGraphicsState(),
  );
}

/** A closed shape from points. */
export function polygon(page: PDFPage, points: Point[], paint: Paint, opacity = 1) {
  fillPath(page, polygonPath(points), paint, opacity);
}

export const polygonPath = (points: Point[]) => `M${points.map(([x, y]) => `${x} ${y}`).join(" L")} Z`;

/** The corners of a shape turned, around `at`, by `angle` radians. */
export function rotate(points: Point[], at: Point, angle: number): Point[] {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return points.map(([x, y]) => [at[0] + (x - at[0]) * cos - (y - at[1]) * sin, at[1] + (x - at[0]) * sin + (y - at[1]) * cos]);
}

/** A path through the points with every corner rounded by `radius`. */
export function roundedPath(points: Point[], radius: number): string {
  const n = points.length;
  const pieces = points.map((p, i) => {
    const prev = points[(i + n - 1) % n];
    const next = points[(i + 1) % n];
    const toward = (q: Point): Point => {
      const dx = q[0] - p[0];
      const dy = q[1] - p[1];
      const len = Math.hypot(dx, dy) || 1;
      const r = Math.min(radius, len / 2);
      return [p[0] + (dx / len) * r, p[1] + (dy / len) * r];
    };
    return { start: toward(prev), end: toward(next), corner: p };
  });
  let d = "";
  pieces.forEach(({ start, end, corner }, i) => {
    d += `${i === 0 ? "M" : "L"}${start[0]} ${start[1]} C${corner[0]} ${corner[1]} ${corner[0]} ${corner[1]} ${end[0]} ${end[1]} `;
  });
  return `${d}Z`;
}

/** A square (or rectangle) turned by `angle` degrees, with rounded corners. */
export function roundedSquare(page: PDFPage, cx: number, cy: number, w: number, h: number, angleDeg: number, radius: number, paint: Paint, opacity = 1) {
  const corners: Point[] = [[cx - w / 2, cy - h / 2], [cx + w / 2, cy - h / 2], [cx + w / 2, cy + h / 2], [cx - w / 2, cy + h / 2]];
  fillPath(page, roundedPath(rotate(corners, [cx, cy], (angleDeg * Math.PI) / 180), radius), paint, opacity);
}

// ----------------------------------------------------------------------- strokes

export function line(page: PDFPage, from: Point, to: Point, thickness: number, color: string, opacity = 1) {
  page.drawLine({ start: { x: from[0], y: Y(from[1]) }, end: { x: to[0], y: Y(to[1]) }, thickness, color: hex(color), opacity, lineCap: LineCapStyle.Round });
}

type Cubic = [Point, Point, Point, Point];

/** A smooth stroked curve through one or more cubic Beziers joined end to end. */
export function curve(page: PDFPage, segments: Cubic | Cubic[], thickness: number, color: string, opacity = 1) {
  const list: Cubic[] = Array.isArray(segments[0][0]) ? (segments as Cubic[]) : [segments as Cubic];
  for (const [p0, p1, p2, p3] of list) {
    const at = (t: number): Point => {
      const u = 1 - t;
      return [0, 1].map((i) => u ** 3 * p0[i] + 3 * u * u * t * p1[i] + 3 * u * t * t * p2[i] + t ** 3 * p3[i]) as Point;
    };
    let prev = at(0);
    for (let s = 1; s <= 40; s++) {
      const next = at(s / 40);
      line(page, prev, next, thickness, color, opacity);
      prev = next;
    }
  }
}

/** The outline of a rectangle, optionally with a gold gradient-free colour. */
export function frame(page: PDFPage, x: number, y: number, w: number, h: number, thickness: number, color: string, opacity = 1) {
  page.drawRectangle({ x, y: Y(y + h), width: w, height: h, borderColor: hex(color), borderWidth: thickness, borderOpacity: opacity });
}

/** A soft round shadow made of a few faint layers. */
export function softShadow(page: PDFPage, cx: number, cy: number, r: number) {
  for (let i = 6; i >= 1; i--) {
    page.drawEllipse({ x: cx + 2, y: Y(cy + r * 0.12 + 4), xScale: r * (1 + i * 0.07), yScale: r * (0.95 + i * 0.07), color: rgb(0, 0, 0), opacity: 0.025 });
  }
}

/** Faint flowing lines, like the fine gold patterns in the corners of formal certificates. */
export function flowLines(page: PDFPage, start: Point, drift: Point, count: number, gap: number, color: string, opacity: number) {
  for (let i = 0; i < count; i++) {
    const o = i * gap;
    curve(
      page,
      [
        [start[0] + o * 0.3, start[1] + o],
        [start[0] + drift[0] * 0.3, start[1] + drift[1] * 0.1 + o],
        [start[0] + drift[0] * 0.65, start[1] + drift[1] * 0.9 + o * 0.5],
        [start[0] + drift[0], start[1] + drift[1] + o * 0.3],
      ],
      0.6,
      color,
      opacity,
    );
  }
}

// ----------------------------------------------------------------- laurel and seals

/** One pointed leaf starting at (x, y), pointing along `angle` radians. */
function leafPath(x: number, y: number, angle: number, length: number, width: number): string {
  const at = (px: number, py: number): Point => [x + px * Math.cos(angle) - py * Math.sin(angle), y + px * Math.sin(angle) + py * Math.cos(angle)];
  const [a, b, c, d, e, f] = [at(length * 0.3, -width), at(length * 0.75, -width), at(length, 0), at(length * 0.75, width), at(length * 0.3, width), at(0, 0)];
  return `M${f[0]} ${f[1]} C${a[0]} ${a[1]} ${b[0]} ${b[1]} ${c[0]} ${c[1]} C${d[0]} ${d[1]} ${e[0]} ${e[1]} ${f[0]} ${f[1]} Z`;
}

/** Two laurel branches curving around a circle, open at the top. */
export function laurel(page: PDFPage, cx: number, cy: number, radius: number, paint: Paint, leaves = 9) {
  const leaf = radius * 0.3;
  for (const side of [-1, 1]) {
    for (let i = 0; i < leaves; i++) {
      const t = i / (leaves - 1);
      // Walk up each side from the bottom: the left branch turns one way round the circle, the right the other
      const angle = Math.PI / 2 + (side === -1 ? 1 : -1) * (0.15 + t * 2.05);
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      const tangent = angle + (side === -1 ? Math.PI / 2 : -Math.PI / 2);
      const tilt = i % 2 === 0 ? 0.55 : -0.55;
      fillPath(page, leafPath(x, y, tangent + tilt * (side === -1 ? 1 : -1), leaf, leaf * 0.28), paint);
    }
  }
}

export type SealOptions = {
  /** The centre disc colour. */
  centre: string;
  /** Draw the laurel wreath inside the seal. */
  wreath?: boolean;
  /** Draw a star in the middle. */
  star?: boolean;
  /** One or two short lines of text in the middle, such as ["BEST", "AWARD"]. */
  text?: string[];
  /** Colours of the two ribbon tails (default: gold). */
  ribbon?: Paint;
  /** Which way the tails hang: down (default) or none. */
  tails?: boolean;
  /** Fonts to write the text with. */
  font?: PDFFont;
};

/** A gold rosette medal with a scalloped edge, a ring, a centre disc and, optionally, a wreath, star or text. */
export function seal(page: PDFPage, cx: number, cy: number, r: number, o: SealOptions) {
  softShadow(page, cx, cy, r);

  if (o.tails !== false) {
    const ribbon = o.ribbon ?? goldBetween([cx - r, cy], [cx + r, cy + 2 * r]);
    const tail = (side: 1 | -1): Point[] => [
      [cx + side * 0.6 * r, cy + 0.5 * r],
      [cx + side * 0.05 * r, cy + 0.8 * r],
      [cx + side * 0.35 * r, cy + 1.95 * r],
      [cx + side * 0.62 * r, cy + 1.62 * r],
      [cx + side * 0.95 * r, cy + 1.85 * r],
    ];
    polygon(page, tail(-1), ribbon);
    polygon(page, tail(1), ribbon);
  }

  const edge: Point[] = Array.from({ length: 60 }, (_, i) => {
    const a = (i * Math.PI) / 30;
    const rad = i % 2 === 0 ? r : r * 0.92;
    return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
  });
  const metal: Gradient = { kind: "radial", at: [cx - r * 0.3, cy - r * 0.3], r0: 0, r1: r * 1.4, stops: [[0, "#fff3b0"], [0.45, "#dcae35"], [1, "#a87a14"]] };
  polygon(page, edge, metal);
  page.drawCircle({ x: cx, y: Y(cy), size: r * 0.8, borderColor: hex("#fff0a8"), borderWidth: 1.4 });
  page.drawCircle({ x: cx, y: Y(cy), size: r * 0.72, color: hex(o.centre) });

  const gold = goldBetween([cx - r, cy - r], [cx + r, cy + r]);
  if (o.wreath) laurel(page, cx, cy, r * 0.5, gold, 8);
  if (o.star) {
    const star: Point[] = Array.from({ length: 10 }, (_, i) => {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rad = i % 2 === 0 ? r * 0.3 : r * 0.12;
      return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
    });
    polygon(page, star, gold);
  }
  if (o.text && o.font) {
    const size = r * 0.24;
    o.text.forEach((word, i, all) => {
      const w = o.font!.widthOfTextAtSize(word, size);
      page.drawText(word, { x: cx - w / 2, y: Y(cy + size * 0.35 + (i - (all.length - 1) / 2) * size * 1.25), size, font: o.font!, color: hex("#f3dc86") });
    });
  }
}

// --------------------------------------------------------------------- text tools

/** Width of text with extra space between the letters. */
export function spacedWidth(font: PDFFont, size: number, text: string, spacing: number): number {
  const chars = Array.from(text);
  return chars.reduce((sum, ch) => sum + font.widthOfTextAtSize(ch, size), 0) + spacing * (chars.length - 1);
}

/** Centred text with extra space between the letters, for titles. */
export function drawSpaced(page: PDFPage, text: string, font: PDFFont, size: number, cx: number, top: number, spacing: number, color: string) {
  let x = cx - spacedWidth(font, size, text, spacing) / 2;
  for (const ch of Array.from(text)) {
    page.drawText(ch, { x, y: Y(top), size, font, color: hex(color) });
    x += font.widthOfTextAtSize(ch, size) + spacing;
  }
}

export function drawCentred(page: PDFPage, text: string, font: PDFFont, size: number, cx: number, top: number, color: string) {
  page.drawText(text, { x: cx - font.widthOfTextAtSize(text, size) / 2, y: Y(top), size, font, color: hex(color) });
}

export function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  let current = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const test = current ? `${current} ${word}` : word;
    if (current && font.widthOfTextAtSize(test, size) > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}
