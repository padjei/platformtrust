# Python Standard

| Attribute        | Value                                                       |
| ---------------- | ----------------------------------------------------------- |
| Document owner   | PlatformTrust Engineering                                   |
| Applies to       | All Python in `apps/ai-service` and any Python tooling      |
| Source issue     | PT-002 §4                                                    |
| Precedence       | Below the Constitution, ADRs, security requirements, and the Handbook |

---

## 1. Purpose

This standard defines the concrete Python rules for PlatformTrust. It builds on the
repository-wide [Coding Standard](./CODING_STANDARD.md) and the toolchain already
committed for the AI service (Ruff, MyPy strict, Pytest, managed by `uv`), turning
them into review-checkable requirements. It exists so that the separate AI service —
the only Python deployable — is type-safe, validated at its boundaries, and safe to
fail (ADR-0002; Constitution Article XIII).

## 2. Scope

This standard applies to all `.py` files under `apps/ai-service` and any other
first-party Python tooling in the repository. It complements, and MUST NOT weaken,
the Coding Standard. It does not select or name an AI model, AI provider, embedding
model, vector store, persistence library, or secret manager — those remain deferred
to future ADRs. It does not define product behavior, prompts, or AI authority;
those are owned per Constitution §3.3. Per ADR-0002 and the ESLint ignore list,
Python is linted and formatted by Ruff, never by ESLint.

## 3. Mandatory requirements

### 3.1 Language baseline and typing

- Production code MUST target Python 3.12 and MUST NOT rely on features or syntax
  unavailable in 3.12 (ADR-0002).
- All production functions, methods, and module-level values MUST carry full type
  annotations. `uv run mypy .` in strict mode MUST pass with no new errors.
- `typing.Any` MUST NOT be used to paper over a real type problem, and untyped
  `dict` values MUST NOT be used as data-transfer objects. `# type: ignore` and
  Ruff `# noqa` MUST NOT be used to hide genuine type or lint failures; where a
  suppression is unavoidable it MUST be specific (name the rule) and carry an inline
  reason.
- Untrusted or not-yet-narrowed values SHOULD be typed as `object` and narrowed, or
  validated into a typed model, before use.

### 3.2 Lint and format

- `uv run ruff check .` and `uv run ruff format --check .` MUST pass. Ruff is the
  single source of truth for Python lint and formatting; formatting MUST NOT be
  hand-adjusted against it.
- Unused imports, variables, and arguments MUST be removed (Ruff enforces this);
  intentionally unused arguments MUST be named with a leading underscore.

### 3.3 Validation at boundaries

- All external and untrusted structured input — HTTP request bodies, query and path
  parameters, connector payloads, events, environment configuration, and parsed
  JSON — MUST be validated at the boundary using typed models (Pydantic) before it
  enters domain logic (Constitution Articles III, V; Handbook §15).
- Request and response bodies for FastAPI endpoints MUST be declared as explicit
  typed models; unknown/extra fields SHOULD be rejected where appropriate.
- Tenant identifiers MUST be derived from the authenticated context, never accepted
  from a request body, query, or header (Constitution Article I).

### 3.4 Error handling

- A bare `except:` MUST NOT be used. `except Exception` MUST NOT be used without
  explicitly handling, rethrowing with context, or logging with a stated rationale;
  it MUST NOT silently swallow the error (Constitution Article V; Handbook §24).
- Exceptions SHOULD be typed/domain-specific and mapped to safe responses centrally;
  responses to clients MUST NOT leak stack traces, internal configuration, secrets,
  or provider details (Handbook §24).
- Re-raising MUST preserve the cause (`raise NewError(...) from err`).

### 3.5 Function safety and state

- Mutable default arguments MUST NOT be used (for example, `def f(x: list = [])`);
  use `None` and construct inside the function.
- Global mutable state MUST be avoided; shared collaborators MUST be passed
  explicitly or provided through dependency injection (Handbook §15).
- Code MUST be structured for testability: dependencies (clients, stores, model
  adapters, clocks, randomness) MUST be injected rather than constructed inline, so
  they can be substituted in tests (Constitution Article XVI).

### 3.6 Async and FastAPI

- FastAPI route handlers and any I/O-bound code MUST use `async`/`await`
  consistently and MUST NOT block the event loop with synchronous I/O; offload
  unavoidable blocking work appropriately.
- Resources (clients, sessions, connections) MUST be scoped and released
  deterministically (context managers or FastAPI dependencies); they MUST NOT be
  leaked across requests.
- Health and readiness behavior MUST expose no secrets, credentials, host details,
  or stack traces (Constitution Article XVII; ADR-0002; Handbook §25).

### 3.7 Provider neutrality and AI safety

- Model-specific, provider-specific, or vendor-specific code MUST sit behind an
  adapter interface; domain code MUST depend on the interface, not a concrete
  provider. No AI model, AI provider, embedding model, vector store, or persistence
  library is approved by this standard; each is deferred to a future ADR and MUST
  NOT be assumed by name in shared or domain code (ADR-0002; Constitution Article
  XII).
- AI output MUST be treated as untrusted: machine-readable AI output MUST conform to
  an explicit schema and be validated before any downstream use, and the service
  MUST fail closed if validation fails (Constitution Articles X, XIII; Handbook
  §27). AI output MUST NOT be `eval`'d or executed, and MUST NOT determine pass/fail,
  authorization, compliance status, or final scores (Constitution Article XI).
