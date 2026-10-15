/**
 * Helpers for making a CV fill an A4 page exactly, in the preview and in the PDF.
 *
 * A CV is laid out at some width `w` and then zoomed by A4_WIDTH / w. A narrower
 * layout makes the content taller AND the zoom bigger, so the printed height
 * grows. That lets a short CV scale up to fill the page (instead of leaving blank
 * space at the bottom), and a long one scale down to fit (see the builder).
 */

/** A4 at 96 dpi. */
export const A4_WIDTH = 794;
export const A4_HEIGHT = 1123;

/** How far a short CV may scale up: the layout can get 20% narrower, so text grows by up to 25%. */
const MIN_FILL_WIDTH = A4_WIDTH * 0.8;

/**
 * Finds the narrowest layout width (never below MIN_FILL_WIDTH) at which the CV,
 * zoomed to A4 width, still fits within `targetHeight`. Returns A4_WIDTH when the
 * CV already fills the page or overflows it.
 *
 * `page` must be a block that sizes itself from its content when min-height is 0.
 * Its inline width and min-height are restored before returning, so React stays
 * the owner of those styles.
 */
export function fillWidth(page: HTMLElement, targetHeight = A4_HEIGHT - 2): number {
  const prevWidth = page.style.width;
  const prevMinHeight = page.style.minHeight;
  page.style.minHeight = "0px";

  // Height of the page once it is zoomed to A4 width, if laid out at width w
  const zoomedHeight = (w: number) => {
    page.style.width = `${w}px`;
    return (page.offsetHeight * A4_WIDTH) / w;
  };

  let result = A4_WIDTH;
  if (zoomedHeight(A4_WIDTH) < targetHeight) {
    if (zoomedHeight(MIN_FILL_WIDTH) <= targetHeight) {
      result = MIN_FILL_WIDTH; // Very short CV: scale up as far as we allow
    } else {
      // zoomedHeight grows as the width shrinks, so binary search for the edge
      let lo = MIN_FILL_WIDTH; // too tall
      let hi = A4_WIDTH; // fits
      for (let i = 0; i < 10; i++) {
        const mid = (lo + hi) / 2;
        if (zoomedHeight(mid) <= targetHeight) hi = mid;
        else lo = mid;
      }
      result = hi;
    }
  }

  page.style.width = prevWidth;
  page.style.minHeight = prevMinHeight;
  return Math.round(result * 10) / 10;
}
