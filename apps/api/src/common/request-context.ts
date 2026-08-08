/**
 * Minimal structural types for the HTTP request/response objects the app
 * touches. Using structural types (rather than importing the full Express
 * type surface) keeps the dependency footprint small while remaining
 * compatible with the concrete Express objects Nest provides at runtime.
 */

/** Header for propagating a correlation / request id across services. */
export const REQUEST_ID_HEADER = 'x-request-id';

/** Incoming request augmented with a resolved correlation id. */
export interface RequestWithId {
  headers: Record<string, string | string[] | undefined>;
  requestId?: string;
}

/** Outgoing response surface used by the request-id middleware. */
export interface HeaderSettableResponse {
  setHeader(name: string, value: string): void;
}

/** Outgoing response surface used by the exception filter. */
export interface JsonResponse {
  status(code: number): JsonResponse;
  json(body: unknown): void;
}

/** Express-compatible `next` callback. */
export type NextFunction = (error?: unknown) => void;
