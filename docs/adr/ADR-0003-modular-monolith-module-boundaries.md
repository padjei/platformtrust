# ADR-0003 — Modular Monolith Module and Dependency Boundaries

## Status

Proposed — 2026-08-08. Authored under PT-002 as a proposal for architecture
review; NOT yet Accepted. Proposed ADRs are non-authoritative until approved by
the designated PlatformTrust engineering/architecture authority. An
implementation agent (Claude) authored this proposal but MUST NOT self-declare
it approved; approval happens later during human review through the
`needs-architecture-review` gate.

(Status vocabulary: Proposed | Accepted | Superseded | Rejected.)

## Context

[ADR-0002](docs/adr/ADR-0002-initial-application-technology-stack.md) established
the TypeScript backend as a **modular monolith**: `apps/api` (NestJS) is the
authoritative HTTP/API process and `apps/worker` (NestJS standalone) runs
background execution, with the AI service kept as a separate Python process.
[ADR-0001](docs/adr/ADR-0001-use-platformtrust-monorepo.md) established the
monorepo and the rule that applications are independently deployable but MUST NOT
import one another's source; shared code flows one direction (apps depend on
`packages/*`, never the reverse), enforced by
[`scripts/check-app-boundaries.mjs`](scripts/check-app-boundaries.mjs).

What is not yet written down as an architectural decision is **how domain logic
is organized inside and across the TypeScript backend**, and what dependency
rules keep the modular monolith from decaying into either an unstructured
monolith or a premature distributed system. `CLAUDE.md` ("Architecture Rules")
and [`.claude/rules/architecture.md`](.claude/rules/architecture.md) already
require clear module boundaries, one-directional dependencies, and a thin
service/interface layer, but those are engineering standards; the structural
rules that shape how future domain work is decomposed warrant an ADR because they
touch service boundaries and are difficult to reverse once code accretes
(Handbook [§10.1](docs/handbook/ENGINEERING_HANDBOOK.md)).

This ADR proposes those rules **without inventing product-domain modules**. It
does not name or design any specific business domain (readiness, connectors,
monitoring, etc.); those are defined by their own issues. It defines the
boundary discipline that any such module must follow. This is consistent with the
Constitution's requirement that PlatformTrust remain "one coherent product"
([Article IX](docs/constitution/PLATFORMTRUST_CONSTITUTION.md)), that internal
service interfaces be treated as contracts
([Article VIII](docs/constitution/PLATFORMTRUST_CONSTITUTION.md)), and that every
capability have a clear owner
([Article XXIII](docs/constitution/PLATFORMTRUST_CONSTITUTION.md)).

## Decision

Propose the following architectural rules for the TypeScript backend. These are a
proposal for review, not yet binding.

1. **`apps/api` is the authoritative HTTP/API process.** It is the single
   authoritative surface for synchronous, externally reachable behavior and for
   the versioned API contract (Constitution Article VIII). Business rules are
   invoked from, but do not exclusively live in, its controllers.

2. **`apps/worker` is asynchronous/background execution, not a second
   business-logic authority.** The worker performs background, scheduled, and
   deferred processing. It MUST NOT become a parallel or competing definition of
   domain rules. Where the API and worker both need the same rule, that rule lives
   in a shared module/service that both consume — it is not reimplemented in each.

