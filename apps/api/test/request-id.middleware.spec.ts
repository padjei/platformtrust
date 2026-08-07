import { describe, expect, it, vi } from 'vitest';

import { requestIdMiddleware } from '../src/common/request-id.middleware';
import type { HeaderSettableResponse, RequestWithId } from '../src/common/request-context';

function makeResponse(): { res: HeaderSettableResponse; headers: Map<string, string> } {
  const headers = new Map<string, string>();
  const res: HeaderSettableResponse = {
    setHeader: (name, value) => {
      headers.set(name.toLowerCase(), value);
    },
  };
  return { res, headers };
}

describe('requestIdMiddleware', () => {
  it('reuses an inbound x-request-id', () => {
    const req: RequestWithId = { headers: { 'x-request-id': 'abc-123' } };
    const { res, headers } = makeResponse();
    const next = vi.fn();

    requestIdMiddleware(req, res, next);

    expect(req.requestId).toBe('abc-123');
    expect(headers.get('x-request-id')).toBe('abc-123');
    expect(next).toHaveBeenCalledOnce();
  });

  it('generates a request id when the header is absent', () => {
    const req: RequestWithId = { headers: {} };
    const { res, headers } = makeResponse();
    const next = vi.fn();

    requestIdMiddleware(req, res, next);

    expect(req.requestId).toBeDefined();
    expect(req.requestId).toHaveLength(36); // UUID v4
    expect(headers.get('x-request-id')).toBe(req.requestId);
    expect(next).toHaveBeenCalledOnce();
  });

  it('uses the first value when the header is an array', () => {
    const req: RequestWithId = { headers: { 'x-request-id': ['first', 'second'] } };
    const { res } = makeResponse();
    const next = vi.fn();

    requestIdMiddleware(req, res, next);

    expect(req.requestId).toBe('first');
  });
});
