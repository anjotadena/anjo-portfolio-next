import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ComponentType } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AssistantProvider, DRAFT_STORAGE_KEY } from "@/components/assistant/assistant-provider";
import { useAssistantActions } from "@/components/assistant/assistant-context";
import { CONVERSATION_STORAGE_KEY } from "@/components/chat/use-chat";

/* --- Next.js mocks ------------------------------------------------------ */

const navigation = vi.hoisted(() => ({
  search: "",
  replace: vi.fn(),
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: navigation.replace, push: navigation.push }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(navigation.search),
}));

// `next/dynamic` → the real ConversationView, loaded eagerly (lazy loading itself is Next's concern).
const loaded = vi.hoisted(() => ({ Component: null as ComponentType<Record<string, unknown>> | null }));
vi.mock("next/dynamic", () => ({
  default: () =>
    function Dynamic(props: Record<string, unknown>) {
      const Component = loaded.Component;
      return Component ? <Component {...props} /> : null;
    },
}));
loaded.Component = (await import("@/components/assistant/conversation-view")).ConversationView as unknown as ComponentType<Record<string, unknown>>;

/* --- Controllable /api/chat stream -------------------------------------- */

interface HeldStream {
  body: Record<string, unknown>;
  signal: AbortSignal;
  push: (event: unknown) => void;
  end: () => void;
}

let streams: HeldStream[] = [];

