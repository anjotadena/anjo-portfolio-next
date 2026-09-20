/**
 * `npm run eval [-- --answers] [-- --backend=lexical|env]`
 *
 * RAG evaluation suite over `evals/cases.json`.
 *
 *   retrieval relevance   at least one expected source document is retrieved
 *   citation correctness  every [n] in the answer maps to a provided source
 *   groundedness          must_not_invent cases are ungrounded, or the model
 *                         answer says the portfolio lacks the information
 *   cards                 expected typed card is attached
 *
 * By default it runs the zero-infrastructure path (lexical retrieval +
 * extractive answers) so it works in CI. `--backend=env` uses whatever the
 * environment configures (pgvector + OpenAI), and `--answers` also
 * generates model answers and checks them.
 */
import { loadEnvFiles } from "./lib/load-env";
loadEnvFiles();

import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import type { ChatMessage } from "@/types/chat";
import { getEnv } from "@/lib/config/env";
import { getAllDocumentsIncludingPrivate, getPublicChunks } from "@/lib/knowledge/repository";
import { LexicalRetriever } from "@/lib/retrieval/lexical";
import { getRetriever } from "@/lib/retrieval";
import { prepareTurn } from "@/lib/ai/rag";
import { getChatProvider } from "@/lib/ai/client";
import { extractCitedIndices } from "@/lib/ai/citations";
import { NOT_ENOUGH_INFO_PHRASE, UNGROUNDED_FALLBACK } from "@/lib/ai/fallback";

const caseSchema = z.object({
  id: z.string(),
  question: z.string(),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).optional(),
  expectedSources: z.array(z.string()).optional(),
  expectedSection: z.string().optional(),
  expectedCard: z.enum(["project", "case-study", "post", "skills", "contact", "experience", "certifications"]).optional(),
  expectedBehavior: z.enum(["must_not_invent", "grounded"]).optional(),
});
const fileSchema = z.object({
  thresholds: z.object({ retrievalHitRate: z.number(), mustNotInventPassRate: z.number(), citationValidityRate: z.number() }),
  cases: z.array(caseSchema),
});

interface CaseResult {
  id: string;
  retrieval: "pass" | "fail" | "n/a";
  behavior: "pass" | "fail" | "n/a";
  card: "pass" | "fail" | "n/a";
  citations: "pass" | "fail" | "n/a";
  topSources: string;
  note: string;
}

