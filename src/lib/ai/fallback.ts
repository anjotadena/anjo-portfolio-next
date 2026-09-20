/**
 * Exact, verbatim fallback strings. Tests assert on these and the system
 * prompt references them, so they live in one place.
 */

/** Returned when retrieval finds nothing relevant. The model is never called on this path. */
export const UNGROUNDED_FALLBACK =
  "I couldn't find enough information in Anjo's portfolio to answer that confidently.\n\n" +
  "You can ask me about his projects, software engineering experience, AI work, cloud architecture, or technical skills.";

/** The phrase the model must use when the retrieved context does not cover the question. */
export const NOT_ENOUGH_INFO_PHRASE = "Anjo's portfolio doesn't currently include enough information";
