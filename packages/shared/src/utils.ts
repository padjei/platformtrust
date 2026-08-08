/**
 * Small, pure, generic utility functions. Everything here must be:
 *  - deterministic (no wall-clock, randomness, or I/O),
 *  - free of any business/domain logic,
 *  - fully typed with no `any`.
 */

/**
 * Return `true` for `null`, `undefined`, empty/whitespace-only strings, empty
 * arrays, and objects with no own enumerable keys. Numbers, booleans, and
 * non-empty values are considered non-empty.
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === 'string') {
    return value.trim().length === 0;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>).length === 0;
  }
  return false;
}

/**
 * Split an array into consecutive chunks of at most `size` elements, preserving
 * order. Throws if `size` is not a positive integer.
 */
export function chunk<T>(items: readonly T[], size: number): T[][] {
  if (!Number.isInteger(size) || size <= 0) {
    throw new RangeError('chunk size must be a positive integer');
  }
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

/**
 * Return a new array with duplicate values removed, preserving first-seen order.
 * Equality is determined via `SameValueZero` (the same semantics as `Set`).
 */
export function unique<T>(items: readonly T[]): T[] {
  return [...new Set(items)];
}

/**
 * Ensure a string does not exceed `maxLength` characters. Longer strings are
 * truncated and suffixed with `ellipsis` (default `…`) so the total length never
 * exceeds `maxLength`. Throws if `maxLength` is negative.
 */
export function truncate(value: string, maxLength: number, ellipsis = '…'): string {
  if (!Number.isInteger(maxLength) || maxLength < 0) {
    throw new RangeError('maxLength must be a non-negative integer');
  }
  if (value.length <= maxLength) {
    return value;
  }
  if (ellipsis.length >= maxLength) {
    return value.slice(0, maxLength);
  }
  return value.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Assert that a value is not `null` or `undefined`, returning it narrowed to its
 * non-nullable type. Intended for exhaustiveness/invariant checks.
 */
export function assertDefined<T>(value: T | null | undefined, message?: string): T {
  if (value === null || value === undefined) {
    throw new Error(message ?? 'Expected value to be defined');
  }
  return value;
}
