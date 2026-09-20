#!/usr/bin/env node
/**
 * Minimal OpenAI-compatible mock for local development and E2E:
 *   POST /v1/embeddings  -> deterministic bag-of-words vectors (any `dimensions`)
 *   POST /v1/responses   -> streams an SSE answer that quotes the first context block and cites [1]
 *
 * Usage:
 *   node scripts/mock-openai.mjs            # listens on :4010
 *   OPENAI_API_KEY=mock OPENAI_BASE_URL=http://127.0.0.1:4010/v1 npm run content:index
 *   OPENAI_API_KEY=mock OPENAI_BASE_URL=http://127.0.0.1:4010/v1 npm run dev
 *
 * Never use in production; it exists so the "live" code paths (Responses
 * API streaming, file/pgvector retrieval) can be exercised without a key.
 */
import { createHash } from "node:crypto";
import http from "node:http";

const PORT = Number(process.env.MOCK_OPENAI_PORT ?? 4010);

// Bag-of-words over non-stopword tokens (mirrors HashEmbeddingProvider), so
// off-topic questions do not look similar to everything.
const STOPWORDS = new Set(
  "a an and are as at be been by can could did do does doing for from had has have he her him his how i if in into is it its me my no not of on or our she should so some than that the their them then there these they this those to us was we were what when where which who why will with would you your anjo anjos does have has do".split(" "),
);

function embed(text, dimensions) {
  const vector = new Array(dimensions).fill(0);
  for (const token of text.toLowerCase().match(/[a-z0-9]+(?:[.+#][a-z0-9]*)*/g) ?? []) {
    if (STOPWORDS.has(token)) continue;
    const digest = createHash("sha1").update(token).digest();
    vector[digest.readUInt32BE(0) % dimensions] += digest[4] & 1 ? 1 : -1;
  }
  const norm = Math.sqrt(vector.reduce((s, v) => s + v * v, 0)) || 1;
  return vector.map((v) => v / norm);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function sse(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify({ type: event, ...data })}\n\n`);
}

const server = http.createServer(async (req, res) => {
  if (req.method !== "POST") {
    res.writeHead(404).end();
    return;
  }
  const body = await readJson(req).catch(() => null);
  if (!body) {
    res.writeHead(400).end();
    return;
  }

  if (req.url === "/v1/embeddings") {
    const inputs = Array.isArray(body.input) ? body.input : [body.input];
    const dimensions = Number(body.dimensions ?? 1536);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ data: inputs.map((text, index) => ({ index, embedding: embed(String(text), dimensions) })), model: body.model, usage: { prompt_tokens: 0, total_tokens: 0 } }));
    return;
  }

  if (req.url === "/v1/responses") {
    const instructions = String(body.instructions ?? "");
    const match = /\[1\] SOURCE: ([^\n]+)\n([\s\S]*?)\n<<ctx-/.exec(instructions);
    const label = match?.[1] ?? "the portfolio";
    const excerpt = (match?.[2] ?? "").replace(/\s+/g, " ").trim().slice(0, 240);
    const question = Array.isArray(body.input) ? String(body.input.at(-1)?.content ?? "") : "";
    const answer = `**Mock answer** to "${question}". According to ${label}: ${excerpt} [1]\n\nAsk me about a related topic for more. [9]`;

    res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" });
    sse(res, "response.created", { response: { id: "resp_mock" } });
    for (const piece of answer.match(/.{1,18}/gs) ?? []) {
      sse(res, "response.output_text.delta", { delta: piece });
      await new Promise((resolve) => setTimeout(resolve, 8));
    }
    sse(res, "response.completed", { response: { id: "resp_mock", usage: { input_tokens: 321, output_tokens: 64 } } });
    res.end();
    return;
  }

  res.writeHead(404).end();
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`mock-openai listening on http://127.0.0.1:${PORT}/v1`);
});
