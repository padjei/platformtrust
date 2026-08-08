# PlatformTrust Engineering Standards

This directory contains the mandatory engineering standards that apply across the
PlatformTrust repository. Each standard translates the
[Constitution](../constitution/PLATFORMTRUST_CONSTITUTION.md) and the
[Engineering Handbook](../handbook/ENGINEERING_HANDBOOK.md) into concrete,
reviewable rules and links back to the governing articles rather than restating
them. They apply to all contributors and coding agents (Constitution §3.3).

## The standards

| Standard                                             | Purpose                                                                            |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [Coding Standard](./CODING_STANDARD.md)              | Language-agnostic rules for clarity, boundaries, failure handling, and hygiene.     |
| [TypeScript Standard](./TYPESCRIPT_STANDARD.md)      | TypeScript-specific rules: strict typing, lint, and conventions.                    |
| [Python Standard](./PYTHON_STANDARD.md)              | Python-specific rules for the AI service: typing, Ruff, and MyPy.                   |
| [Secure Coding Standard](./SECURE_CODING_STANDARD.md)| Untrusted input, secrets, authorization, and safe error responses.                 |
| [Testing Standard](./TESTING_STANDARD.md)            | Test layers and coverage expectations, including tenancy and authorization tests.  |
| [Logging Standard](./LOGGING_STANDARD.md)            | Structured logging and what must never be logged.                                  |
| [Observability Standard](./OBSERVABILITY_STANDARD.md)| Logs, metrics, traces, health/readiness, and correlation identifiers.              |
| [Error Handling Standard](./ERROR_HANDLING_STANDARD.md)| Explicit, structured, safe error handling across services.                        |
| [Git Standard](./GIT_STANDARD.md)                    | Branching, Conventional Commits, and protected-branch rules.                       |
| [Pull Request Standard](./PULL_REQUEST_STANDARD.md)  | Pull request content, required checks, and review expectations.                     |
| [Documentation Standard](./DOCUMENTATION_STANDARD.md)| What documentation is required and how it stays current.                            |
| [Dependency Management](./DEPENDENCY_MANAGEMENT.md)  | Adding, justifying, scanning, and maintaining dependencies.                         |
| [Accessibility Standard](./ACCESSIBILITY_STANDARD.md)| WCAG 2.2 AA baseline for user-facing changes.                                       |
| [AI Engineering Standard](./AI_ENGINEERING_STANDARD.md)| Advisory AI, human authority, validated output, and tenant-safe retrieval.        |
| [Definition of Done](./DEFINITION_OF_DONE.md)        | The always-required and conditionally-required checklist for every change.          |

## Precedence

When requirements, instructions, preferences, or tool-generated suggestions
conflict, the following order of precedence applies (highest first), per
Constitution §2 and the PT-002 governing principles:

1. Applicable law and regulatory obligations.
2. The PlatformTrust Constitution.
3. Approved security and privacy requirements.
4. Accepted Architecture Decision Records.
5. The Engineering Handbook.
6. These engineering standards.
7. Approved Product Requirements Documents and epics.
8. Approved implementation tickets.
9. Implementation preferences and tool-generated suggestions.

A conflict MUST be surfaced and escalated, **not** silently resolved by an
implementation agent. An Architecture Decision Record whose status is **Proposed**
is a proposal only and is non-authoritative until it is **Accepted**.

## Enforcement

Standards are enforced through a mix of automation (formatting, static analysis,
type checking, tests, boundary checks, secret and dependency scanning) and process
(Git hooks, the pull request template, and human code, architecture, and security
review). Not every standard is automatically enforced today; some are process- or
future-enforced.

A standard without appropriate enforcement is tracked as a gap. The current
mapping of each standard to how it is enforced — and the known gaps — is in the
[Enforcement Matrix](./ENFORCEMENT_MATRIX.md).
