"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LuArrowRight } from "react-icons/lu";

import { detectIntent, responses, suggestedQuestions } from "@/data/ask";
import { on } from "@/utils";

type Message =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string; ctas?: { label: string; href: string }[] };

export function AskClient() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Ask about projects, architecture, leadership, or my resume. (Static responses for now.)",
    },
  ]);

  const canSend = input.trim().length > 0;

  const onSend = (question: string) => {
    const q = question.trim();
    if (!q) return;

    const intent = detectIntent(q);
    const answer = responses[intent];

    setMessages((prev) => [
      ...prev,
      { role: "user", content: q },
      {
        role: "assistant",
        content: answer.body,
        ctas: answer.ctas,
      },
    ]);
    setInput("");
  };

  const suggestions = useMemo(() => suggestedQuestions, []);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Ask</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {/* TODO: Replace intent matching with real AI integration */}
          Static intent-based responses (no AI yet).
        </p>
      </div>

      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSend(s)}
              className={on(
                "rounded-full border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700",
                "hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
                "dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:focus:ring-zinc-50"
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          {messages.map((m, idx) => (
            <div key={idx} className={on("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={on(
                  "max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950"
                    : "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50"
                )}
              >
                <p>{m.content}</p>
                {"ctas" in m && m.ctas && m.ctas.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {m.ctas.map((cta) => (
                      <Link
                        key={cta.href}
                        href={cta.href}
                        className={on(
                          "inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm",
                          "hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
                          "dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 dark:focus:ring-zinc-50"
                        )}
                      >
                        {cta.label}
                        <LuArrowRight aria-hidden="true" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSend(input);
        }}
        className="border-t border-zinc-200 p-4 dark:border-zinc-800"
      >
        <label className="sr-only" htmlFor="ask-input">
          Ask a question
        </label>
        <div className="flex items-center gap-2">
          <input
            id="ask-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a question…"
            className={on(
              "w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900",
              "placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
              "dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:ring-zinc-50"
            )}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!canSend}
            className={on(
              "rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white",
              "hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus:ring-zinc-50"
            )}
            aria-label="Send question"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