async function generateAnswer(prompt: NonNullable<Awaited<ReturnType<typeof prepareTurn>>["prompt"]>, maxOutputTokens: number): Promise<string> {
  let answer = "";
  for await (const event of getChatProvider().stream({ ...prompt, maxOutputTokens })) {
    if (event.type === "text") answer += event.text;
  }
  return answer;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const withAnswers = args.includes("--answers");
  const backend = args.find((arg) => arg.startsWith("--backend="))?.slice("--backend=".length) ?? "lexical";

  const file = fileSchema.parse(JSON.parse(fs.readFileSync(path.join(process.cwd(), "evals", "cases.json"), "utf8")));
  const documents = getAllDocumentsIncludingPrivate();
  const retriever = backend === "env" ? getRetriever() : new LexicalRetriever(getPublicChunks);
  const env = getEnv();
  console.log(`Evaluating ${file.cases.length} cases with retriever=${retriever.name}${withAnswers ? ` and answers from ${getChatProvider().name}` : ""}\n`);

  const results: CaseResult[] = [];
  for (const testCase of file.cases) {
    const history: ChatMessage[] = testCase.history ?? [];
    const turn = await prepareTurn({ message: testCase.question, history }, { retriever, documents, maxChunks: env.retrieval.maxChunks });
    const retrievedSlugs = turn.sources.map((source) => source.documentSlug);
    const result: CaseResult = {
      id: testCase.id,
      retrieval: "n/a",
      behavior: "n/a",
      card: "n/a",
      citations: "n/a",
      topSources: Array.from(new Set(retrievedSlugs)).slice(0, 3).join(", "),
      note: "",
    };

    if (testCase.expectedSources) {
      const hit = testCase.expectedSources.some((slug) => retrievedSlugs.includes(slug));
      const sectionOk = !testCase.expectedSection || turn.sources.some((source) => source.section === testCase.expectedSection);
      result.retrieval = hit && sectionOk ? "pass" : "fail";
      if (!hit) result.note = `expected one of [${testCase.expectedSources.join(", ")}]`;
      else if (!sectionOk) result.note = `expected section "${testCase.expectedSection}"`;
    }

    if (testCase.expectedCard) {
      result.card = turn.cards.some((card) => card.kind === testCase.expectedCard) ? "pass" : "fail";
    }

    let answer: string | null = null;
    if (turn.grounded && turn.prompt && withAnswers) {
      answer = await generateAnswer(turn.prompt, env.ai.maxOutputTokens);
      const cited = extractCitedIndices(answer);
      result.citations = cited.every((index) => index >= 1 && index <= turn.sources.length) ? "pass" : "fail";
    } else if (!turn.grounded) {
      answer = UNGROUNDED_FALLBACK;
    }

    if (testCase.expectedBehavior === "must_not_invent") {
      const declined = !turn.grounded || (answer !== null && (answer.includes(NOT_ENOUGH_INFO_PHRASE) || answer === UNGROUNDED_FALLBACK));
      // Without a model we can only judge retrieval: a grounded turn means the
      // model *could* answer, so we require the model's own refusal when answers are on.
      result.behavior = declined ? "pass" : withAnswers ? "fail" : turn.grounded ? "fail" : "pass";
      if (!declined) result.note = `grounded on [${result.topSources}] — ${withAnswers ? "answer did not decline" : "would reach the model"}`;
    } else if (testCase.expectedBehavior === "grounded") {
      result.behavior = turn.grounded ? "pass" : "fail";
    }

    results.push(result);
  }

  console.table(results.map(({ id, retrieval, behavior, card, citations, topSources, note }) => ({ id, retrieval, behavior, card, citations, topSources, note })));

  const rate = (key: keyof Pick<CaseResult, "retrieval" | "behavior" | "card" | "citations">, filter?: (r: CaseResult) => boolean) => {
    const pool = results.filter((r) => r[key] !== "n/a" && (!filter || filter(r)));
    if (pool.length === 0) return 1;
    return pool.filter((r) => r[key] === "pass").length / pool.length;
  };

  const retrievalHitRate = rate("retrieval");
  const mustNotInventPassRate = rate("behavior", (r) => file.cases.find((c) => c.id === r.id)?.expectedBehavior === "must_not_invent");
  const citationValidityRate = rate("citations");
  const cardRate = rate("card");

  console.log(
    `\nretrieval hit rate      ${(retrievalHitRate * 100).toFixed(0)}%  (threshold ${file.thresholds.retrievalHitRate * 100}%)\n` +
      `must-not-invent rate    ${(mustNotInventPassRate * 100).toFixed(0)}%  (threshold ${file.thresholds.mustNotInventPassRate * 100}%)\n` +
      `citation validity       ${(citationValidityRate * 100).toFixed(0)}%  (threshold ${file.thresholds.citationValidityRate * 100}%)${withAnswers ? "" : "  (answers not generated; pass --answers)"}\n` +
      `card attachment         ${(cardRate * 100).toFixed(0)}%`,
  );

  const failed =
    retrievalHitRate < file.thresholds.retrievalHitRate ||
    mustNotInventPassRate < file.thresholds.mustNotInventPassRate ||
    citationValidityRate < file.thresholds.citationValidityRate;
  if (failed) {
    console.error("\n✖ Evaluation thresholds not met.");
    process.exit(1);
  }
  console.log("\n✔ Evaluation thresholds met.");
}

main().catch((error: unknown) => {
  console.error(`✖ Eval failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
