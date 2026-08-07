import { describe, expect, it } from 'vitest';

import {
  SERVICE_NAMES,
  SHARED_CONTRACT_VERSION,
  SHARED_PACKAGE_VERSION,
  assertDefined,
  chunk,
  err,
  isEmpty,
  isErr,
  isOk,
  ok,
  truncate,
  unique,
  type Result,
} from './index.js';

describe('constants', () => {
  it('exposes stable service names', () => {
    expect(SERVICE_NAMES.API).toBe('platformtrust-api');
    expect(SERVICE_NAMES.WEB).toBe('platformtrust-web');
    expect(SERVICE_NAMES.WORKER).toBe('platformtrust-worker');
    expect(SERVICE_NAMES.AI_SERVICE).toBe('platformtrust-ai-service');
  });

  it('exposes version constants', () => {
    expect(SHARED_PACKAGE_VERSION).toBe('0.1.0');
    expect(SHARED_CONTRACT_VERSION).toBe(1);
  });
});

describe('Result', () => {
  it('constructs and narrows Ok', () => {
    const result: Result<number, string> = ok(42);
    expect(result.ok).toBe(true);
    expect(isOk(result)).toBe(true);
    expect(isErr(result)).toBe(false);
    if (isOk(result)) {
      expect(result.value).toBe(42);
    }
  });

  it('constructs and narrows Err', () => {
    const result: Result<number, string> = err('boom');
    expect(result.ok).toBe(false);
    expect(isErr(result)).toBe(true);
    expect(isOk(result)).toBe(false);
    if (isErr(result)) {
      expect(result.error).toBe('boom');
    }
  });
});

describe('isEmpty', () => {
  it('treats nullish and blank values as empty', () => {
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty(undefined)).toBe(true);
    expect(isEmpty('   ')).toBe(true);
    expect(isEmpty([])).toBe(true);
    expect(isEmpty({})).toBe(true);
  });

  it('treats populated values as non-empty', () => {
    expect(isEmpty('x')).toBe(false);
    expect(isEmpty([1])).toBe(false);
    expect(isEmpty({ a: 1 })).toBe(false);
    expect(isEmpty(0)).toBe(false);
    expect(isEmpty(false)).toBe(false);
  });
});

describe('chunk', () => {
  it('splits into ordered chunks', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('rejects a non-positive size', () => {
    expect(() => chunk([1], 0)).toThrow(RangeError);
  });
});

describe('unique', () => {
  it('removes duplicates preserving order', () => {
    expect(unique([3, 1, 3, 2, 1])).toEqual([3, 1, 2]);
  });
});

describe('truncate', () => {
  it('leaves short strings untouched', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates and appends an ellipsis within the limit', () => {
    const out = truncate('hello world', 8);
    expect(out).toBe('hello w…');
    expect(out.length).toBe(8);
  });
});

describe('assertDefined', () => {
  it('returns a defined value', () => {
    expect(assertDefined('x')).toBe('x');
  });

  it('throws on null or undefined', () => {
    expect(() => assertDefined(null)).toThrow();
    expect(() => assertDefined(undefined, 'nope')).toThrow('nope');
  });
});
