/**
 * Matches `ContactRequestBody` in `src/types/api.ts` (no `subject` field
 * -- the contact form only ever collects name/email/message). A concrete
 * transport that needs an email subject line can synthesize one itself,
 * e.g. `Portfolio contact from ${name}`.
 */
export interface ContactMessageInput {
  name: string;
  email: string;
  message: string;
}

export interface MailTransport {
  readonly name: string;
  readonly isConfigured: boolean;
  send(input: ContactMessageInput): Promise<void>;
}

/**
 * Safe default when no real transport is wired up. `isConfigured` is
 * always `false`, so the contact route returns `503` rather than
 * pretending to accept mail it can't actually deliver -- silently
 * discarding a real visitor's message would be worse than a clear error.
 */
export class NoopTransport implements MailTransport {
  readonly name = "noop";
  readonly isConfigured = false;

  async send(): Promise<void> {
    throw new Error(
      "NoopTransport cannot send mail; it is the safe default for an unconfigured environment and should never be invoked (isConfigured is false).",
    );
  }
}

/**
 * In-memory transport for tests ONLY. Selected via `CONTACT_TRANSPORT=memory`.
 *
 * It refuses to activate when `NODE_ENV === "production"` unless
 * `E2E_TEST_MODE=1` is ALSO explicitly set (see `getMailTransport`
 * below), so a stray/misconfigured `CONTACT_TRANSPORT=memory` env var can
 * never silently swallow a real visitor's message in production.
 */
export class MemoryTransport implements MailTransport {
  readonly name = "memory";
  readonly isConfigured = true;

  private readonly sent: ContactMessageInput[] = [];

  async send(input: ContactMessageInput): Promise<void> {
    this.sent.push(input);
  }

  getSentMessages(): readonly ContactMessageInput[] {
    return this.sent;
  }
}

export function getMailTransport(): MailTransport {
  const requestedTransport = process.env.CONTACT_TRANSPORT;

  if (requestedTransport === "memory") {
    const isProduction = process.env.NODE_ENV === "production";
    const e2eOverride = process.env.E2E_TEST_MODE === "1";
    if (!isProduction || e2eOverride) {
      return new MemoryTransport();
    }
  }

  return new NoopTransport();
}
