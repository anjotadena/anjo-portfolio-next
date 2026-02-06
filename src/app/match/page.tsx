"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { LuArrowRight, LuDownload, LuLoader, LuFileText, LuLink } from "react-icons/lu";

import { Container } from "@/components/site/Container";
import { on } from "@/utils";

type MatchResult = {
  matchScore: number;
  verdict: "Strong Match" | "Partial Match" | "Not Ideal";
  strengths: string[];
  gaps: string[];
  summary: string;
  resumeVariantId: string;
};

type InputMode = "text" | "url";

export default function MatchPage() {
  const [mode, setMode] = useState<InputMode>("text");
  const [jobDescription, setJobDescription] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MatchResult | null>(null);

  const handleSubmit = useCallback(async () => {
    setError(null);
    setResult(null);

    const payload =
      mode === "text"
        ? { jobDescription: jobDescription.trim() }
        : { jobUrl: jobUrl.trim() };

    if (mode === "text" && !jobDescription.trim()) {
      setError("Please enter a job description.");
      return;
    }
    if (mode === "url" && !jobUrl.trim()) {
      setError("Please enter a job posting URL.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/match-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setResult(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [mode, jobDescription, jobUrl]);

  const handleReset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return (
    <Container className="py-12">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Job Match Tool</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
          For recruiters and hiring managers: paste a job description or link to evaluate fit
          and download a tailored resume.
        </p>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          This tool provides an honest, evidence-based assessment. No skills or experience are
          fabricated.
        </p>
      </header>

      {!result ? (
        <section className="mt-10 max-w-2xl">
          {/* Mode toggle */}
          <div className="mb-6 flex gap-2">
            <ModeButton
              active={mode === "text"}
              onClick={() => setMode("text")}
              icon={<LuFileText size={16} />}
              label="Paste Description"
            />
            <ModeButton
              active={mode === "url"}
              onClick={() => setMode("url")}
              icon={<LuLink size={16} />}
              label="Job URL"
            />
          </div>

          {/* Input */}
          {mode === "text" ? (
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              rows={12}
              className={on(
                "w-full resize-none rounded-xl border border-zinc-200 bg-white p-4 text-sm",
                "text-zinc-900 placeholder:text-zinc-400",
                "focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
                "dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500",
                "dark:focus:border-zinc-600 dark:focus:ring-zinc-50"
              )}
            />
          ) : (
            <input
              type="url"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              placeholder="https://linkedin.com/jobs/view/..."
              className={on(
                "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm",
                "text-zinc-900 placeholder:text-zinc-400",
                "focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
                "dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500",
                "dark:focus:border-zinc-600 dark:focus:ring-zinc-50"
              )}
            />
          )}

          {/* Error */}
          {error && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className={on(
              "mt-6 inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium",
              "bg-zinc-950 text-white hover:bg-zinc-800",
              "focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-60",
              "dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus:ring-zinc-50"
            )}
          >
            {isLoading ? (
              <>
                <LuLoader size={16} className="animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                Evaluate Fit
                <LuArrowRight size={16} />
              </>
            )}
          </button>

          <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
            Works with any job posting URL. For best results, use the direct link to the job posting.
          </p>
        </section>
      ) : (
        <section className="mt-10 max-w-2xl">
          <ResultCard result={result} onReset={handleReset} />
        </section>
      )}

      {/* Footer links */}
      <footer className="mt-16 border-t border-zinc-200 pt-8 dark:border-zinc-800">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Want to connect directly?{" "}
          <Link href="/contact" className="underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-50">
            Contact me
          </Link>{" "}
          or{" "}
          <Link href="/projects" className="underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-50">
            explore projects
          </Link>
          .
        </p>
      </footer>
    </Container>
  );
}

function ModeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={on(
        "inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "border-zinc-950 bg-zinc-950 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-950"
          : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function ResultCard({ result, onReset }: { result: MatchResult; onReset: () => void }) {
  const verdictColor =
    result.verdict === "Strong Match"
      ? "text-green-600 dark:text-green-400"
      : result.verdict === "Partial Match"
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-600 dark:text-red-400";

  const scoreColor =
    result.matchScore >= 80
      ? "bg-green-500"
      : result.matchScore >= 50
        ? "bg-amber-500"
        : "bg-red-500";

  return (
    <div className="space-y-6">
      {/* Score header */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between">
          <div>
            <p className={on("text-2xl font-semibold", verdictColor)}>{result.verdict}</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Match assessment</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
              {result.matchScore}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">/ 100</p>
          </div>
        </div>
        {/* Score bar */}
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className={on("h-full rounded-full transition-all duration-500", scoreColor)}
            style={{ width: `${result.matchScore}%` }}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Summary</h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          {result.summary}
        </p>
      </div>

      {/* Strengths */}
      {result.strengths.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="text-sm font-semibold text-green-600 dark:text-green-400">Strengths</h3>
          <ul className="mt-3 space-y-2">
            {result.strengths.map((strength, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                {strength}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Gaps */}
      {result.gaps.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400">Gaps</h3>
          <ul className="mt-3 space-y-2">
            {result.gaps.map((gap, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                {gap}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <a
          href={`/api/match-job/resume/${result.resumeVariantId}`}
          download
          className={on(
            "inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium",
            "bg-zinc-950 text-white hover:bg-zinc-800",
            "focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
            "dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus:ring-zinc-50"
          )}
        >
          <LuDownload size={16} />
          Download Tailored Resume
        </a>
        <button
          type="button"
          onClick={onReset}
          className={on(
            "inline-flex items-center gap-2 rounded-md border border-zinc-200 px-5 py-2.5 text-sm font-medium",
            "bg-white text-zinc-700 hover:bg-zinc-50",
            "focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
            "dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:focus:ring-zinc-50"
          )}
        >
          Try Another Job
        </button>
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        The tailored resume highlights relevant experience without adding fabricated content.
        Resume variant expires in 24 hours.
      </p>
    </div>
  );
}
