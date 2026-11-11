import { cn } from "@/components/ui/utils";

/**
 * Brand marks, drawn from geometric primitives so they stay crisp at every
 * size (no raster stretching). Proportions were measured from the approved
 * `anjo_` wordmark and `a_` app icon artwork in `/public`.
 *
 *   wordmark: lime "a" + "_", off-white "njo"
 *   mark:     lime "a_" (used for the app icon, favicon, and assistant avatar)
 */

export const BRAND_LIME = "#C7F76A";
export const BRAND_INK = "#F5F4EE";
export const BRAND_BACKGROUND = "#111413";

/* Wordmark geometry: x-height 196 units, baseline at y = 196. */
const WORD = {
  // "a": ring (outer r 98, inner r 52) + stem.
  aRing: "M98 0a98 98 0 1 0 0.001 0zM98 46a52 52 0 1 1 -0.001 0z",
  aStem: { x: 172, y: 0, width: 48, height: 196 },
  // "n": stem + arch.
  nStem: { x: 243, y: 0, width: 48, height: 196 },
  nArch: "M243 81a81 81 0 0 1 162 0v115h-48v-115a33 33 0 0 0 -66 0z",
  // "j": stem with a descender hook + dot.
  jStem: "M458 0h48v223a50 50 0 0 1 -50 50h-40v-48h40a2 2 0 0 0 2 -2z",
  jDot: { cx: 482, cy: -40, r: 27 },
  // "o": ring.
  oRing: "M628 0a98 98 0 1 0 0.001 0zM628 46a52 52 0 1 1 -0.001 0z",
  // "_"
  underscore: { x: 751, y: 163, width: 167, height: 33 },
} as const;

/* Mark geometry ("a_"): x-height 242 units, matching the app icon artwork. */
export const MARK = {
  viewBox: "0 0 465 242",
  width: 465,
  height: 242,
  aRing: "M121 0a121 121 0 1 0 0.001 0zM121 57a64 64 0 1 1 -0.001 0z",
  aStem: { x: 195, y: 4, width: 58, height: 238 },
  underscore: { x: 291, y: 206, width: 174, height: 36 },
} as const;

export interface WordmarkProps {
  className?: string;
  /** Accessible name; pass `null` when the surrounding link already names it. */
  title?: string | null;
}

/** Horizontal `anjo_` wordmark. Height-driven: size it with a `h-*` class. */
export function Wordmark({ className, title = "anjo_" }: WordmarkProps) {
  return (
    <svg
      viewBox="0 -70 918 346"
      className={cn("h-6 w-auto", className)}
      role={title ? "img" : undefined}
      aria-label={title ?? undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <g fill={BRAND_LIME}>
        <path d={WORD.aRing} fillRule="evenodd" />
        <rect {...WORD.aStem} />
        <rect {...WORD.underscore} />
      </g>
      <g fill={BRAND_INK}>
        <rect {...WORD.nStem} />
        <path d={WORD.nArch} />
        <path d={WORD.jStem} />
        <circle {...WORD.jDot} />
        <path d={WORD.oRing} fillRule="evenodd" />
      </g>
    </svg>
  );
}

export interface MarkProps {
  className?: string;
  title?: string | null;
  color?: string;
}

/** The `a_` mark on its own (no tile). */
export function Mark({ className, title = null, color = BRAND_LIME }: MarkProps) {
  return (
    <svg
      viewBox={MARK.viewBox}
      className={cn("h-4 w-auto", className)}
      role={title ? "img" : undefined}
      aria-label={title ?? undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <g fill={color}>
        <path d={MARK.aRing} fillRule="evenodd" />
        <rect {...MARK.aStem} />
        <rect {...MARK.underscore} />
      </g>
    </svg>
  );
}

/** The `a_` mark inside a square charcoal tile — the app icon / assistant avatar. */
export function MarkTile({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-background", className)}>
      <Mark className="h-[34%] w-auto" />
    </span>
  );
}
