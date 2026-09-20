import { randomUUID } from "node:crypto";
import { logEvent, type LogValue } from "./log";

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface CostRates {
  inputCostPer1M: number;
  outputCostPer1M: number;
}

/** Estimated USD cost for a request, rounded to 6 decimals; purely informational. */
export function estimateCost(usage: TokenUsage, rates: CostRates): number {
  const cost = (usage.inputTokens / 1_000_000) * rates.inputCostPer1M + (usage.outputTokens / 1_000_000) * rates.outputCostPer1M;
  return Math.round(cost * 1_000_000) / 1_000_000;
}

/**
 * Per-request timing collector. Each stage of the chat pipeline
 * (validation, retrieval, embedding, first token, total) is recorded and
 * emitted as one structured log line at the end, so latency questions
 * ("is it retrieval or the model?") can be answered from logs alone.
 */
export class RequestMetrics {
  readonly requestId = randomUUID();
  private readonly startedAt = performance.now();
  private readonly marks = new Map<string, number>();
  private readonly fields: Record<string, LogValue> = {};

  constructor(private readonly route: string) {}

  /** Measures an async stage and records `<name>Ms`. */
  async time<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      return await fn();
    } finally {
      this.marks.set(`${name}Ms`, Math.round(performance.now() - start));
    }
  }

  mark(name: string): void {
    this.marks.set(`${name}Ms`, Math.round(performance.now() - this.startedAt));
  }

  set(key: string, value: LogValue): void {
    this.fields[key] = value;
  }

  elapsedMs(): number {
    return Math.round(performance.now() - this.startedAt);
  }

  flush(event: string, level: "info" | "warn" | "error" = "info"): void {
    logEvent(level, {
      route: this.route,
      event,
      requestId: this.requestId,
      durationMs: this.elapsedMs(),
      ...Object.fromEntries(this.marks),
      ...this.fields,
    });
  }
}
