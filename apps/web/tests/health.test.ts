import { describe, expect, it } from 'vitest';
import { GET } from '../src/app/health/route';

interface HealthBody {
  status: string;
  service: string;
  version: string;
  timestamp: string;
}

describe('GET /health', () => {
  it('responds with HTTP 200', async () => {
    const response = GET();
    expect(response.status).toBe(200);
  });

  it('returns the expected health payload shape', async () => {
    const response = GET();
    const body = (await response.json()) as HealthBody;

    expect(body.status).toBe('ok');
    expect(body.service).toBe('platformtrust-web');
    expect(body.version).toBe('0.1.0');
    expect(typeof body.timestamp).toBe('string');
    // timestamp must be a valid ISO-8601 instant.
    expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
  });
});