- Secrets, credentials, and customer PII MUST NOT be written to source, logs, test
  fixtures, or model prompts (Constitution Articles VI, XII, XIX; Handbook §22, §23).

### 3.8 Logging and testing

- Logs MUST be structured and MUST NOT contain secrets, tokens, PII, or raw
  sensitive prompt content (Constitution Article XVII; Handbook §23). Detailed rules
  are governed by the [Logging Standard](./LOGGING_STANDARD.md).
- New and changed behavior MUST ship with Pytest tests, and `uv run pytest` MUST
  pass (ADR-0002; Constitution Article XVI).
- Tests MUST be deterministic (control time and randomness), MUST use synthetic data
  with no secrets or real customer data, and MUST cover malformed/untrusted payloads
  and, for tenant-owned behavior, negative authorization and isolation cases
  (Handbook §19, §28, §29). Detailed testing rules are governed by the
  [Testing Standard](./TESTING_STANDARD.md).

## 4. Prohibited practices

- MUST NOT use `Any`, untyped `dict` DTOs, or blanket `# type: ignore` / `# noqa` to
  hide type or lint problems.
- MUST NOT use bare `except:` or swallow `except Exception` without handling,
  rethrow, or a logged rationale.
- MUST NOT use mutable default arguments.
- MUST NOT introduce global mutable state or construct injectable dependencies
  inline where it defeats testing.
- MUST NOT block the async event loop with synchronous I/O or leak sessions and
  connections.
- MUST NOT read `tenant_id` (or equivalent) from client input.
- MUST NOT name or assume a specific AI model, AI provider, embedding model, vector
  store, or persistence library in domain code — keep provider specifics behind
  adapters.
- MUST NOT trust, execute, or act on unvalidated AI output, or let it decide
  pass/fail, authorization, compliance, or scoring.
- MUST NOT log or embed secrets, tokens, PII, or sensitive prompt content.
- MUST NOT add new dependencies without Handbook §37 justification.

## 5. Examples

Validate untrusted input; no mutable default (illustrative):

```python
from pydantic import BaseModel, Field


class SummarizeRequest(BaseModel):
    evidence_ids: list[str] = Field(min_length=1)
    tenant_scoped: bool = True


def collect(ids: list[str] | None = None) -> list[str]:
    ids = ids if ids is not None else []  # not a mutable default arg
    return ids
```

Narrow exception handling with preserved cause and safe surface:

```python
import logging

logger = logging.getLogger(__name__)


class EvidenceParseError(Exception):
    """Raised when connector-supplied evidence fails validation."""


def parse_evidence(raw: object) -> SummarizeRequest:
    try:
        return SummarizeRequest.model_validate(raw)
    except ValueError as err:
        logger.warning("evidence.parse_failed")  # no payload, no PII
        raise EvidenceParseError("invalid evidence payload") from err
```

Provider behind an adapter; validate AI output before use:

```python
from typing import Protocol


class SummaryModel(Protocol):
    async def summarize(self, prompt: str) -> str: ...


async def summarize(model: SummaryModel, prompt: str) -> SummarizeRequest:
    raw = await model.summarize(prompt)
    # Fail closed: AI output is untrusted and must be schema-validated.
    return SummarizeRequest.model_validate_json(raw)
```

## 6. Enforcement mechanisms

- `uv run ruff check .` (lint) and `uv run ruff format --check .` (format).
- `uv run mypy .` (strict type checking).
- `uv run pytest` (tests).
- The AI service is excluded from ESLint per
  [`eslint.config.mjs`](../../eslint.config.mjs); Python quality gates run in CI
  alongside the TypeScript gates (ADR-0002).
- Husky + lint-staged pre-commit hooks and pull-request review (Handbook §13, §14).

## 7. Exception process

Deviations are never silent (Constitution §6). A necessary, specific suppression
MUST name its rule and reason inline; broader deviations MUST be documented with
rationale, compensating controls, owner, and an expiration or remediation plan, and
escalated. A material deviation — anything affecting security, authorization, tenant
isolation, data governance, or AI authority — MUST be captured in an ADR and
approved per Handbook §10 before merge.

## 8. Related Constitution articles

- Article I — Multi-tenancy; Article III — Zero Trust; Article IV — Deny by Default;
  Article V — Security Is a Product Requirement.
- Article X — Explainable AI; Article XI — Humans retain authority; Article XII —
  Customer data is not training data; Article XIII — AI must fail safely.
- Article XVI — Testability; Article XVII — Observability; Article XIX — secrets
  never in source; Article XXIII — Domain ownership.
- §2 Precedence; §3.3 agents may not invent product behavior; §6 Exception process.

See [PlatformTrust Constitution](../constitution/PLATFORMTRUST_CONSTITUTION.md).

## 9. Related Handbook sections

- §5 Repository Structure; §14 AI-generated code review; §15 Coding Standards;
  §23 Logging Standards; §24 Error Handling; §25 Observability; §27 Artificial
  Intelligence Engineering (AI output schemas); §28 Testing Strategy; §29 Test Data;
  §37 Dependency Management.

See [Engineering Handbook](../handbook/ENGINEERING_HANDBOOK.md),
[ADR-0001](../adr/ADR-0001-use-platformtrust-monorepo.md),
[ADR-0002](../adr/ADR-0002-initial-application-technology-stack.md), the
repository-wide [Coding Standard](./CODING_STANDARD.md), and the
[TypeScript Standard](./TYPESCRIPT_STANDARD.md).
