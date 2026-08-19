/**
 * Reads a `Request` body as text while counting actual received bytes,
 * throwing as soon as the cap is exceeded -- rather than trusting the
 * client-supplied `Content-Length` header, which a malicious or buggy
 * client can simply omit or lie about.
 */
export const MAX_REQUEST_BYTES = 64 * 1024; // 64KB

export class RequestTooLargeError extends Error {
  constructor() {
    super("Request body exceeds the maximum allowed size");
    this.name = "RequestTooLargeError";
  }
}

export async function readBodyWithLimit(
  request: Request,
  maxBytes: number = MAX_REQUEST_BYTES,
): Promise<string> {
  if (!request.body) return "";

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let receivedBytes = 0;
  let result = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      receivedBytes += value.byteLength;
      if (receivedBytes > maxBytes) {
        throw new RequestTooLargeError();
      }
      result += decoder.decode(value, { stream: true });
    }
    result += decoder.decode();
    return result;
  } finally {
    reader.releaseLock();
  }
}
