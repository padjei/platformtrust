// Machine-readable health check for the web surface.
// Returns only safe, non-sensitive status information — no secrets,
// host details, or internal configuration are exposed.

// Ensure a fresh timestamp on every request (no static caching).
export const dynamic = 'force-dynamic';

export function GET(): Response {
  const body = {
    status: 'ok',
    service: 'platformtrust-web',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  } as const;

  return Response.json(body, { status: 200 });
}
