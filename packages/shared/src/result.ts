/**
 * A generic, domain-agnostic `Result` type for representing the outcome of an
 * operation that can succeed with a value of type `T` or fail with an error of
 * type `E`. This is a plain data structure — it encodes NO business rules and
 * makes NO decisions. Domain code decides what a success or failure means.
 */

/** Successful branch of a {@link Result}. */
export interface Ok<T> {
  readonly ok: true;
  readonly value: T;
}

/** Failure branch of a {@link Result}. */
export interface Err<E> {
  readonly ok: false;
  readonly error: E;
}

/**
 * Discriminated union representing either success (`Ok<T>`) or failure
 * (`Err<E>`). Narrow on the `ok` field to access `value` or `error` safely.
 */
export type Result<T, E> = Ok<T> | Err<E>;

/** Construct a successful {@link Result}. */
export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

/** Construct a failed {@link Result}. */
export function err<E>(error: E): Err<E> {
  return { ok: false, error };
}

/** Type guard: narrows a {@link Result} to its successful branch. */
export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.ok;
}

/** Type guard: narrows a {@link Result} to its failure branch. */
export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return !result.ok;
}
