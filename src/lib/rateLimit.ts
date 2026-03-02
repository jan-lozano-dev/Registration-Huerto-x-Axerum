// In-memory rate limiter — best-effort in serverless (state resets on cold start).
// Protects the POST endpoint from spam and credential stuffing.
const store = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60_000; // 1-minute sliding window
const MAX_REQUESTS = 5;   // max registrations per IP per window

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  if (entry.count >= MAX_REQUESTS) return true;

  entry.count++;
  return false;
}