function installFetch() {
  const encoder = new TextEncoder();
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      if (url.startsWith("/api/health")) {
        return new Response(JSON.stringify({ status: "ok", retrieval: { ok: true }, ai: { modelBacked: true } }), { status: 200 });
      }
      let controller!: ReadableStreamDefaultController<Uint8Array>;
      const stream = new ReadableStream<Uint8Array>({ start: (c) => void (controller = c) });
      const signal = init?.signal as AbortSignal;
      signal.addEventListener("abort", () => {
        try {
          controller.error(new DOMException("Aborted", "AbortError"));
        } catch {
          // already closed
        }
      });
      streams.push({
        body: JSON.parse(String(init?.body)) as Record<string, unknown>,
        signal,
        push: (event) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`)),
        end: () => controller.close(),
      });
      return new Response(stream, { status: 200, headers: { "Content-Type": "application/x-ndjson" } });
    }),
  );
}

const chatCalls = () => streams.length;

/* --- Harness ------------------------------------------------------------ */

function AskButton({ question }: { question: string }) {
  const actions = useAssistantActions();
  return (
    <button type="button" onClick={() => actions?.askAbout(question, { contextSlug: "asterweave" })}>
      ask-cta
    </button>
  );
}

function renderAssistant() {
  return render(
    <AssistantProvider ownerFirstName="Anjo" suggestedPrompts={["What is Unexaro?", "How can I contact Anjo?"]}>
      <AskButton question="How does Asterweave work?" />
    </AssistantProvider>,
  );
}

beforeEach(() => {
  streams = [];
  navigation.search = "";
  navigation.replace.mockClear();
  sessionStorage.clear();
  installFetch();
  // jsdom: make sure the <dialog> API exists.
  const proto = HTMLDialogElement.prototype as HTMLDialogElement & Record<string, unknown>;
  if (typeof proto.show !== "function") proto.show = function (this: HTMLDialogElement) { this.setAttribute("open", ""); };
  if (typeof proto.showModal !== "function") proto.showModal = function (this: HTMLDialogElement) { this.setAttribute("open", ""); };
  if (typeof proto.close !== "function") proto.close = function (this: HTMLDialogElement) { this.removeAttribute("open"); };
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const launcher = () => screen.getByTestId("assistant-launcher");
const panel = () => screen.getByTestId("assistant-panel") as HTMLDialogElement;

describe("Anjo AI floating assistant", () => {
  it("starts closed, and the launcher opens the labelled panel with the welcome message", async () => {
    renderAssistant();
    expect(launcher()).toHaveAttribute("aria-expanded", "false");
    expect(launcher()).toHaveAttribute("aria-controls", panel().id);
    expect(panel().open).toBe(false);

    fireEvent.click(launcher());
    expect(launcher()).toHaveAttribute("aria-expanded", "true");
    expect(panel().open).toBe(true);
    expect(screen.getByTestId("assistant-welcome")).toHaveTextContent("Hi! I'm Anjo's AI assistant.");
    expect(chatCalls()).toBe(0);
  });

  it("a project CTA opens the widget and submits its explicit question once, with the project as context", async () => {
    renderAssistant();
    await act(async () => {});
    fireEvent.click(screen.getByText("ask-cta"));
    await waitFor(() => expect(chatCalls()).toBe(1));
    expect(streams[0]?.body).toMatchObject({ message: "How does Asterweave work?", contextSlug: "asterweave" });
    expect(panel().open).toBe(true);
  });

  it("never starts a second request while one is streaming; the new question goes to the composer", async () => {
    renderAssistant();
    await act(async () => {});
    fireEvent.click(screen.getByText("ask-cta"));
    await waitFor(() => expect(chatCalls()).toBe(1));
    fireEvent.click(screen.getByText("ask-cta"));
    const input = screen.getByLabelText("Your question") as HTMLTextAreaElement;
    expect(input.value).toBe("How does Asterweave work?");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(chatCalls()).toBe(1);
  });

  it("minimising keeps the stream running; the answer completes in the background", async () => {
    renderAssistant();
    await act(async () => {});
    fireEvent.click(screen.getByText("ask-cta"));
    await waitFor(() => expect(chatCalls()).toBe(1));

    fireEvent.click(launcher()); // minimise
    expect(panel().open).toBe(false);
    expect(streams[0]?.signal.aborted).toBe(false);

    await act(async () => {
      streams[0]?.push({ type: "delta", text: "Asterweave runs a delivery graph." });
      streams[0]?.push({ type: "done" });
      streams[0]?.end();
    });
    fireEvent.click(launcher());
    expect(await screen.findByText(/Asterweave runs a delivery graph/)).toBeInTheDocument();
  });

  it("Stop cancels the request explicitly", async () => {
    renderAssistant();
    await act(async () => {});
    fireEvent.click(screen.getByText("ask-cta"));
    await waitFor(() => expect(chatCalls()).toBe(1));
    fireEvent.click(await screen.findByRole("button", { name: "Stop generating" }));
    expect(streams[0]?.signal.aborted).toBe(true);
    expect(await screen.findByText("Stopped.")).toBeInTheDocument();
  });

  it("Escape inside the panel minimises it and returns focus to the launcher", async () => {
    renderAssistant();
    fireEvent.click(launcher());
    const input = screen.getByLabelText("Your question");
    input.focus();
    fireEvent.keyDown(input, { key: "Escape" });
    expect(panel().open).toBe(false);
    expect(document.activeElement).toBe(launcher());
  });

  it("New chat cancels active work and clears the conversation, draft, and stored session", async () => {
    renderAssistant();
    await act(async () => {});
    fireEvent.click(screen.getByText("ask-cta"));
    await waitFor(() => expect(chatCalls()).toBe(1));
    fireEvent.change(screen.getByLabelText("Your question"), { target: { value: "a draft" } });
    expect(sessionStorage.getItem(DRAFT_STORAGE_KEY)).toBe("a draft");

    fireEvent.click(screen.getByRole("button", { name: "New chat" }));
    expect(streams[0]?.signal.aborted).toBe(true);
    expect((screen.getByLabelText("Your question") as HTMLTextAreaElement).value).toBe("");
    expect(sessionStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull();
    expect(sessionStorage.getItem(CONVERSATION_STORAGE_KEY)).toBeNull();
    expect(screen.getByTestId("assistant-welcome")).toBeInTheDocument();
  });

  it("consumes a ?ask= deep link once: submits after restore, then strips it from the URL", async () => {
    navigation.search = "source=pwa&ask=What%20is%20Unexaro%3F";
    const view = renderAssistant();
    await waitFor(() => expect(chatCalls()).toBe(1));
    expect(streams[0]?.body).toMatchObject({ message: "What is Unexaro?" });
    expect(navigation.replace).toHaveBeenCalledWith("/?source=pwa", { scroll: false });

    // A re-render with the same (not yet replaced) URL must not replay it.
    view.rerender(
      <AssistantProvider ownerFirstName="Anjo" suggestedPrompts={[]}>
        <AskButton question="x" />
      </AssistantProvider>,
    );
    await act(async () => {});
    expect(chatCalls()).toBe(1);
  });

  it("restores the conversation and draft from session storage", async () => {
    sessionStorage.setItem(
      CONVERSATION_STORAGE_KEY,
      JSON.stringify([
        { id: "u1", role: "user", content: "Earlier question", status: "complete", createdAt: 1 },
        { id: "a1", role: "assistant", content: "Earlier answer", status: "complete", createdAt: 2 },
      ]),
    );
    sessionStorage.setItem(DRAFT_STORAGE_KEY, "half-typed");
    renderAssistant();
    fireEvent.click(launcher());
    expect(await screen.findByText("Earlier answer")).toBeInTheDocument();
    expect((screen.getByLabelText("Your question") as HTMLTextAreaElement).value).toBe("half-typed");
  });
});


