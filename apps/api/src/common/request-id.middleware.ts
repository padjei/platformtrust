import { randomUUID } from 'node:crypto';

import type { HeaderSettableResponse, NextFunction, RequestWithId } from './request-context';
import { REQUEST_ID_HEADER } from './request-context';

/**
 * Correlation-id middleware.
 *
 * Reads an inbound `x-request-id` header if present (otherwise generates a
 * UUID), attaches it to the request as `requestId`, and echoes it back on the
 * response so callers can correlate logs and errors across services.
 */
export function requestIdMiddleware(
  req: RequestWithId,
  res: HeaderSettableResponse,
  next: NextFunction,
): void {
  const incoming = req.headers[REQUEST_ID_HEADER];
  const headerValue = Array.isArray(incoming) ? incoming[0] : incoming;
  const requestId = headerValue && headerValue.length > 0 ? headerValue : randomUUID();

  req.requestId = requestId;
  res.setHeader(REQUEST_ID_HEADER, requestId);
  next();
}
