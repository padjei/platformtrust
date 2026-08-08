# Error Handling Standard

| Attribute        | Value                                                                     |
| ---------------- | ------------------------------------------------------------------------- |
| Document owner   | PlatformTrust Engineering                                                  |
| Approver         | Product and Engineering Leadership                                         |
| Classification   | Internal                                                                   |
| Related issue    | PT-002 §9                                                                  |
| Applies to       | All PlatformTrust application, worker, AI-service, and package code        |

---

## 1. Purpose

This standard defines how PlatformTrust code raises, propagates, translates, and
reports errors so that failures are explicit, traceable for operators, and safe
for users. It gives reviewers concrete rules to check against a diff.

It operationalizes the Handbook's error-handling requirements
([§24](../handbook/ENGINEERING_HANDBOOK.md#24-error-handling)) and the
Constitution's requirements for auditability, observability, and safe failure
([Article II](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-ii--every-significant-action-must-be-auditable),
[Article XVII](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-xvii--everything-must-be-observable),
[Article XVIII](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-xviii--reliability-is-a-product-feature)).

## 2. Scope

This standard applies to all first-party code:

- `apps/web`, `apps/api`, `apps/worker` (TypeScript / NestJS / Next.js).
- `apps/ai-service` (Python 3.12 / FastAPI).
- `packages/*` shared libraries.

It covers error structure, the public/internal split, error categorization,
traceability, retryability, and AI/provider failure behavior. It does **not**
redesign the existing PT-001 health endpoints (`web GET /health`,
`api GET /api/v1/health`, `ai-service GET /api/v1/health`, and the worker's
internal health-state function); it documents error behavior only to keep those
and future endpoints consistent.

## 3. Mandatory requirements

### 3.1 Errors are explicit and structured

- Failures MUST be represented as explicit, typed errors (domain exceptions in
  TypeScript and Python), not by returning `null`, magic sentinels, or a success
  status for a failed operation.
- Every service's error responses MUST use a consistent, structured shape across
  the platform ([Handbook §24](../handbook/ENGINEERING_HANDBOOK.md#24-error-handling)).
  A response body SHOULD include a stable machine-readable `code`, a
  human-readable `message` safe for clients, and a request/correlation
  identifier.
- Error handling MUST NOT return HTTP `200` (or an equivalent success signal) for
  a failed operation.

### 3.2 Public errors do not leak internal detail

- Public error responses MUST NOT contain stack traces, database queries or
  schema, internal hostnames, file paths, secrets, provider credentials, or
  sensitive system configuration
  ([Handbook §24](../handbook/ENGINEERING_HANDBOOK.md#24-error-handling);
  [`SECURE_CODING_STANDARD.md`](./SECURE_CODING_STANDARD.md)).
- Raw production stack traces MUST NOT be returned to clients under any
  environment flag reachable in production.
- Public messages MUST be safe for the least-privileged caller and MUST NOT
  reveal the existence of resources the caller is not authorized to see (prefer a
  not-found or generic response over confirming a protected resource exists).

### 3.3 Internal errors retain traceability

- Every request and background job MUST carry a request/correlation identifier,
  and that identifier MUST be attached to both the internal log record and the
  client-facing error response so a report can be traced end to end
  ([Article XVII](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-xvii--everything-must-be-observable);
  [Handbook §23](../handbook/ENGINEERING_HANDBOOK.md#23-logging-standards)). The
  `apps/api` request/correlation-ID middleware (per
  [ADR-0002](../adr/ADR-0002-initial-application-technology-stack.md)) is the
  reference pattern.
- Internal logs MAY contain diagnostic detail only when safe, and MUST NOT
  contain secrets or unnecessary sensitive data
  ([Handbook §23](../handbook/ENGINEERING_HANDBOOK.md#23-logging-standards)).
- Security-relevant failures (for example authorization denials) MUST be
  auditable per
  [Article II](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-ii--every-significant-action-must-be-auditable)
  and [`SECURE_CODING_STANDARD.md`](./SECURE_CODING_STANDARD.md).

### 3.4 Error categories are distinguishable

Errors MUST be categorized so that callers and operators can distinguish them.
Each category below MUST be represented distinctly (distinct type and/or `code`),
and SHOULD map to the indicated HTTP status where an HTTP boundary applies.

| Category            | Meaning                                          | Typical HTTP |
| ------------------- | ------------------------------------------------ | ------------ |
| Validation          | Input failed schema or constraint checks         | 400 / 422    |
| Authentication      | Caller identity is missing or invalid            | 401          |
| Authorization       | Caller is authenticated but not permitted         | 403          |
| Not found           | Resource does not exist or is not visible         | 404          |
| Conflict            | State conflict (for example a duplicate)          | 409          |
| Rate limit          | Caller exceeded an allowed rate                   | 429          |
| Dependency          | An upstream/downstream dependency failed          | 502 / 503    |
| Internal            | Unexpected server fault                           | 500          |

- Validation errors MUST be distinguishable from authorization, not-found,
  conflict, rate-limit, dependency, and internal errors — not collapsed into a
  single generic failure.
- Authorization errors MUST NOT be reported in a way that leaks whether a
  protected resource exists (see [§3.2](#32-public-errors-do-not-leak-internal-detail)).

### 3.5 Errors are never swallowed

- Caught errors MUST be handled, rethrown, or translated to a typed error; they
  MUST NOT be silently discarded.
- An empty catch block, or a catch that only suppresses an error without handling
  or structured logging, is prohibited.
- Where an error is caught and not rethrown, the handler MUST record it with
  structured context at an appropriate severity
  ([Handbook §23](../handbook/ENGINEERING_HANDBOOK.md#23-logging-standards)).

### 3.6 Retryable versus non-retryable

- Where retries are possible, errors MUST be classified as retryable or
  non-retryable so callers and jobs can decide safely
  ([Article XVIII](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-xviii--reliability-is-a-product-feature);
  [Handbook §26](../handbook/ENGINEERING_HANDBOOK.md#26-background-jobs-and-events)).
- Retryable operations MUST be idempotent or guarded by an idempotency key so a
  retry cannot cause duplicate effects.
- Non-retryable errors (for example validation and authorization) MUST NOT be
  retried automatically.
- Retrying dependency failures SHOULD use bounded retries with backoff and MUST
  NOT retry indefinitely.

### 3.7 AI and provider errors fail safely

- AI-service and model-provider failures, low-confidence output, missing
  evidence, or guardrail violations MUST fail safely: the platform MUST NOT
  present the output as authoritative, MUST preserve the underlying workflow, MUST
  clearly communicate the limitation, and MUST record the failure
  ([Article XIII](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-xiii--ai-must-fail-safely)).
- A failed or unvalidated AI response MUST NOT drive pass/fail, authorization,
  compliance status, or scoring; those remain deterministic and/or human
  decisions. Detailed AI failure and schema-validation behavior is governed by
  [`AI_ENGINEERING_STANDARD.md`](./AI_ENGINEERING_STANDARD.md).

## 4. Prohibited practices

- MUST NOT return raw stack traces, database queries, internal hostnames,
  secrets, credentials, or system configuration to clients.
- MUST NOT return a success status for a failed operation.
- MUST NOT silently swallow errors or use empty catch blocks.
- MUST NOT collapse distinct error categories into one indistinguishable error.
- MUST NOT confirm the existence of a protected resource through an
  authorization/not-found response.
- MUST NOT auto-retry non-retryable errors or retry non-idempotent effects
  without an idempotency guard.
- MUST NOT present failed or unvalidated AI output as authoritative.
- MUST NOT redesign the existing PT-001 health endpoints under this standard.

## 5. Examples

### 5.1 Centralized exception mapping (TypeScript / NestJS, provider-neutral)

```ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

// Provider-neutral: maps typed errors to a consistent public shape,
// logs with the correlation id, and never leaks internal detail.
@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppExceptionFilter.name);

  catch(error: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const requestId: string = request.requestId ?? 'unknown';

    const status =
      error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const code = error instanceof HttpException ? error.name : 'INTERNAL_ERROR';

    // Full detail goes to internal logs only, tied to the correlation id.
    this.logger.error({ requestId, code, err: error });

    // Public body carries no stack trace, query, host, or secret.
    response.status(status).json({
      error: {
        code,
        message: status >= 500 ? 'An internal error occurred.' : (error as Error).message,
        requestId,
      },
    });
  }
}
```

### 5.2 Structured error responses (Python / FastAPI, provider-neutral)

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()


class DomainError(Exception):
    def __init__(self, code: str, message: str, status_code: int) -> None:
        self.code = code
        self.message = message
        self.status_code = status_code


@app.exception_handler(DomainError)
async def handle_domain_error(request: Request, exc: DomainError) -> JSONResponse:
    request_id = request.headers.get("x-request-id", "unknown")
    # Internal detail is logged elsewhere; the response leaks nothing sensitive.
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.code, "message": exc.message, "requestId": request_id}},
    )
```

### 5.3 Distinct categories, not a generic failure (Python)

```python
class ValidationError(DomainError):
    def __init__(self, message: str) -> None:
        super().__init__("VALIDATION_ERROR", message, status_code=422)


class AuthorizationError(DomainError):
    def __init__(self) -> None:
        # Generic message: does not confirm the resource exists.
        super().__init__("FORBIDDEN", "You do not have access.", status_code=403)
```

## 6. Enforcement mechanisms

- **CI (`.github/workflows/ci.yml`):** `pnpm lint`, `pnpm typecheck`,
  `pnpm test`, `pnpm build`, and `node scripts/check-app-boundaries.mjs`; for
  `apps/ai-service`, `uv run ruff check .`, `uv run mypy .`, and
  `uv run pytest`. Lint rules flag empty catch blocks and unhandled rejections.
- **TypeScript strict mode** (`tsconfig.base.json`, including
  `useUnknownInCatchVariables`) forces explicit handling of caught values.
- **Tests** MUST cover failure paths and category mapping per
  [`TESTING_STANDARD.md`](./TESTING_STANDARD.md); authorization-denial responses
  MUST be asserted not to leak resource existence.
- **Pull request review** using `.github/pull_request_template.md` — reviewers
  MUST confirm error handling is explicit and leaks no internal detail
  ([Handbook §13](../handbook/ENGINEERING_HANDBOOK.md#13-pull-request-standards),
  [§24](../handbook/ENGINEERING_HANDBOOK.md#24-error-handling)).

## 7. Exception process

Exceptions MUST follow the no-silent-exceptions rule in
[Constitution §6](../constitution/PLATFORMTRUST_CONSTITUTION.md#6-exception-process):
explicit, temporary, documented, with the rule affected, justification, security
and compliance impact, compensating controls, owner, approver, expiration, and
remediation plan. Silent exceptions are prohibited.

## 8. Related Constitution articles

- [Article II — Auditability](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-ii--every-significant-action-must-be-auditable)
- [Article XIII — AI Must Fail Safely](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-xiii--ai-must-fail-safely)
- [Article XVII — Everything Must Be Observable](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-xvii--everything-must-be-observable)
- [Article XVIII — Reliability Is a Product Feature](../constitution/PLATFORMTRUST_CONSTITUTION.md#article-xviii--reliability-is-a-product-feature)

## 9. Related Handbook sections

- [§24 — Error Handling](../handbook/ENGINEERING_HANDBOOK.md#24-error-handling)
- [§23 — Logging Standards](../handbook/ENGINEERING_HANDBOOK.md#23-logging-standards)
- [§25 — Observability](../handbook/ENGINEERING_HANDBOOK.md#25-observability)
- [§26 — Background Jobs and Events](../handbook/ENGINEERING_HANDBOOK.md#26-background-jobs-and-events)
- [§16 — API Standards](../handbook/ENGINEERING_HANDBOOK.md#16-api-standards)

## 10. Related standards and ADRs

- [`SECURE_CODING_STANDARD.md`](./SECURE_CODING_STANDARD.md)
- [`TESTING_STANDARD.md`](./TESTING_STANDARD.md)
- [`AI_ENGINEERING_STANDARD.md`](./AI_ENGINEERING_STANDARD.md)
- [ADR-0002 — Initial Application Technology Stack](../adr/ADR-0002-initial-application-technology-stack.md)
</content>
