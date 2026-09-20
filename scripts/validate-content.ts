/**
 * `npm run content:validate`
 *
 * Parses and validates every Markdown file under /content, reports every
 * problem, and prints a chunk summary. Exit code 1 on any error, so CI and
 * the build fail on invalid content.
 */
import { chunkDocument } from "@/lib/knowledge/chunker";
import { loadAllDocuments } from "@/lib/knowledge/repository";

const { documents, errors } = loadAllDocuments();

if (errors.length > 0) {
  console.error(`\n✖ ${errors.length} content error(s):\n`);
  for (const error of errors) console.error(`${error.message}\n`);
  process.exit(1);
}

let publicChunks = 0;
let privateChunks = 0;
const rows = documents.map((doc) => {
  const chunks = chunkDocument(doc);
  if (doc.visibility === "public") publicChunks += chunks.length;
  else privateChunks += chunks.length;
  return {
    slug: doc.slug,
    type: doc.type,
    visibility: doc.visibility,
    featured: doc.featured ? "★" : "",
    chunks: chunks.length,
    minChunk: Math.min(...chunks.map((c) => c.text.length)),
    maxChunk: Math.max(...chunks.map((c) => c.text.length)),
  };
});

console.table(rows);
console.log(
  `✔ ${documents.length} documents valid — ${documents.filter((d) => d.visibility === "public").length} public, ` +
    `${publicChunks} public chunks (${privateChunks} private chunks excluded from indexing).`,
);
