import { redirect } from "next/navigation";

/** `/chat` is an alias for the home page; the query string (e.g. `?ask=`) is preserved. */
export default async function ChatPage({ searchParams }: PageProps<"/chat">) {
  const params = await searchParams;
  const ask = typeof params.ask === "string" ? params.ask : undefined;
  redirect(ask ? `/?ask=${encodeURIComponent(ask)}` : "/");
}
