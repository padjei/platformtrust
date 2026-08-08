# ADR-0004 — Runtime Configuration and Secret Boundary

## Status

Proposed — 2026-08-08. Authored under PT-002 as a proposal for architecture
review; NOT yet Accepted. Proposed ADRs are non-authoritative until approved by
the designated PlatformTrust engineering/architecture authority. An
implementation agent (Claude) authored this proposal but MUST NOT self-declare
it approved; approval happens later during human review through the
`needs-architecture-review` gate.

(Status vocabulary: Proposed | Accepted | Superseded | Rejected.)

## Context

PlatformTrust runs several processes — `apps/web`, `apps/api`, `apps/worker`,
and `apps/ai-service` — across multiple environments (local, dev, staging,
production). Each needs configuration, and some of that configuration is secret
(API keys, tokens, credentials, signing keys). The repository already reflects
early practice: [`.env.example`](.env.example) carries **non-secret** settings
only and states that secrets are loaded from the platform secret manager at
runtime, never from source control; the PT-001 applications already validate
their configuration at startup (the NestJS apps validate environment
configuration, and the FastAPI service uses typed settings).

What is not yet recorded as a decision is the **configuration architecture
itself**: where configuration comes from, how it is validated, where the boundary
between non-secret configuration and secrets sits, and what must happen when
required configuration is missing or invalid in production. The Constitution
requires that secrets never be committed to source control
([Article XIX](docs/constitution/PLATFORMTRUST_CONSTITUTION.md)), that
PlatformTrust prefer configuration over customer-specific code and remain one
coherent product ([Article IX](docs/constitution/PLATFORMTRUST_CONSTITUTION.md)),
and that all environments be treated as real systems that must not become
uncontrolled stores of production credentials
([Article XXX](docs/constitution/PLATFORMTRUST_CONSTITUTION.md)). The Engineering
Handbook [§22](docs/handbook/ENGINEERING_HANDBOOK.md) sets secret-management
requirements (approved secret manager, scoped by environment, rotated,
access-controlled, excluded from logs and source control, revocable, owned).

This ADR proposes a **provider-neutral** configuration and secret architecture.
It deliberately does **not** select a cloud provider, a secret-manager vendor, or
a specific configuration library; those selections remain deferred, consistent
with [ADR-0002](docs/adr/ADR-0002-initial-application-technology-stack.md) and
[`CLAUDE.md`](CLAUDE.md), which defer secret-management and cloud technology to a
future ADR.

## Decision

Propose the following configuration and secret-boundary architecture. These are a
proposal for review, not yet binding.

1. **Configuration is environment-supplied.** Applications read configuration from
   their runtime environment (environment variables and, where appropriate,
   environment-scoped configuration files) rather than from values hardcoded in
   application source. The same build artifact runs in every environment; only the
   supplied configuration differs.

2. **Applications validate configuration at startup and fail fast.** Each process
   validates its configuration into a typed, checked shape at startup. If required
   configuration is missing or invalid, the process fails to start with a clear,
   secret-free error rather than starting in a partially configured or unsafe
   state. This continues existing PT-001 practice — the NestJS applications
   (`apps/api`, `apps/worker`) validate environment configuration (e.g. with a
   schema validator such as Zod), and the FastAPI service (`apps/ai-service`) uses
   typed settings (e.g. `pydantic-settings`). Which validation library each
   runtime uses is an implementation detail of that runtime, not a cross-cutting
   selection made here.

3. **Non-secret configuration may use environment variables / config files.**
   Values that are not sensitive (ports, log levels, environment names, feature
   toggles, public endpoints) may be supplied via environment variables or
   environment-appropriate config files, and non-secret example values may live in
   [`.env.example`](.env.example). These are the only configuration values that
   may appear in source control.

4. **Secrets are supplied at runtime through an approved secret source, never
   source control.** Secret values are delivered to a process at runtime from an
   approved secret source and are never committed to the repository, embedded in
   images, or written into tickets or documentation (Constitution
   [Article XIX](docs/constitution/PLATFORMTRUST_CONSTITUTION.md); Handbook
   [§22](docs/handbook/ENGINEERING_HANDBOOK.md)). Secrets must be excluded from
   logs and error output (Handbook [§22](docs/handbook/ENGINEERING_HANDBOOK.md),
   [§23](docs/handbook/ENGINEERING_HANDBOOK.md);
   [Logging Standard](docs/standards/LOGGING_STANDARD.md)). The specific secret
   manager/vendor is **deferred** (see rule 9).

