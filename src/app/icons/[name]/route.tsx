import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { BRAND_BACKGROUND, BRAND_LIME, MARK } from "@/components/brand/logo";

export const dynamic = "force-static";

/** Icon variants referenced by the web app manifest and Apple touch icon. */
const VARIANTS: Record<string, { size: number; maskable: boolean }> = {
  "icon-192": { size: 192, maskable: false },
  "icon-512": { size: 512, maskable: false },
  "maskable-512": { size: 512, maskable: true },
  "apple-180": { size: 180, maskable: true },
};

export function generateStaticParams() {
  return Object.keys(VARIANTS).map((name) => ({ name }));
}

/**
 * PNG app icons rendered at build time from the vector `a_` mark on the
 * charcoal tile. The mark spans ~37 % of the canvas, matching the approved
 * icon artwork's padding; maskable variants use a full-bleed square so the
 * mark stays well inside the 80 % safe zone.
 */
export async function GET(_request: Request, context: RouteContext<"/icons/[name]">) {
  const { name } = await context.params;
  const variant = VARIANTS[name];
  if (!variant) notFound();
  const { size, maskable } = variant;
  const markWidth = Math.round(size * (maskable ? 0.34 : 0.37));
  const markHeight = Math.round((markWidth * MARK.height) / MARK.width);

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BRAND_BACKGROUND,
          borderRadius: maskable ? 0 : Math.round(size * 0.22),
        }}
      >
        <svg width={markWidth} height={markHeight} viewBox={MARK.viewBox} fill={BRAND_LIME}>
          <path d={MARK.aRing} fillRule="evenodd" />
          <rect x={MARK.aStem.x} y={MARK.aStem.y} width={MARK.aStem.width} height={MARK.aStem.height} />
          <rect x={MARK.underscore.x} y={MARK.underscore.y} width={MARK.underscore.width} height={MARK.underscore.height} />
        </svg>
      </div>
    ),
    {
      width: size,
      height: size,
      headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" },
    },
  );
}
