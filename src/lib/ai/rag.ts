import type { ChatCard, ChatMessage, ChatSource } from "@/types/chat";
import type { ContentDocument } from "@/types/content";
import type { KnowledgeResult, KnowledgeRetriever } from "@/lib/retrieval/types";
import { buildCards } from "./cards";
import { buildSources } from "./citations";
import { trimConversation } from "./context";
import { buildFollowUps } from "./follow-ups";
import { buildPrompt, type BuiltPrompt } from "./prompts";
import { understandQuery, type QueryIntent } from "./query";

/** Vocabulary the preferred document type actually uses, appended to the type-scoped search only. */
const INTENT_ANCHORS: Partial<Record<QueryIntent, string>> = {
  profile: "profile overview senior software engineer",
  skills: "skills capability technical stack",
  projects: "project overview",
  blog: "blog post article",
  contact: "contact email linkedin reach",
  experience: "professional experience role company",
  certifications: "certification credential issuer",
};

export interface RagDependencies {
  retriever: KnowledgeRetriever;
  /** All documents (public and private); the orchestrator filters to public itself. */
  documents: readonly ContentDocument[];
  maxChunks: number;
}

export interface RagInput {
  message: string;
  history: readonly ChatMessage[];
  /** Optional slug of a document the visitor is currently looking at. */
  contextSlug?: string;
}

export interface PreparedTurn {
  grounded: boolean;
  intent: QueryIntent;
  retrievalQuery: string;
  results: KnowledgeResult[];
  sources: ChatSource[];
  cards: ChatCard[];
  followUps: string[];
  /** Null when ungrounded — the provider must not be called. */
  prompt: BuiltPrompt | null;
}

/**
 * The RAG request flow, minus transport:
 *
 *   validated message
 *     -> query understanding (intent, follow-up rewriting)
 *     -> retrieval (vector + lexical, relevance-filtered, public only)
 *     -> grounded context (numbered, fenced)
 *     -> citations / cards / related questions (server-derived)
 *
 * Pure with respect to its dependencies, so the integration test drives it
 * with an in-memory store and a fake provider.
 */
export async function prepareTurn(input: RagInput, deps: RagDependencies): Promise<PreparedTurn> {
  const publicDocs = deps.documents.filter((doc) => doc.visibility === "public");
  const understood = understandQuery(input.message, input.history);

  let retrievalQuery = understood.retrievalQuery;
  const contextDoc = input.contextSlug ? publicDocs.find((doc) => doc.slug === input.contextSlug) : undefined;
  if (contextDoc && !retrievalQuery.toLowerCase().includes(contextDoc.title.toLowerCase())) {
    retrievalQuery = `${retrievalQuery} ${contextDoc.title}`;
  }

  // Intent-preferred document types go first, then the best general
  // matches fill the remaining slots — a bias, never a hard filter. The
  // preferred search is anchored with the vocabulary those documents use,
  // so "what technologies does he use?" reaches the skills document even
  // though its prose never says "technologies".
  const general = await deps.retriever.search(retrievalQuery, { limit: deps.maxChunks });
  let results = general;
  if (understood.preferredTypes) {
    const anchor = INTENT_ANCHORS[understood.intent];
    const preferred = await deps.retriever.search(anchor ? `${retrievalQuery} ${anchor}` : retrievalQuery, {
      limit: Math.ceil(deps.maxChunks / 2),
      types: understood.preferredTypes,
    });
    const seen = new Set(preferred.map((result) => result.chunk.id));
    results = [...preferred, ...general.filter((result) => !seen.has(result.chunk.id))].slice(0, deps.maxChunks);
  }
  if (contextDoc) {
    const scoped = await deps.retriever.search(retrievalQuery, { limit: 2, slugs: [contextDoc.slug] });
    const seen = new Set(scoped.map((result) => result.chunk.id));
    results = [...scoped, ...results.filter((result) => !seen.has(result.chunk.id))].slice(0, deps.maxChunks);
  }

  const grounded = results.length > 0;
  const sources = buildSources(results);
  const cards = buildCards({ intent: understood.intent, results, documents: publicDocs });
  const followUps = buildFollowUps(results, publicDocs, input.message);

  if (!grounded) {
    return { grounded, intent: understood.intent, retrievalQuery, results, sources, cards, followUps, prompt: null };
  }

  const trimmed = trimConversation(input.history);
  const prompt = buildPrompt({
    results,
    history: trimmed.history,
    userMessage: input.message,
    conversationSummary: trimmed.summary,
  });

  return { grounded, intent: understood.intent, retrievalQuery, results, sources, cards, followUps, prompt };
}
