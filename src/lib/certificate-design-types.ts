/**
 * What a certificate design is made of. A design has a background drawing, an optional foreground
 * (such as a frame drawn over the text) and a layout: where each line of text goes, in what colours,
 * and in which fonts. The designs themselves are in certificate-designs.ts and
 * certificate-designs-more.ts; this file holds the shared shape and the defaults.
 */

import type { PDFFont, PDFPage } from "pdf-lib";
import { GOLD_DARK, GREY, INK, PAGE_H, PAGE_W } from "./certificate-draw";

export type CertDesign =
  | "navyWaves"
  | "blackGold"
  | "goldFrame"
  | "blackSwoosh"
  | "emerald"
  | "purpleHex"
  | "blueStripes"
  | "skyBlades"
  | "redSquares"
  | "orangeSquares"
  | "navyRed"
  | "darkGold"
  | "ribbonBlue"
  | "lightWave"
  | "royalGold"
  | "tealDiagonal"
  | "whiteWave"
  | "ornateCream"
  | "excellence"
  | "navyPanel"
  | "cleanFrame"
  | "blueCorners"
  | "ornateBlue";

export type Layout = {
  cx: number;
  /** Width of the text column. */
  w: number;
  title: number;
  subtitle: number;
  intro: number;
  name: number;
  nameLine: number;
  body: number;
  sig: number;
  /** Where the signature lines are centred, for one signer and for two. */
  slots: (two: boolean) => number[];
  ink: string;
  grey: string;
  titleColor: string;
  subtitleColor: string;
  introColor: string;
  nameColor: string;
  lineColor: string;
  /** Which font writes CERTIFICATE: the light serif, a bold sans, or the bold display serif. */
  titleFont: "title" | "bold" | "display";
  titleSize: number;
  /** Extra space between the letters of the title. Defaults to a value that suits the font. */
  titleSpacing?: number;
  subtitleSize?: number;
  subtitleSpacing?: number;
  /** The name's font: handwriting (default), the title serif, or bold sans. */
  nameFont?: "script" | "title" | "bold" | "display";
  /** Write names in capitals (for designs whose name font is not handwriting). */
  nameCaps?: boolean;
  /** Skip the line under the name when the design draws its own divider. */
  noNameLine?: boolean;
  /**
   * Where the organiser's logo goes: centred on `cx`, starting at `top`, fitted inside maxW by maxH.
   * Left out, a spot above the title is worked out. `false` means the design has no room for one,
   * because a medal already sits there.
   */
  logo?: false | { cx: number; top: number; maxW: number; maxH: number };
};

export type DrawContext = { page: PDFPage; main: string; bold: PDFFont };

export type DesignDef = {
  id: CertDesign;
  label: string;
  /** The design's own colour, used until the organiser picks another. */
  color: string;
  /** Landscape unless stated. */
  orientation?: "portrait";
  layout: (main: string) => Layout;
  draw: (ctx: DrawContext) => void;
  /** Drawn on top of the text, such as a frame. */
  foreground?: (ctx: DrawContext) => void;
};

/** Page size of a design in PDF points: A4 landscape or A4 portrait. */
export function pageSize(design: Pick<DesignDef, "orientation">): { width: number; height: number } {
  return design.orientation === "portrait" ? { width: PAGE_H, height: PAGE_W } : { width: PAGE_W, height: PAGE_H };
}

/** A layout with sensible defaults, so each design lists only what is different. */
export function layout(o: Partial<Layout> = {}): Layout {
  const cx = o.cx ?? PAGE_W / 2;
  return {
    cx,
    w: 600,
    title: 190,
    subtitle: 222,
    intro: 270,
    name: 340,
    nameLine: 354,
    body: 392,
    sig: 470,
    slots: (two) => (two ? [cx - 170, cx + 170] : [cx]),
    ink: INK,
    grey: GREY,
    titleColor: INK,
    subtitleColor: INK,
    introColor: GREY,
    nameColor: GOLD_DARK,
    lineColor: GREY,
    titleFont: "title",
    titleSize: 54,
    ...o,
  };
}
