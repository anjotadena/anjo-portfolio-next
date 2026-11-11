import { redirect } from "next/navigation";

/**
 * Legacy `/chat` links: the assistant is now a site-wide floating widget.
 * `/chat?ask=…` becomes `/?ask=…` (submitted once, then stripped from the
 * URL) and bare `/chat` becomes `/?assistant=open`. The question is
 * re-encoded so punctuation and non-ASCII characters survive intact.
 */
export default async function ChatPage({ searchParams }: PageProps<"/chat">) {
  const params = await searchParams;
  const raw = Array.isArray(params.ask) ? params.ask[0] : params.ask;
  const ask = typeof raw === "string" ? raw.trim() : "";
  redirect(ask ? `/?ask=${encodeURIComponent(ask)}` : "/?assistant=open");
}
