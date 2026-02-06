/**
 * Content Guard - Relevance Classification & Injection Detection
 *
 * Classifies user input BEFORE any OpenAI call to prevent:
 * - Off-topic requests (cost control)
 * - Prompt injection attacks (security)
 * - Abusive content (safety)
 */

export type RelevanceClassification = "relevant" | "weakly_related" | "not_related" | "abusive";

export type ContentGuardResult = {
  classification: RelevanceClassification;
  reason: string;
  blocked: boolean;
};

// ---------------------------------------------------------------------------
// Injection Detection Patterns
// ---------------------------------------------------------------------------
const INJECTION_PATTERNS = [
  // Direct injection attempts
  /ignore\s+(all\s+)?previous\s+(instructions?|prompts?|rules?)/i,
  /disregard\s+(all\s+)?previous/i,
  /forget\s+(everything|all|your)\s+(instructions?|rules?|training)/i,
  /new\s+instructions?:/i,
  /override\s+(system|your)\s+(prompt|instructions?)/i,

  // Roleplay/persona attacks
  /\b(act|pretend|behave)\s+(as|like)\s+(if\s+)?(you\s+)?(are|were)/i,
  /you\s+are\s+now\s+a/i,
  /from\s+now\s+on\s+(you|act)/i,
  /imagine\s+you\s+are/i,
  /roleplay\s+as/i,

  // System prompt extraction
  /\b(show|reveal|display|print|output|tell\s+me)\s+(your|the|system)\s*(prompt|instructions?)/i,
  /what\s+(are|is)\s+your\s+(system\s+)?(prompt|instructions?)/i,
  /repeat\s+(your|the)\s+instructions?/i,

  // Jailbreak keywords
  /\bjailbreak\b/i,
  /\bdeveloper\s+mode\b/i,
  /\bdan\s+mode\b/i,
  /\bunlock(ed)?\s+mode\b/i,

  // Code/API extraction attempts
  /\b(api[_-]?key|secret|token|password|credentials?)\b/i,
  /\b(env|environment)\s*variables?\b/i,
  /process\.env/i,
];

// ---------------------------------------------------------------------------
// Abusive Content Patterns
// ---------------------------------------------------------------------------
const ABUSIVE_PATTERNS = [
  // Profanity (common variations)
  /\b(f+u+c+k+|sh+i+t+|a+ss+|b+i+t+c+h+|d+a+m+n+|bastard)\b/i,
  /\b(c+u+n+t+|d+i+c+k+|cock|penis|vagina)\b/i,

  // Harassment
  /\b(kill\s+yourself|kys|die|death\s+threat)\b/i,
  /\b(hate\s+you|hate\s+this|you\s+suck)\b/i,

  // Security attacks
  /\b(hack|exploit|inject|sql\s*injection|xss|csrf)\b/i,
  /\b(ddos|dos\s+attack|brute\s*force)\b/i,
  /<script\b/i,
  /javascript:/i,
  /on(error|load|click)=/i,
];

// ---------------------------------------------------------------------------
// Off-Topic Patterns
// ---------------------------------------------------------------------------
const OFF_TOPIC_PATTERNS = [
  // General knowledge
  /\b(weather|forecast|temperature|climate)\s*(today|now|in)?\b/i,
  /\b(stock|crypto|bitcoin|ethereum|nft|trading|invest)\b/i,
  /\b(lottery|gambling|casino|betting)\b/i,

  // Entertainment/Pop culture
  /\b(celebrity|gossip|movie|tv\s*show|series|netflix)\b/i,
  /\b(sports?|football|basketball|soccer|baseball)\s*(score|game|team)?/i,
  /\b(music|song|album|artist|concert)\b/i,

  // Politics/Religion
  /\b(politic|election|vote|president|democrat|republican|congress)\b/i,
  /\b(religion|god|pray|church|mosque|temple)\b/i,

  // Personal/Dating
  /\b(date\s+me|dating|relationship|girlfriend|boyfriend)\b/i,
  /\b(love\s+you|marry\s+me)\b/i,

  // Generic AI tasks
  /\bwrite\s+(me\s+)?(a\s+)?(poem|story|essay|joke|song|lyrics)\b/i,
  /\b(solve|calculate|compute)\s+(this\s+)?(math|equation|problem)\b/i,
  /\b(translate|convert)\s+(this\s+)?(to|into)/i,
  /\bhomework\b/i,
  /\b(recipe|cook|food)\b/i,
  /\b(health|medical|doctor|symptom|disease|medicine)\b/i,

  // Spam indicators
  /^(hi|hello|hey|yo|sup)\.?$/i,
  /^(test|testing|123|asdf)\.?$/i,
];