3. **Domain logic lives behind explicit modules/services and is reusable.**
   Controllers (in the API) and jobs (in the worker) are thin entry points: they
   validate input, resolve authenticated tenant/actor context, delegate to a
   domain module through its interface, and serialize the result. They MUST NOT
   duplicate domain rules or reach into another module's internals. This mirrors
   [`.claude/rules/architecture.md`](.claude/rules/architecture.md) ("routers
   validate, delegate to services, and serialize responses").

4. **Applications do not import other applications.** No app imports another app's
   source, whether via `@platformtrust/<appname>`, an `apps/<other>/...` path, or
   a relative path that climbs into a sibling app. This is enforced by
   [`scripts/check-app-boundaries.mjs`](scripts/check-app-boundaries.mjs) and
   remains a required check.

5. **Shared packages (`packages/*`) have narrow, explicit ownership.** Each
   package under `packages/*` has a single, documented responsibility and a
   defined owner (Constitution
   [Article XXIII](docs/constitution/PLATFORMTRUST_CONSTITUTION.md); tracked via
   `CODEOWNERS`). Cross-application reuse happens only through these packages, per
   [ADR-0001](docs/adr/ADR-0001-use-platformtrust-monorepo.md). A package's public
   surface is its contract; consumers depend on that surface, not on its
   internals.

6. **`packages/shared` MUST NOT become a dumping ground for domain logic.** The
   shared package is reserved for genuinely cross-cutting, domain-neutral
   primitives (e.g. small utilities, common types, framework-agnostic helpers).
   Domain rules, domain models, and domain-specific behavior do not belong there;
   they belong in an owned domain module/package with a name that reflects its
   responsibility. When "shared" starts accumulating business meaning, that is a
   signal to extract a properly owned module instead.

7. **Dependency direction is explicit and acyclic.** Dependencies flow in one
   direction: apps depend on packages; packages may depend on lower-level
   packages; nothing depends back on an app. Circular dependencies between modules
   or packages are prohibited. If two modules appear to need each other, extract
   the shared concept into a lower-level module, or model the interaction as an
   event (see rule 8).

8. **Cross-domain interactions use public module interfaces; events are
   introduced only where justified.** By default, one module calls another through
   its published interface (a synchronous, typed contract). An event-driven
   interaction is introduced only where it is deliberately justified — and, when
   introduced, each event must satisfy Constitution
   [Article XXIV](docs/constitution/PLATFORMTRUST_CONSTITUTION.md) (defined
   ownership, versioned schema, tenant context, stable identifiers, timestamp and
   idempotency semantics, delivery guarantees, security classification, retention,
   and consumer documentation) and Handbook
   [§26](docs/handbook/ENGINEERING_HANDBOOK.md). **A general-purpose event bus /
   message broker is deferred**: this ADR does not adopt one and does not select a
   queue or messaging technology. Events must never be used to hide unclear
   ownership or unstructured business logic (Article XXIV).

9. **Microservices are not introduced without a future ADR.** The system remains a
   modular monolith (API + background worker) plus the already-separated AI
   service. Splitting a domain into an independently deployed service is a service
   boundary decision (Handbook [§10.1](docs/handbook/ENGINEERING_HANDBOOK.md)) and
   requires its own ADR with architecture approval; it is out of scope here.

These rules add structure to the existing standards; they do not weaken tenant
isolation, deny-by-default authorization, auditability, or the AI authority
boundary defined elsewhere in the ratified corpus.

## Alternatives Considered

1. **Microservices now (split domains into independently deployed services).**
   Rejected for now. It multiplies operational surface (deployment, networking,
   distributed failure modes, cross-service tenancy and auth propagation, tracing)
   before domain boundaries are even proven, and the ratified stack
   ([ADR-0002](docs/adr/ADR-0002-initial-application-technology-stack.md)) and
   `CLAUDE.md` explicitly call for a modular monolith at this phase. Distributed
   boundaries are hard to reverse. A future ADR may split a specific domain out
   once its boundary and load justify it (rule 9).

2. **An unstructured monolith (no module boundaries).** Rejected. Putting domain
   rules directly in controllers/jobs with no module/service layer leads to
   duplicated rules across the API and worker, tangled and cyclic dependencies,
   an ever-growing `packages/shared`, and unclear ownership — directly at odds
   with Constitution Articles [VIII](docs/constitution/PLATFORMTRUST_CONSTITUTION.md)
   (interfaces as contracts), [IX](docs/constitution/PLATFORMTRUST_CONSTITUTION.md)
   (one coherent product), and
   [XXIII](docs/constitution/PLATFORMTRUST_CONSTITUTION.md) (clear ownership). It
   also erodes testability and makes future extraction of any service far harder.

## Consequences

Positive:

- Domain rules have one home and are reused by both the API and the worker,
  preventing divergent behavior between synchronous and background paths.
- Explicit, acyclic, one-directional dependencies keep the module graph
  comprehensible and let `packages/*` boundaries and ownership hold.
- The system stays "one coherent product" while preserving a clean path to
  extract a service later, if and when a future ADR justifies it.
- Deferring an event bus avoids premature infrastructure while leaving a
  disciplined path (Article XXIV / Handbook §26) for events when justified.

Negative / trade-offs:

- Requires discipline and review to keep controllers/jobs thin and to resist
  adding domain logic to `packages/shared`; some of this is not yet
  machine-enforced beyond the cross-app import check.
- Routing all cross-domain interaction through published interfaces adds a small
  amount of indirection compared with reaching directly into another module.
- Teams occasionally must extract a shared lower-level module rather than take the
  quicker route of a circular dependency.

## Security Impact

- Keeping `apps/api` as the single authoritative synchronous surface preserves a
  clear place to enforce server-side authorization and tenant isolation; the
  worker consuming the same domain modules avoids a second, weaker enforcement
  path (Constitution Articles [I](docs/constitution/PLATFORMTRUST_CONSTITUTION.md),
  [IV](docs/constitution/PLATFORMTRUST_CONSTITUTION.md);
  [Secure Coding Standard](docs/standards/SECURE_CODING_STANDARD.md)).
- Narrow package ownership and one-directional dependencies reduce blast radius:
  a change or vulnerability in one module cannot silently reach unrelated modules
  through hidden back-edges (Constitution
  [Article XXIII](docs/constitution/PLATFORMTRUST_CONSTITUTION.md)).
- Any future event must carry a security classification and tenant context
  (Constitution [Article XXIV](docs/constitution/PLATFORMTRUST_CONSTITUTION.md))
  before it is introduced.
- This ADR does not change the AI authority boundary: no module may delegate
  pass/fail, authorization, compliance, or scoring decisions to an LLM
  ([`.claude/rules/ai-safety.md`](.claude/rules/ai-safety.md); Constitution
  Articles [X](docs/constitution/PLATFORMTRUST_CONSTITUTION.md),
  [XI](docs/constitution/PLATFORMTRUST_CONSTITUTION.md)).

## Operational Impact

- No new runtime, deployable, or infrastructure is introduced; this is an
  organizing decision for existing processes (`apps/api`, `apps/worker`,
  `packages/*`).
- The existing boundary check
  ([`scripts/check-app-boundaries.mjs`](scripts/check-app-boundaries.mjs))
  continues to run in CI; teams should treat the module and dependency rules above
  as review criteria, and may add further automated checks (e.g. dependency-cycle
  detection) in a later change.
- Each domain module and shared package needs a documented owner in `CODEOWNERS`
  (Constitution [Article XXIII](docs/constitution/PLATFORMTRUST_CONSTITUTION.md);
  Handbook [§25](docs/handbook/ENGINEERING_HANDBOOK.md) service ownership).

## Migration Impact

- Greenfield at this phase: no runtime or data migration. The rules apply to
  domain work as it is added under PT-002 and later issues.
- No existing ADR is superseded. This ADR refines how
  [ADR-0002](docs/adr/ADR-0002-initial-application-technology-stack.md)'s
  modular-monolith mandate is realized and stays within
  [ADR-0001](docs/adr/ADR-0001-use-platformtrust-monorepo.md)'s monorepo and
  package-boundary rules.
- Introducing an event bus, a messaging/queue technology, or splitting a domain
  into a separate service each remain **deferred to a future ADR** with
  architecture approval; nothing here authorizes them.

## References

- GitHub issue PT-002 §17.
- [ADR-0001 — Use a PlatformTrust Monorepo](docs/adr/ADR-0001-use-platformtrust-monorepo.md).
- [ADR-0002 — Initial Application Technology Stack](docs/adr/ADR-0002-initial-application-technology-stack.md).
- [`docs/constitution/PLATFORMTRUST_CONSTITUTION.md`](docs/constitution/PLATFORMTRUST_CONSTITUTION.md)
  — Article VIII (APIs are versioned contracts), Article IX (one coherent
  product), Article XXIII (domain ownership), Article XXIV (event-driven
  architecture must be deliberate).
- [`docs/handbook/ENGINEERING_HANDBOOK.md`](docs/handbook/ENGINEERING_HANDBOOK.md)
  — §5 (Repository Structure), §10 (Architecture Decision Records), §26
  (Background Jobs and Events).
- [`.claude/rules/architecture.md`](.claude/rules/architecture.md) — module
  boundaries and one-directional dependencies.
- [`scripts/check-app-boundaries.mjs`](scripts/check-app-boundaries.mjs) —
  cross-application import enforcement.
- [`CLAUDE.md`](CLAUDE.md) — Claude Code operating guide (approved application
  stack; app-boundary rule).
