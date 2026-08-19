/**
 * Exact, verbatim fallback strings. These are asserted on by tests and
 * referenced directly in the system prompt, so they live in one place.
 */

/** Used when retrieval found nothing grounded to answer from. */
export const UNGROUNDED_FALLBACK = "I don't have that information in Anjo's portfolio yet.";

/**
 * Used by `NullProvider` when a question WAS grounded in the portfolio
 * content, but no live model is configured to synthesize an answer from
 * it yet.
 */
export const UNCONFIGURED_FALLBACK =
  "I don't have that information in Anjo's portfolio yet. The AI assistant isn't connected to a language model yet, so I can only point you to the site itself: " +
  "check the Projects and Skills sections, or reach out directly through the Contact page.";
