/**
 * @platformtrust/shared
 *
 * Domain-agnostic shared primitives for the PlatformTrust monorepo: service and
 * version constants, a generic `Result<T, E>` type with helpers, and small pure
 * utilities. This package intentionally contains NO business/domain logic and no
 * I/O — it is safe to depend on from any layer.
 */

export {
  SERVICE_NAMES,
  SHARED_PACKAGE_VERSION,
  SHARED_CONTRACT_VERSION,
  type ServiceName,
} from './constants.js';

export { ok, err, isOk, isErr, type Result, type Ok, type Err } from './result.js';

export { isEmpty, chunk, unique, truncate, assertDefined } from './utils.js';