// ---------------------------------------------------------------------------
// Relevant Topic Patterns
// ---------------------------------------------------------------------------
const RELEVANT_PATTERNS = [
  // Portfolio topics
  /\b(portfolio|project|work|experience|job|career)\b/i,
  /\b(anjo|engineer|developer|programmer|coder)\b/i,
  /\b(resume|cv|qualification|background|history)\b/i,

  // Technical topics
  /\b(skill|technology|tech\s*stack|framework|language|tool)\b/i,
  /\b(architecture|design|system|infrastructure|scalab)\b/i,
  /\b(leadership|team|manage|mentor|lead)\b/i,
  /\b(code|coding|programming|software|application)\b/i,

  // Specific technologies (commonly in portfolios)
  /\b(react|next\.?js|typescript|javascript|node|python|go|rust)\b/i,
  /\b(aws|azure|gcp|cloud|docker|kubernetes)\b/i,
  /\b(database|sql|postgres|mongodb|redis)\b/i,
  /\b(api|rest|graphql|microservice)\b/i,

  // Job-related
  /\b(hire|hiring|recruit|job\s*match|position|role)\b/i,
  /\b(interview|contact|reach|email)\b/i,
];

// ---------------------------------------------------------------------------
// Classification Logic
// ---------------------------------------------------------------------------

/**
 * Classify user input for relevance and safety.
 * Returns classification result with reason and block status.
 */
export function classifyContent(input: string): ContentGuardResult {
  const normalized = input.trim().toLowerCase();

  // 1. Check for injection attempts (CRITICAL - always block)
  if (detectInjection(input)) {
    return {
      classification: "abusive",
      reason: "prompt_injection",
      blocked: true,
    };
  }

  // 2. Check for abusive content
  if (detectAbusive(input)) {
    return {
      classification: "abusive",
      reason: "abusive_content",
      blocked: true,
    };
  }

  // 3. Check for clearly off-topic content
  const offTopicMatch = OFF_TOPIC_PATTERNS.some((p) => p.test(input));
  const relevantMatch = RELEVANT_PATTERNS.some((p) => p.test(input));

  if (offTopicMatch && !relevantMatch) {
    return {
      classification: "not_related",
      reason: "off_topic",
      blocked: true,
    };
  }

  // 4. Check for relevant content
  if (relevantMatch) {
    return {
      classification: "relevant",
      reason: "portfolio_related",
      blocked: false,
    };
  }

  // 5. Short/ambiguous inputs - allow with weak classification
  if (normalized.length < 20) {
    // Very short queries might be legitimate ("projects?" "skills")
    if (/^[a-z\s?!.]+$/i.test(normalized) && normalized.length > 2) {
      return {
        classification: "weakly_related",
        reason: "ambiguous_short",
        blocked: false,
      };
    }
  }

  // 6. Default: weakly related (allow but track)
  return {
    classification: "weakly_related",
    reason: "no_clear_signal",
    blocked: false,
  };
}

/**
 * Detect prompt injection attempts.
 */
export function detectInjection(input: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}

/**
 * Detect abusive content.
 */
export function detectAbusive(input: string): boolean {
  return ABUSIVE_PATTERNS.some((pattern) => pattern.test(input));
}

/**
 * Validate input length and structure.
 */
export function validateInputLength(input: string, maxChars: number = 1000): {
  valid: boolean;
  reason?: string;
} {
  if (input.length > maxChars) {
    return { valid: false, reason: "input_too_long" };
  }

  // Check for repeated characters (spam indicator)
  if (/(.)\1{20,}/.test(input)) {
    return { valid: false, reason: "spam_pattern" };
  }

  // Check for excessive special characters
  const specialCharRatio = (input.match(/[^a-zA-Z0-9\s.,?!'-]/g)?.length ?? 0) / input.length;
  if (specialCharRatio > 0.3 && input.length > 50) {
    return { valid: false, reason: "suspicious_content" };
  }

  return { valid: true };
}

/**
 * Detect repeated similar queries (anti-spam).
 */
export function normalizeForDedup(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
}
