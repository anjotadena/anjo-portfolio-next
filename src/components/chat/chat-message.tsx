import { AlertTriangle } from "lucide-react";
import { Markdown } from "@/components/markdown/markdown";
import { Prose } from "@/components/ui/prose";
import { Chip } from "@/components/ui/chip";
import { Badge } from "@/components/ui/badge";
import type { ChatUiMessage } from "./chat-types";

export interface ChatMessageItemProps {
  message: ChatUiMessage;
  onFollowUpSelect: (question: string) => void;
}

/** A "thinking" indicator shown before the first token of a streaming reply arrives. */
function TypingIndicator() {
  return (
    <span className="inline-flex gap-1 py-1" aria-hidden="true">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:300ms]" />
    </span>
  );
}

/** One turn of the conversation: a right-aligned user bubble or a left-aligned assistant bubble. */
export function ChatMessageItem({ message, onFollowUpSelect }: ChatMessageItemProps) {
  if (message.role === "user") {
    return (
      <li className="flex justify-end">
        <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
          {message.content}
        </p>
      </li>
    );
  }

  const isStreaming = message.status === "streaming";
  const isEmpty = message.content.length === 0;
  const meta = message.meta;

  return (
    <li className="flex justify-start">
      <div
        aria-busy={isStreaming}
        className="max-w-[85%] rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3"
      >
        {isEmpty && isStreaming ? (
          <TypingIndicator />
        ) : (
          <Prose>
            <Markdown content={message.content} />
          </Prose>
        )}

        {message.status === "error" && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {message.errorMessage ?? "Something went wrong. Please try again."}
          </p>
        )}

        {message.status === "interrupted" && (
          <p className="mt-2 text-sm text-muted-foreground">
            {message.errorMessage ?? "Stopped before finishing."}
          </p>
        )}

        {meta && message.status === "complete" && (
          <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3">
            {meta.mode !== "live" && (
              <p className="text-xs italic text-muted-foreground">
                {meta.mode === "unconfigured"
                  ? "No live AI provider is configured right now — this answer is limited."
                  : "Nothing closely matching this question was found in Anjo's portfolio content."}
              </p>
            )}

            {meta.sources.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                <span>Sources:</span>
                {meta.sources.map((source) =>
                  source.href ? (
                    <a key={source.slug} href={source.href} className="rounded-full">
                      <Badge variant="outline">{source.title}</Badge>
                    </a>
                  ) : (
                    <Badge key={source.slug} variant="outline">
                      {source.title}
                    </Badge>
                  ),
                )}
              </div>
            )}

            {meta.relatedProjects.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium text-muted-foreground">Related projects:</p>
                <ul className="flex flex-col gap-1">
                  {meta.relatedProjects.map((project) => (
                    <li key={project.slug}>
                      <a
                        href={project.href}
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
                      >
                        {project.title}
                        <span aria-hidden="true">&rarr;</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {meta.followUps.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium text-muted-foreground">You might also ask:</p>
                <div className="flex flex-wrap gap-2">
                  {meta.followUps.map((question) => (
                    <Chip key={question} onClick={() => onFollowUpSelect(question)}>
                      {question}
                    </Chip>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
