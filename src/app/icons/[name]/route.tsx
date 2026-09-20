import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getProfile } from "@/lib/knowledge/repository";
import { initialsFor } from "@/lib/utils/initials";

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
 * PNG app icons rendered at build time from the profile's monogram, so the
 * PWA has correct icons without committing binary assets. Maskable
 * variants keep the mark inside the safe zone (80 % of the canvas).
 */
export async function GET(_request: Request, context: RouteContext<"/icons/[name]">) {
  const { name } = await context.params;
  const variant = VARIANTS[name];
  if (!variant) notFound();
  const { size, maskable } = variant;
  const initials = initialsFor(getProfile().profile.name);
  const radius = maskable ? 0 : Math.round(size * 0.22);
  const fontSize = Math.round(size * (maskable ? 0.36 : 0.42));

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
          borderRadius: radius,
          color: "#ffffff",
          fontSize,
          fontWeight: 700,
          letterSpacing: -fontSize * 0.04,
          fontFamily: "sans-serif",
        }}
      >
        {initials}
      </div>
    ),
    {
      width: size,
      height: size,
      headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" },
    },
  );
}