5. **Production must fail safely, never fall back to insecure development
   defaults.** In production, a missing or invalid secret or required setting is a
   startup failure, not a silent fallback to a development default, an empty
   credential, or a disabled security control. Development-only conveniences
   (permissive defaults, local stand-ins) must not be reachable in production
   configuration (Constitution [Article XXX](docs/constitution/PLATFORMTRUST_CONSTITUTION.md);
   [Article XVIII](docs/constitution/PLATFORMTRUST_CONSTITUTION.md) — reliability;
   [Article IV](docs/constitution/PLATFORMTRUST_CONSTITUTION.md) — deny by
   default).

6. **Configuration is typed and validated.** Configuration is parsed into an
   explicit, typed structure and validated at the boundary before use; code
   consumes the validated shape, not raw, unchecked environment lookups scattered
   through the codebase.

7. **Environment-specific values do not require source forks.** Differences
   between environments are expressed purely as different supplied configuration —
   not as branched, environment-specific code paths or per-environment builds.
   This keeps PlatformTrust "one coherent product" (Constitution
   [Article IX](docs/constitution/PLATFORMTRUST_CONSTITUTION.md)).

8. **Secrets must not reach browser/client code unless explicitly public.**
   Server-held secrets, credentials, and privileged tokens must never be shipped
   to the browser, the client bundle, or client-exposed configuration. In the
   Next.js web app, only values explicitly intended to be public may use the
   `NEXT_PUBLIC_*` prefix — `NEXT_PUBLIC_*` is public by definition and must never
   carry a secret. All privileged operations go through the server, which enforces
   authorization and tenant scope
   ([`.claude/rules/frontend.md`](.claude/rules/frontend.md); Constitution
   [Article III](docs/constitution/PLATFORMTRUST_CONSTITUTION.md)).

9. **Cloud and secret-manager vendor selection remains deferred.** This ADR
   defines requirements and a boundary; it does not choose a cloud provider, a
   secret-manager product, or a configuration library. A shared configuration
   contract may be organized in an owned package (for example `packages/config`)
   without that implying selection of any external vendor. Vendor selection is a
   future ADR with architecture approval.

## Alternatives Considered

1. **Checked-in environment files (committing `.env` / secret-bearing config to
   source control).** Rejected. It violates the Constitution's absolute rule that
   secrets never enter source control
   ([Article XIX](docs/constitution/PLATFORMTRUST_CONSTITUTION.md)) and Handbook
   [§22](docs/handbook/ENGINEERING_HANDBOOK.md); a committed secret must be treated
   as compromised and rotated. It also spreads production credentials into lower
   environments and history, contrary to
   [Article XXX](docs/constitution/PLATFORMTRUST_CONSTITUTION.md). Only non-secret
   example values ([`.env.example`](.env.example)) may be committed.

2. **Provider-specific configuration baked into application code.** Rejected.
   Hardcoding a specific cloud's or secret manager's SDK, endpoints, or
   configuration format into domain/application code couples PlatformTrust to a
   vendor, contradicts the deferral of cloud/secret-manager selection
   ([ADR-0002](docs/adr/ADR-0002-initial-application-technology-stack.md);
   [`CLAUDE.md`](CLAUDE.md)), and undermines the requirement to prefer
   configuration and stay one coherent, environment-portable product
   ([Article IX](docs/constitution/PLATFORMTRUST_CONSTITUTION.md)). Provider
   integration, when chosen, belongs behind a narrow, swappable boundary — not
   scattered through application logic.

## Consequences

Positive:

- A single, typed configuration path per process that fails fast on
  misconfiguration, reducing the chance of running in an unsafe or half-configured
  state.
- Secrets stay out of source control and out of the browser by construction; the
  non-secret/secret boundary is explicit.
- The same artifact runs across environments; environment differences are pure
  configuration, keeping the product coherent and portable.
- No premature lock-in: cloud and secret-manager choices stay open for a dedicated
  ADR.

Negative / trade-offs:

- Fail-fast startup means an incomplete or wrong production configuration prevents
  boot — correct behavior, but it demands accurate configuration and secret
  provisioning in each environment before deploy.
- Keeping the architecture vendor-neutral defers concrete secret-delivery
  mechanics to a later decision, so operational wiring (how secrets are injected
  at runtime) is finalized only when that ADR lands.
