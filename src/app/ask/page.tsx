import type { Metadata } from "next";

import { AskClient } from "@/components/ask/AskClient";
import { Container } from "@/components/site/Container";

export const metadata: Metadata = {
  title: "Ask",
  description: "Intent-based Q&A UI (static responses for now).",
};

export default function AskPage() {
  return (
    <Container className="py-12">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Ask</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
          Full-page interface for quick answers and navigation. No AI yet—responses are mapped to intents.
        </p>
      </header>

      <div className="mt-10">
        <AskClient />
      </div>
    </Container>
  );
}

