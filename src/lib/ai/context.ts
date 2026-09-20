import type { ChatMessage } from "@/types/chat";

export interface TrimOptions {
  /** Max recent turns kept verbatim. */
  maxTurns?: number;
  /** Max characters per kept turn (longer turns are clipped, keeping the start). */
  maxCharsPerTurn?: number;
  /** Overall character budget for the kept history. */
  maxTotalChars?: number;
}

export interface TrimmedConversation {
  history: ChatMessage[];
  /** Deterministic summary of dropped user questions, or null when nothing was dropped. */
  summary: string | null;
}

const DEFAULT_MAX_TURNS = 6;
const DEFAULT_MAX_CHARS_PER_TURN = 1_200;
const DEFAULT_MAX_TOTAL_CHARS = 4_000;

/**
 * Context-management strategy (cost control):
 *
 *   recent conversation (verbatim, bounded)
 *   + a summary of what was dropped (deterministic: the older user questions)
 *   + the current retrieved knowledge
 *
 * The summary is built without an LLM call — a list of the earlier user
 * questions is enough for the model to resolve references like "that
 * project", and it costs nothing. The full conversation is never sent
 * indefinitely.
 */
export function trimConversation(history: readonly ChatMessage[], options: TrimOptions = {}): TrimmedConversation {
  const maxTurns = options.maxTurns ?? DEFAULT_MAX_TURNS;
  const maxCharsPerTurn = options.maxCharsPerTurn ?? DEFAULT_MAX_CHARS_PER_TURN;
  const maxTotalChars = options.maxTotalChars ?? DEFAULT_MAX_TOTAL_CHARS;

  const clean = history.filter((turn) => turn.content.trim().length > 0);
  const kept: ChatMessage[] = [];
  let total = 0;
  for (let i = clean.length - 1; i >= 0 && kept.length < maxTurns; i -= 1) {
    const turn = clean[i]!;
    const content = turn.content.length > maxCharsPerTurn ? `${turn.content.slice(0, maxCharsPerTurn).trimEnd()}…` : turn.content;
    if (total + content.length > maxTotalChars && kept.length > 0) break;
    kept.unshift({ role: turn.role, content });
    total += content.length;
  }

  const dropped = clean.slice(0, clean.length - kept.length);
  const droppedQuestions = dropped
    .filter((turn) => turn.role === "user")
    .map((turn) => turn.content.replace(/\s+/g, " ").trim().slice(0, 120))
    .slice(-5);

  return {
    history: kept,
    summary: droppedQuestions.length > 0 ? droppedQuestions.map((q) => `"${q}"`).join("; ") : null,
  };
}