- Discipline is required to keep `NEXT_PUBLIC_*` free of anything sensitive and to
  route all secret use through the server.

## Security Impact

- Enforces the constitutional secret rule: secrets never in source control, never
  in logs, never in the client bundle (Constitution
  [Article XIX](docs/constitution/PLATFORMTRUST_CONSTITUTION.md); Handbook
  [§22](docs/handbook/ENGINEERING_HANDBOOK.md),
  [§23](docs/handbook/ENGINEERING_HANDBOOK.md);
  [Secure Coding Standard](docs/standards/SECURE_CODING_STANDARD.md)).
- Fail-safe production behavior prevents silently running with development
  defaults, empty credentials, or disabled controls (Constitution
  [Article IV](docs/constitution/PLATFORMTRUST_CONSTITUTION.md),
  [Article XXX](docs/constitution/PLATFORMTRUST_CONSTITUTION.md)).
- The browser boundary (rule 8) keeps privileged credentials server-side, so the
  UI cannot leak them and cannot be relied on for access control
  ([`.claude/rules/frontend.md`](.claude/rules/frontend.md); Constitution
  [Article III](docs/constitution/PLATFORMTRUST_CONSTITUTION.md)).
- Startup validation errors and runtime errors must remain secret-free and must
  not expose configuration values, credentials, or internal details (Handbook
  [§24](docs/handbook/ENGINEERING_HANDBOOK.md)).

## Operational Impact

- Each environment must supply a complete, valid configuration set (non-secret
  settings plus secrets from the approved source) before a process will start;
  deployment tooling and runbooks must account for fail-fast startup.
- Secrets, per Handbook [§22](docs/handbook/ENGINEERING_HANDBOOK.md), must be
  scoped by environment, rotated, access-controlled, revocable, and owned; the
  concrete mechanism is finalized in the deferred vendor ADR.
- Configuration keys and their meanings should be documented (and reflected in
  [`.env.example`](.env.example) for non-secret keys) so operators know what each
  environment requires (Constitution
  [Article XXI](docs/constitution/PLATFORMTRUST_CONSTITUTION.md)).
- No new runtime or vendor is introduced by this ADR; existing per-process startup
  validation continues.

## Migration Impact

- Greenfield at this phase: no runtime or data migration. Existing practice
  (non-secret [`.env.example`](.env.example); startup validation in the NestJS and
  FastAPI apps) already aligns with this proposal and needs no rework.
- No existing ADR is superseded. This ADR complements
  [ADR-0001](docs/adr/ADR-0001-use-platformtrust-monorepo.md) and
  [ADR-0002](docs/adr/ADR-0002-initial-application-technology-stack.md) and keeps
  their deferral of cloud and secret-management technology intact.
- Selecting a cloud provider, a secret-manager vendor, or a specific configuration
  library remains **deferred to a future ADR** with architecture approval; when
  that ADR lands, the runtime secret-delivery mechanism is wired behind the
  boundary defined here without changing application code broadly.

## References

- GitHub issue PT-002 §18.
- [ADR-0001 — Use a PlatformTrust Monorepo](docs/adr/ADR-0001-use-platformtrust-monorepo.md).
- [ADR-0002 — Initial Application Technology Stack](docs/adr/ADR-0002-initial-application-technology-stack.md).
- [`docs/constitution/PLATFORMTRUST_CONSTITUTION.md`](docs/constitution/PLATFORMTRUST_CONSTITUTION.md)
  — Article III (zero trust), Article IV (deny by default), Article IX
  (configuration over customer-specific code), Article XIX (secrets never in
  source control), Article XVIII (reliability), Article XXX (all environments are
  real systems).
- [`docs/handbook/ENGINEERING_HANDBOOK.md`](docs/handbook/ENGINEERING_HANDBOOK.md)
  — §22 (Secret Management), §23 (Logging Standards), §24 (Error Handling).
- [`docs/standards/SECURE_CODING_STANDARD.md`](docs/standards/SECURE_CODING_STANDARD.md),
  [`docs/standards/LOGGING_STANDARD.md`](docs/standards/LOGGING_STANDARD.md).
- [`.claude/rules/frontend.md`](.claude/rules/frontend.md) — no secrets in the
  browser or `NEXT_PUBLIC_*`.
- [`.env.example`](.env.example) — committed non-secret example configuration.
- [`CLAUDE.md`](CLAUDE.md) — deferral of secret-management and cloud technology.
