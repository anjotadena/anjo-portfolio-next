/**
 * Derives a rate-limit bucket key from request headers.
 *
 * `x-forwarded-for` is a comma-separated hop chain appended by each proxy
 * in front of this app (`client, proxy1, proxy2, ...`). Trusting the
 * left-most entry blindly lets any client spoof an arbitrary "IP" simply
 * by sending its own `X-Forwarded-For` header. For a single
 * reverse-proxy deployment (one trusted edge/load balancer sits directly
 * in front of this Node process) the only hop guaranteed to have been
 * appended by infrastructure we trust is the LAST one in the chain --
 * everything to its left may have been supplied by the client itself.
 */
export function deriveClientKey(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  const ip = extractTrustedHop(forwardedFor) ?? headers.get("x-real-ip") ?? "unknown";
  return bucketIp(ip.trim());
}

function extractTrustedHop(headerValue: string | null): string | null {
  if (!headerValue) return null;
  const hops = headerValue
    .split(",")
    .map((hop) => hop.trim())
    .filter(Boolean);
  if (hops.length === 0) return null;
  return hops[hops.length - 1] ?? null;
}

function bucketIp(ip: string): string {
  return ip.includes(":") ? bucketIpv6(ip) : ip;
}

/** Buckets an IPv6 address by its /64 prefix -- the typical end-user
 * allocation boundary -- so a single customer with a rotating interface
 * identifier within their /64 still maps to one bucket. */
function bucketIpv6(ip: string): string {
  const withoutZone = ip.split("%")[0] ?? ip;
  const groups = expandIpv6(withoutZone);
  return groups.slice(0, 4).join(":");
}

function expandIpv6(ip: string): string[] {
  const parts = ip.split("::");
  const head = parts[0] ?? "";
  const tail = parts[1] ?? "";
  const headGroups = head.length > 0 ? head.split(":").filter(Boolean) : [];
  const tailGroups = tail.length > 0 ? tail.split(":").filter(Boolean) : [];
  const missing = Math.max(0, 8 - headGroups.length - tailGroups.length);
  const zeros = missing > 0 ? Array<string>(missing).fill("0000") : [];
  const full = [...headGroups, ...zeros, ...tailGroups];
  return full.map((group) => group.padStart(4, "0")).slice(0, 8);
}
