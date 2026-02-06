/**
 * Server-side URL fetcher for job postings.
 * Extracts and sanitizes job description text from external URLs.
 */

const MAX_RAW_CONTENT_LENGTH = 500_000; // 500KB max for raw HTML (we extract from it)
const FETCH_TIMEOUT_MS = 15_000; // 15 second timeout

// Blocklist of suspicious/spam domains and patterns
const BLOCKED_DOMAINS = [
  // URL shorteners (could hide malicious links)
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "adf.ly",
  "shorte.st",
  // Known spam/malicious patterns
  "spam",
  "phishing",
  "malware",
];

// Suspicious URL patterns
const SUSPICIOUS_PATTERNS = [
  /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/, // IP addresses
  /localhost/i,
  /127\.0\.0\.1/,
  /0\.0\.0\.0/,
  /\.local$/,
  /\.internal$/,
  /\.onion$/,
];

export type FetchJobResult =
  | { success: true; content: string; source: string }
  | { success: false; error: string };

/**
 * Check if URL is safe (not blocked or suspicious).
 */
function isSafeUrl(url: URL): { safe: boolean; reason?: string } {
  const hostname = url.hostname.toLowerCase();

  // Block localhost and private networks
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(hostname)) {
      return { safe: false, reason: "URL appears to be a local or private address." };
    }
  }

  // Block known spam/shortener domains
  for (const blocked of BLOCKED_DOMAINS) {
    if (hostname === blocked || hostname.endsWith(`.${blocked}`)) {
      return { safe: false, reason: "URL shorteners are not supported. Please use the direct job posting link." };
    }
  }

  // Block URLs with suspicious path patterns
  const fullUrl = url.toString().toLowerCase();
  if (fullUrl.includes("redirect") && fullUrl.includes("url=")) {
    return { safe: false, reason: "Redirect URLs are not supported. Please use the direct job posting link." };
  }

  return { safe: true };
}

