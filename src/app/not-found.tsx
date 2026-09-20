import Link from "next/link";
import { AskAiLink } from "@/components/portfolio/ask-ai-link";

export default function NotFound() {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto p-6">
      <div className="max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">404</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">The page you&apos;re looking for doesn&apos;t exist or has moved. The assistant can probably find what you were after.</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <AskAiLink question="Tell me about Anjo" label="Ask Anjo AI" />
          <Link href="/projects" className="text-sm font-medium text-primary underline underline-offset-4">
            Browse projects
          </Link>
        </div>
      </div>
    </div>
  );
}
