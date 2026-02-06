import { getResumeVariant, formatResumeVariantAsText } from "@/lib/match-job/resumeVariant";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Regex to validate variant ID format (32 hex characters)
const VARIANT_ID_PATTERN = /^[a-f0-9]{32}$/;

type RouteParams = {
  params: Promise<{ variantId: string }>;
};

export async function GET(
  _req: Request,
  { params }: RouteParams
) {
  const { variantId } = await params;

  // Validate variant ID format to prevent injection/enumeration
  if (!variantId || !VARIANT_ID_PATTERN.test(variantId)) {
    return new Response(JSON.stringify({ error: "Invalid variant ID format." }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  // Retrieve variant
  const variant = getResumeVariant(variantId);
  if (!variant) {
    return new Response(JSON.stringify({ error: "Resume variant not found or expired." }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  }

  // Format as downloadable text
  const resumeText = formatResumeVariantAsText(variant);

  // Generate filename
  const sanitizedTitle = variant.jobTitle
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 50);
  const filename = `anjo-resume-${sanitizedTitle}.txt`;

  return new Response(resumeText, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "private, no-cache",
    },
  });
}