function sanitizeUrl(input: string): URL | null {
  try {
    const url = new URL(input.trim());
    // Only allow HTTPS
    if (url.protocol !== "https:") {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

/**
 * Strip HTML tags and normalize whitespace.
 * Security: Removes scripts, styles, and potentially harmful content.
 */
function stripHtml(html: string): string {
  // Remove script and style blocks entirely
  let text = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ");

  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, " ");

  // Remove all HTML tags
  text = text.replace(/<[^>]+>/g, " ");

  // Decode common HTML entities
  text = text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&rsquo;/gi, "'")
    .replace(/&lsquo;/gi, "'")
    .replace(/&rdquo;/gi, '"')
    .replace(/&ldquo;/gi, '"')
    .replace(/&mdash;/gi, "—")
    .replace(/&ndash;/gi, "–")
    .replace(/&bull;/gi, "•")
    .replace(/&#\d+;/g, " ");

  // Normalize whitespace
  text = text.replace(/\s+/g, " ").trim();

  return text;
}

/**
 * Extract job description from HTML content.
 * Uses site-specific patterns for better extraction.
 */
function extractJobContent(html: string, hostname: string): string {
  // Site-specific extraction patterns (more precise)
  const sitePatterns: Record<string, RegExp[]> = {
    "linkedin.com": [
      // LinkedIn job description in JSON-LD
      /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
      // LinkedIn description container
      /class="[^"]*show-more-less-html__markup[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /class="[^"]*description__text[^"]*"[^>]*>([\s\S]*?)<\/section>/gi,
      /class="[^"]*jobs-description[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    ],
    "indeed.com": [
      /id="jobDescriptionText"[^>]*>([\s\S]*?)<\/div>/gi,
      /class="[^"]*jobsearch-jobDescriptionText[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    ],
    "greenhouse.io": [
      /id="content"[^>]*>([\s\S]*?)<\/div>/gi,
      /class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/section>/gi,
    ],
    "lever.co": [
      /class="[^"]*posting-[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    ],
    "ashbyhq.com": [
      /class="[^"]*ashby-job-posting-description[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    ],
  };

  // Try to extract JSON-LD data first (most reliable for LinkedIn)
  const jsonLdMatch = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi.exec(html);
  if (jsonLdMatch?.[1]) {
    try {
      const jsonData = JSON.parse(jsonLdMatch[1]);
      // Handle single object or array
      const jobData = Array.isArray(jsonData) ? jsonData.find((d) => d["@type"] === "JobPosting") : jsonData;
      if (jobData?.description) {
        const content = stripHtml(jobData.description);
        if (content.length > 100) {
          // Also include title and other relevant fields
          const parts = [
            jobData.title ? `Job Title: ${jobData.title}` : "",
            jobData.hiringOrganization?.name ? `Company: ${jobData.hiringOrganization.name}` : "",
            content,
          ].filter(Boolean);
          return parts.join("\n\n");
        }
      }
    } catch {
      // JSON parse failed, continue with HTML extraction
    }
  }

  // Try site-specific patterns
  const normalizedHost = hostname.toLowerCase();
  for (const [domain, patterns] of Object.entries(sitePatterns)) {
    if (normalizedHost.includes(domain)) {
      for (const pattern of patterns) {
        // Reset lastIndex for global regex
        pattern.lastIndex = 0;
        const match = pattern.exec(html);
        if (match?.[1]) {
          const content = stripHtml(match[1]);
          if (content.length > 100) {
            return content;
          }
        }
      }
    }
  }

  // Generic patterns as fallback
  const genericPatterns = [
    /<div[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<div[^>]*id="[^"]*job-?description[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<section[^>]*class="[^"]*job-?description[^"]*"[^>]*>([\s\S]*?)<\/section>/gi,
    /<article[^>]*>([\s\S]*?)<\/article>/gi,
    /<main[^>]*>([\s\S]*?)<\/main>/gi,
  ];

  for (const pattern of genericPatterns) {
    pattern.lastIndex = 0;
    const match = pattern.exec(html);
    if (match?.[1]) {
      const content = stripHtml(match[1]);
      if (content.length > 100) {
        return content;
      }
    }
  }

  // Last resort: strip entire HTML but limit to body content
  const bodyMatch = /<body[^>]*>([\s\S]*?)<\/body>/gi.exec(html);
  if (bodyMatch?.[1]) {
    return stripHtml(bodyMatch[1]);
  }

  return stripHtml(html);
}

/**
 * Truncate content to reasonable length for LLM processing.
 */
function truncateContent(text: string, maxChars: number = 8000): string {
  if (text.length <= maxChars) return text;

  // Try to cut at sentence boundary
  const truncated = text.slice(0, maxChars);
  const lastPeriod = truncated.lastIndexOf(".");
  if (lastPeriod > maxChars * 0.7) {
    return truncated.slice(0, lastPeriod + 1);
  }

  return truncated + "...";
}

export async function fetchJobContent(urlInput: string): Promise<FetchJobResult> {
  const url = sanitizeUrl(urlInput);
  if (!url) {
    return { success: false, error: "Invalid URL format. Only HTTPS URLs are supported." };
  }

  // Check for spam/suspicious URLs
  const safetyCheck = isSafeUrl(url);
  if (!safetyCheck.safe) {
    return {
      success: false,
      error: safetyCheck.reason || "URL not allowed.",
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        // Use a realistic browser User-Agent to avoid being blocked
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch URL (HTTP ${response.status}). Please paste the job description text directly.`,
      };
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      return {
        success: false,
        error: "URL does not return HTML content. Please paste the job description text directly.",
      };
    }

    // Check content-length header but allow larger pages (we'll extract from them)
    const contentLength = response.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_RAW_CONTENT_LENGTH) {
      return {
        success: false,
        error: "Page content too large. Please paste the job description text directly.",
      };
    }

    const html = await response.text();
    
    // Allow larger HTML but reject extremely large pages
    if (html.length > MAX_RAW_CONTENT_LENGTH) {
      return {
        success: false,
        error: "Page content too large. Please paste the job description text directly.",
      };
    }

    // Extract job content using site-specific and generic patterns
    const content = extractJobContent(html, url.hostname);
    
    if (content.length < 50) {
      return {
        success: false,
        error: "Could not extract job description from URL. Please paste the job description text directly.",
      };
    }

    return {
      success: true,
      content: truncateContent(content),
      source: url.hostname,
    };
  } catch (err) {
    clearTimeout(timeoutId);

    if (err instanceof Error && err.name === "AbortError") {
      return {
        success: false,
        error: "Request timed out. Please paste the job description text directly.",
      };
    }

    return {
      success: false,
      error: "Failed to fetch URL. Please paste the job description text directly.",
    };
  }
}
