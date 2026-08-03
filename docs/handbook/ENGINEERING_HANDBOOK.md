# PlatformTrust Engineering Handbook

| Attribute        | Value                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| Document owner   | NISTA LLC / PlatformTrust Engineering                                                                       |
| Approver         | Founder and Product Owner                                                                                   |
| Classification   | Internal                                                                                                    |
| Status           | Approved                                                                                                    |
| Version          | 1.0                                                                                                         |
| Effective date   | 2026-08-03                                                                                                  |
| Last reviewed    | 2026-08-03                                                                                                  |
| Review frequency | Quarterly                                                                                                   |
| Applies to       | All PlatformTrust engineering, product delivery, infrastructure, security, data, AI, and release activities |

---

## 1. Purpose

The PlatformTrust Engineering Handbook defines how PlatformTrust is planned, designed, implemented, reviewed, tested, released, operated, and improved.

The PlatformTrust Constitution defines the platform's highest-level laws.

This Handbook defines the operating practices used to apply those laws.

The Handbook is intended for:

* Founders.
* Product owners.
* Product managers.
* Enterprise architects.
* Software engineers.
* Security engineers.
* Data engineers.
* AI engineers.
* DevOps and platform engineers.
* Quality engineers.
* Contractors.
* Coding agents.
* Future team members.

---

## 2. Engineering Mission

PlatformTrust engineering exists to build a secure, trustworthy, explainable, scalable, and maintainable enterprise platform.

Engineering decisions must balance:

* Customer value.
* Security.
* Reliability.
* Simplicity.
* Maintainability.
* Performance.
* Accessibility.
* Compliance.
* Delivery speed.
* Long-term product coherence.

Speed is valuable only when it does not create unmanaged risk or architectural instability.

---

## 3. Operating Model

## 3.1 Founder and Product Owner

The Founder and Product Owner owns:

* Vision.
* Product direction.
* Priorities.
* Target customers.
* Commercial positioning.
* Pricing.
* Customer commitments.
* Roadmap approval.
* Final product decisions.

The Product Owner does not need to prescribe implementation details unless a business or product requirement depends on them.

---

## 3.2 Product and Engineering Leadership

Product and engineering leadership owns:

* Product Requirements Documents.
* Epic decomposition.
* User stories.
* Acceptance criteria.
* System architecture.
* API contracts.
* Database design.
* Security architecture.
* AI architecture.
* User experience requirements.
* Sprint planning.
* Release planning.
* Technical risk.
* Engineering standards.
* Technical debt prioritization.

---

## 3.3 Implementation Engineers and Coding Agents

Implementation engineers and coding agents must:

* Follow the approved ticket.
* Follow the Constitution.
* Follow this Handbook.
* Follow approved standards and ADRs.
* Write production-quality code.
* Add required tests.
* Update documentation.
* Raise ambiguity.
* Raise security concerns.
* Avoid unauthorized product changes.

Implementation agents must not fill major product gaps through assumption.

Reasonable implementation discretion is allowed for low-risk details that do not change product behavior, security boundaries, data contracts, permissions, or architecture.

---

## 4. Sources of Truth

PlatformTrust uses the following sources of truth:

### GitHub Repository

The repository is authoritative for:

* Source code.
* Infrastructure code.
* Constitution.
* Engineering Handbook.
* Engineering standards.
* Architecture Decision Records.
* API specifications.
* Database documentation.
* Product documentation committed to the repository.
* Sprint records.
* Release notes.

### GitHub Issues

GitHub Issues are authoritative for:

* Implementation work.
* Bugs.
* Research tasks.
* Technical debt.
* Security work.
* Acceptance criteria.
* Implementation progress.

### GitHub Projects

GitHub Projects is authoritative for:

* Backlog.
* Priorities.
* Sprint assignment.
* Workflow status.
* Roadmap views.
* Release planning.
* Blockers.
* Work ownership.

### Pull Requests

Pull requests are authoritative for:

* Proposed code changes.
* Review discussion.
* Automated checks.
* Approval history.
* Linked implementation evidence.

Important decisions made in chat, meetings, or coding sessions must be transferred into the appropriate repository artifact.

---

## 5. Repository Structure

The target repository structure is:

```text
platformtrust/
├── .github/
├── apps/
│   ├── web/
│   ├── api/
│   ├── worker/
│   └── ai-service/
├── packages/
│   ├── ui/
│   ├── auth/
│   ├── database/
│   ├── sdk/
│   └── shared/
├── infrastructure/
│   ├── terraform/
│   ├── kubernetes/
│   └── github/
├── docs/
│   ├── constitution/
│   ├── handbook/
│   ├── vision/
│   ├── architecture/
│   ├── adr/
│   ├── security/
│   ├── api/
│   ├── database/
│   ├── ux/
│   ├── sprints/
│   ├── epics/
│   └── standards/
├── CLAUDE.md
└── README.md
```

New top-level directories require architecture approval.

---

## 6. Product Delivery Lifecycle

Every material feature follows the delivery lifecycle below.

### Stage 1 — Discovery

Discovery determines:

* The customer problem.
* The target user.
* The desired outcome.
* The business value.
* Constraints.
* Dependencies.
* Existing alternatives.
* Risks.
* Whether the feature should be built.

Discovery output may include research notes, problem statements, customer feedback, or prototypes.

---

### Stage 2 — Product Definition

Product definition produces:

* Product Requirements Document.
* Epic.
* Scope.
* Out-of-scope items.
* User stories.
* Acceptance criteria.
* Success metrics.
* Entitlement requirements.
* UX expectations.
* Audit expectations.
* Compliance expectations.

The feature must be understandable before implementation begins.

---

### Stage 3 — Architecture and Security Design

The design phase identifies:

* Service ownership.
* Data ownership.
* API contracts.
* Database changes.
* Tenant isolation.
* Authorization rules.
* Audit events.
* Integration boundaries.
* Failure modes.
* Observability.
* Threats.
* Performance requirements.
* AI risks.
* Migration needs.

Material decisions require an Architecture Decision Record.

---

### Stage 4 — Sprint Readiness

Work is Sprint Ready only when:

* Scope is approved.
* Acceptance criteria are testable.
* Dependencies are known.
* Security behavior is defined.
* UX behavior is sufficiently defined.
* API and database impacts are understood.
* The ticket can be implemented without inventing product behavior.
* Complexity is acceptable.
* The work is appropriately decomposed.

---

### Stage 5 — Implementation

Implementation includes:

* Code.
* Tests.
* Documentation.
* Database migrations.
* Telemetry.
* Audit events.
* Security controls.
* Feature flags where required.
* Deployment changes.
* Migration scripts where required.

---

### Stage 6 — Review

Review includes:

* Automated checks.
* Peer or architecture review.
* Security review where required.
* Product review where behavior changes.
* UX review where applicable.
* Documentation review.
* Migration review.

---

### Stage 7 — Quality Assurance

QA validates:

* Acceptance criteria.
* Regression behavior.
* Authorization.
* Tenant isolation.
* Error states.
* Accessibility.
* Performance.
* Browser or client compatibility.
* AI behavior where applicable.
* Audit events.
* Upgrade or migration behavior.

---

### Stage 8 — Release

Release requires:

* Approved pull requests.
* Passing deployment checks.
* Release notes.
* Migration readiness.
* Rollback plan.
* Monitoring readiness.
* Support awareness where applicable.
* Feature flag configuration.
* Required approvals.

---

### Stage 9 — Post-Release Validation

Post-release validation includes:

* Health checks.
* Error monitoring.
* Performance monitoring.
* Security monitoring.
* Customer-impact review.
* Migration verification.
* Usage verification.
* Feature flag verification.

---

## 7. Sprint Management

## 7.1 Cadence

PlatformTrust uses two-week iterations unless a different cadence is approved.

Each sprint has:

* A sprint goal.
* Defined scope.
* Assigned issues.
* Identified dependencies.
* Exit criteria.
* Sprint review.
* Retrospective.

---

## 7.2 Sprint Planning

Sprint planning must consider:

* Priority.
* Capacity.
* Complexity.
* Dependencies.
* Product readiness.
* Technical risk.
* Security risk.
* Carryover work.
* Operational work.
* Technical debt.

A sprint must not be overloaded solely to create the appearance of speed.

---

## 7.3 Work States

Standard workflow states are:

```text
Backlog
Discovery
Sprint Ready
In Progress
Code Review
QA
Ready for Release
Done
Blocked
Deferred
```

### Backlog

The work exists but is not ready for active implementation.

### Discovery

The problem, scope, requirements, or solution is being clarified.

### Sprint Ready

The work satisfies the Definition of Ready.

### In Progress

Implementation has begun.

### Code Review

A pull request is open and ready for review.

### QA

Implementation review is complete and acceptance testing is underway.

### Ready for Release

The work is approved but not yet released.

### Done

The work is released or otherwise completed according to the ticket.

### Blocked

Progress cannot continue because of a documented dependency or decision.

### Deferred

The work is intentionally postponed.

---

## 7.4 Definition of Ready

An issue is ready for implementation when it includes:

* Clear title.
* Business or technical objective.
* Background.
* In-scope behavior.
* Out-of-scope behavior.
* Acceptance criteria.
* Dependencies.
* Security considerations.
* Data considerations.
* API considerations where applicable.
* UX expectations where applicable.
* Audit requirements.
* Testing expectations.
* Definition of Done.
* Complexity estimate.
* Claude or engineer implementation instructions where applicable.

---

## 7.5 Sprint Scope Changes

Sprint scope may change when:

* A critical defect appears.
* A security issue requires urgent work.
* A dependency invalidates the original plan.
* Product leadership changes the priority.
* The original issue is materially larger than estimated.

Scope changes must be visible in GitHub Projects.

---

## 7.6 Sprint Review

The sprint review documents:

* Completed outcomes.
* Incomplete work.
* Demonstrated functionality.
* Defects discovered.
* Release status.
* Metrics.
* Product decisions.
* Follow-up work.

---

## 7.7 Retrospective

The retrospective identifies:

* What worked.
* What did not work.
* Root causes.
* Process improvements.
* Architecture concerns.
* Quality concerns.
* Technical debt created.
* Actions for the next sprint.

Retrospective actions must have owners.

---

## 8. Issue Standards

Every implementation issue should use a structure similar to:

```md
# PT-XXX — Issue Title

## Objective

## Background

## User Story

## In Scope

## Out of Scope

## Functional Requirements

## Non-Functional Requirements

## Authorization Requirements

## Tenant Isolation Requirements

## Audit Requirements

## API Requirements

## Database Requirements

## UX Requirements

## Observability Requirements

## Acceptance Criteria

## Testing Requirements

## Dependencies

## Risks

## Definition of Done

## Estimated Complexity

## Claude Implementation Prompt
```

Not every section is required for every small issue, but material requirements must not be omitted.

---

## 9. Epic Standards

Every epic should define:

* Epic identifier.
* Product objective.
* Problem statement.
* Target users.
* Business value.
* Scope.
* Out-of-scope behavior.
* Functional requirements.
* Non-functional requirements.
* Security requirements.
* Tenant behavior.
* Data impact.
* API impact.
* Audit requirements.
* UX impact.
* AI impact.
* Dependencies.
* Risks.
* Success metrics.
* Child issues.
* Release target.

Epics should represent outcomes, not vague categories.

---

## 10. Architecture Decision Records

## 10.1 When an ADR Is Required

An ADR is required for decisions involving:

* Service boundaries.
* Major framework selection.
* Database technology.
* Multi-tenancy model.
* Authentication architecture.
* Authorization model.
* Event architecture.
* Queue or messaging technology.
* Cloud provider strategy.
* AI provider strategy.
* Search architecture.
* Object storage.
* Deployment architecture.
* API versioning.
* Major build-versus-buy decisions.
* Changes that are difficult to reverse.

---

## 10.2 ADR Naming

```text
docs/adr/
├── ADR-0001-use-monorepo.md
├── ADR-0002-tenant-isolation-model.md
└── ADR-0003-api-versioning-strategy.md
```

---

## 10.3 ADR Template

```md
# ADR-XXXX — Decision Title

## Status

Proposed | Accepted | Superseded | Rejected

## Context

## Decision

## Alternatives Considered

## Consequences

## Security Impact

## Operational Impact

## Migration Impact

## References
```

ADR history must be preserved.

Superseded ADRs remain in the repository.

---

## 11. Branching Strategy

PlatformTrust uses short-lived branches and pull requests.

### Default Branch

```text
main
```

The `main` branch must remain deployable.

Direct pushes to `main` are prohibited.

---

### Branch Naming

Use:

```text
feature/PT-123-tenant-invitations
bugfix/PT-245-fix-audit-filter
security/PT-301-token-validation
docs/PT-102-api-standards
chore/PT-190-upgrade-dependencies
refactor/PT-211-auth-policy-engine
```

Branch names must include the related issue identifier where applicable.

---

### Branch Lifetime

Branches should be short-lived.

Long-running branches increase:

* Merge conflicts.
* Integration risk.
* Review complexity.
* Deployment risk.
* Hidden divergence.

Large work should be decomposed or protected through feature flags.

---

## 12. Commit Standards

Use Conventional Commit-style messages:

```text
feat(auth): add tenant invitation acceptance
fix(api): prevent cross-tenant evidence access
docs(architecture): document event ownership
test(worker): add duplicate-delivery coverage
refactor(database): centralize tenant query scope
chore(deps): upgrade validation library
security(auth): enforce token audience validation
```

Commits should:

* Represent coherent changes.
* Avoid unrelated modifications.
* Exclude secrets.
* Exclude generated noise unless required.
* Reference the issue where supported.

---

## 13. Pull Request Standards

Every change to protected branches must use a pull request.

A pull request must include:

* Summary.
* Linked issue.
* Changes made.
* Testing performed.
* Security impact.
* Database impact.
* API impact.
* UX impact.
* Screenshots where relevant.
* Migration steps.
* Rollback considerations.
* Documentation changes.
* Known limitations.

---

### Pull Request Size

Pull requests should be reviewable.

Large pull requests must be decomposed unless the change is inherently atomic.

A large pull request should include additional reviewer guidance.

---

### Required Checks

Required checks should include, where applicable:

* Formatting.
* Linting.
* Type checking.
* Unit tests.
* Integration tests.
* End-to-end tests.
* Build.
* Static security analysis.
* Dependency scanning.
* Secret scanning.
* Migration validation.
* Infrastructure validation.
* Accessibility tests.
* AI evaluation checks.

---

### Review Rules

Reviewers must evaluate:

* Correctness.
* Security.
* Authorization.
* Tenant isolation.
* Maintainability.
* Test quality.
* Error handling.
* Observability.
* Documentation.
* Architectural consistency.
* Performance.
* Accessibility.
* Data migration safety.

Approval must not be based only on whether the code compiles.

---

## 14. Code Review Guidance for AI-Generated Code

AI-generated code must be reviewed as untrusted implementation output.

Reviewers must verify:

* The code matches the ticket.
* No product behavior was invented.
* No security controls were removed.
* Tenant context is enforced.
* Authorization is explicit.
* Error handling is appropriate.
* Dependencies are approved.
* No secrets are introduced.
* Tests are meaningful.
* Comments and documentation are accurate.
* Generated code does not create unnecessary abstractions.
* Generated code follows repository conventions.

The fact that code was generated quickly does not reduce review requirements.

---

## 15. Coding Standards

Detailed language standards belong in `docs/standards`.

General rules include:

* Prefer clarity over cleverness.
* Use strong typing where supported.
* Validate external inputs.
* Keep functions focused.
* Use explicit names.
* Avoid hidden side effects.
* Avoid unnecessary abstraction.
* Avoid duplicated business logic.
* Keep authorization near the protected operation.
* Keep tenant context explicit.
* Use structured errors.
* Do not log secrets.
* Document non-obvious decisions.
* Remove dead code.
* Do not leave silent failure paths.
* Use dependency injection where it improves testability and boundaries.
* Avoid global mutable state.

---

## 16. API Standards

PlatformTrust APIs must:

* Use explicit versioning.
* Use documented resource models.
* Validate requests.
* Return consistent error structures.
* Use appropriate HTTP status codes.
* Enforce authentication and authorization.
* Resolve tenant context securely.
* Support pagination where lists may grow.
* Support idempotency where retries are expected.
* Emit correlation identifiers.
* Apply rate limits.
* Avoid exposing internal database details.
* Avoid leaking sensitive errors.
* Document deprecation.

Preferred path format:

```text
/api/v1/resources
```

---

## 17. Database and Migration Standards

All schema changes must use version-controlled migrations.

Migrations must account for:

* Forward migration.
* Rollback or roll-forward recovery.
* Existing data.
* Tenant isolation.
* Defaults.
* Nullability.
* Indexes.
* Constraints.
* Locking.
* Performance.
* Backward compatibility.
* Deployment order.

Destructive changes require explicit approval.

Application releases must not assume every database migration is instantaneous.

Where needed, use expand-and-contract migrations:

1. Add new schema.
2. Deploy compatible code.
3. Backfill data.
4. Switch usage.
5. Remove old schema in a later release.

---

## 18. Authentication and Authorization

Authentication establishes identity.

Authorization determines permitted actions.

They must not be treated as the same concern.

Authorization must consider, where applicable:

* Tenant.
* User.
* Role.
* Permission.
* Resource ownership.
* Resource state.
* Customer entitlement.
* Environment.
* Service identity.
* Policy conditions.

Authorization rules must be testable.

Sensitive actions should produce audit events.

Administrative access must be narrowly scoped.

---

## 19. Tenant Isolation Testing

Every tenant-owned feature must include negative tests.

Tests must verify that:

* Tenant A cannot read Tenant B data.
* Tenant A cannot modify Tenant B data.
* Tenant A cannot reference Tenant B identifiers.
* Tenant A cannot access Tenant B files.
* Background jobs do not cross tenants.
* Search results remain isolated.
* Caches do not leak data.
* AI retrieval remains isolated.
* Exports contain only authorized data.
* Administrative bypasses require explicit authority.

Positive tests alone are insufficient.

---

## 20. Security Engineering

Security work includes:

* Threat modeling.
* Secure design.
* Dependency management.
* Vulnerability scanning.
* Penetration testing.
* Secret management.
* Access review.
* Incident response.
* Secure defaults.
* Logging review.
* Abuse-case testing.
* Data classification.
* Supply-chain protection.

---

### Security Review Triggers

Security review is required for:

* Authentication changes.
* Authorization changes.
* Tenant-isolation changes.
* New external integrations.
* New public APIs.
* New AI providers.
* Sensitive data processing.
* File upload.
* Export functionality.
* Administrative tools.
* Cryptography.
* Secrets handling.
* Payment or billing functionality.
* High-impact automation.
* Customer-configurable code or scripts.

---

## 21. Threat Modeling

Threat models should identify:

* Assets.
* Actors.
* Trust boundaries.
* Entry points.
* Data flows.
* Abuse cases.
* Threats.
* Existing controls.
* Required controls.
* Residual risk.

Threat modeling should occur before implementation for high-risk features.

---

## 22. Secret Management

Secrets include:

* API keys.
* Tokens.
* Passwords.
* Certificates.
* Private keys.
* Database credentials.
* Signing keys.
* Webhook secrets.

Secrets must:

* Be stored in an approved secret manager.
* Be scoped by environment.
* Be rotated.
* Be access-controlled.
* Be excluded from logs.
* Be excluded from source control.
* Be excluded from tickets and documentation.
* Be revocable.
* Have identified owners.

A committed secret must be treated as compromised.

Deleting it from Git history is not sufficient; it must be rotated.

---

## 23. Logging Standards

Logs must be structured.

Recommended fields include:

* Timestamp.
* Severity.
* Service.
* Environment.
* Tenant identifier where approved.
* Actor identifier where approved.
* Request identifier.
* Correlation identifier.
* Trace identifier.
* Operation.
* Outcome.
* Error code.
* Duration.

Logs must not contain:

* Passwords.
* Access tokens.
* Refresh tokens.
* API secrets.
* Private keys.
* Full payment data.
* Sensitive document contents.
* Unnecessary personal data.
* Raw AI prompts containing sensitive customer information.

---

## 24. Error Handling

Errors must be:

* Explicit.
* Structured.
* Traceable.
* Safe for users.
* Useful for operators.
* Consistent across services.

Public error responses should not expose:

* Stack traces.
* Database queries.
* Internal hostnames.
* Secrets.
* Provider credentials.
* Sensitive system configuration.

Internal logs may contain diagnostic details only when safe.

---

## 25. Observability

Every production service should provide:

* Health endpoint.
* Readiness endpoint.
* Structured logs.
* Metrics.
* Distributed tracing.
* Error aggregation.
* Dependency monitoring.
* Alerting.
* Dashboarding.
* Service ownership.

Critical workflows should have business-level telemetry, not only infrastructure metrics.

Examples:

* Evidence collection success rate.
* Audit workflow completion.
* AI recommendation failure rate.
* Integration synchronization failures.
* Authorization-denial rate.
* Tenant provisioning duration.

---

## 26. Background Jobs and Events

Every job must define:

* Tenant context.
* Job type.
* Input schema.
* Idempotency key.
* Retry policy.
* Timeout.
* Failure behavior.
* Dead-letter behavior.
* Audit behavior.
* Progress reporting.
* Cancellation behavior where applicable.

Jobs must be safe under duplicate delivery.

Events must be versioned and documented.

Consumers must not assume exactly-once delivery unless the infrastructure explicitly guarantees it.

---

## 27. Artificial Intelligence Engineering

AI features must use approved:

* Providers.
* Models.
* Prompt templates.
* Retrieval sources.
* Guardrails.
* Evaluation datasets.
* Logging behavior.
* Privacy controls.
* Human-review rules.

---

### Prompt Management

Prompts must be:

* Version controlled.
* Named.
* Documented.
* Testable.
* Associated with expected output schemas.
* Evaluated before release.
* Traceable in production output where appropriate.

Prompts must not exist only inside provider dashboards or individual developer machines.

---

### Retrieval-Augmented Generation

RAG systems must define:

* Source ownership.
* Document ingestion.
* Tenant isolation.
* Chunking strategy.
* Metadata.
* Embedding model.
* Index ownership.
* Retrieval filters.
* Citation behavior.
* Freshness.
* Deletion propagation.
* Evaluation criteria.

Tenant filters must be enforced before or during retrieval.

Post-filtering mixed-tenant results is not acceptable.

---

### AI Evaluation

AI features must be evaluated for:

* Accuracy.
* Groundedness.
* Relevance.
* Citation quality.
* Hallucination.
* Refusal behavior.
* Bias.
* Safety.
* Latency.
* Cost.
* Tenant isolation.
* Prompt injection resistance.
* Regression across model changes.

Model changes require evaluation.

---

### AI Output Schemas

Structured AI outputs should use validated schemas.

Malformed or incomplete output must not be trusted.

Deterministic validation must occur before AI output is used by downstream systems.

---

### Human Approval

Human approval is required when AI output affects:

* Final compliance status.
* Risk acceptance.
* Audit findings.
* Customer-facing legal language.
* High-impact workflows.
* Destructive actions.
* Security decisions.
* Regulatory reporting.

---

## 28. Testing Strategy

PlatformTrust testing uses a layered approach.

### Unit Tests

Validate isolated behavior.

### Integration Tests

Validate collaboration between components, databases, queues, providers, and services.

### Contract Tests

Validate APIs and events between producers and consumers.

### End-to-End Tests

Validate critical user workflows.

### Security Tests

Validate authentication, authorization, tenant isolation, input handling, and abuse resistance.

### Accessibility Tests

Validate baseline automated and manual accessibility behavior.

### Performance Tests

Validate expected load, latency, throughput, and stability.

### AI Evaluations

Validate probabilistic behavior against approved datasets and thresholds.

---

## 29. Test Data

Test data must:

* Be synthetic where possible.
* Avoid real customer information.
* Represent multiple tenants.
* Include negative authorization scenarios.
* Include boundary values.
* Include failure scenarios.
* Be deterministic where required.
* Avoid embedded secrets.

Shared test environments must not rely on undocumented permanent state.

---

## 30. Feature Flags

Feature flags should be used for:

* Progressive rollout.
* Internal testing.
* Design partner access.
* Risk reduction.
* Controlled migration.
* Emergency disablement.

Feature flags must have:

* Owner.
* Purpose.
* Default state.
* Tenant behavior.
* Expiration or review date.
* Removal plan.
* Audit behavior where relevant.

Permanent business entitlements should not be implemented as unmanaged temporary flags.

---

## 31. Release Management

PlatformTrust releases should progress through:

```text
Development
Test
Staging
Production
```

Production releases require:

* Passing required checks.
* Approved pull request.
* Release notes.
* Migration validation.
* Security clearance for identified issues.
* Rollback or recovery plan.
* Monitoring readiness.
* Required approvals.

---

### Release Types

#### Patch Release

Bug fixes and low-risk compatible changes.

#### Minor Release

Backward-compatible features and improvements.

#### Major Release

Breaking changes or major product transitions.

Semantic versioning should be used for published packages and supported APIs where appropriate.

---

## 32. Rollback and Recovery

Every material release must consider:

* Code rollback.
* Database compatibility.
* Feature flag disablement.
* Queue behavior.
* Event compatibility.
* AI provider fallback.
* Customer data integrity.
* Partial rollout.
* Cache invalidation.
* Configuration recovery.

A rollback plan that corrupts or abandons customer data is not acceptable.

---

## 33. Incident Management

An incident is an event that materially affects:

* Availability.
* Security.
* Data integrity.
* Tenant isolation.
* Customer operations.
* Compliance.
* Critical integrations.
* AI safety.
* Platform reputation.

---

### Incident Severity

#### SEV-1 — Critical

Examples:

* Active cross-tenant data exposure.
* Major production outage.
* Confirmed compromise.
* Widespread data corruption.
* Critical regulatory impact.

#### SEV-2 — High

Examples:

* Significant degradation.
* High-impact security weakness.
* Major integration failure.
* Loss of a critical capability.

#### SEV-3 — Medium

Examples:

* Limited customer impact.
* Workaround available.
* Non-critical service impairment.

#### SEV-4 — Low

Examples:

* Minor defect.
* Cosmetic issue.
* Low-impact operational problem.

---

### Incident Process

1. Detect.
2. Declare.
3. Assign incident lead.
4. Contain.
5. Communicate.
6. Mitigate.
7. Recover.
8. Validate.
9. Document.
10. Conduct post-incident review.

Security incidents must preserve evidence.

---

## 34. Post-Incident Reviews

Post-incident reviews must be blameless and fact-based.

They should include:

* Summary.
* Customer impact.
* Timeline.
* Detection method.
* Root cause.
* Contributing factors.
* Response effectiveness.
* What worked.
* What failed.
* Corrective actions.
* Owners.
* Due dates.

Corrective work must be tracked in GitHub.

---

## 35. Vulnerability Management

Vulnerabilities must be:

* Identified.
* Validated.
* Classified.
* Assigned.
* Remediated.
* Retested.
* Documented.

Critical and high-severity vulnerabilities must not remain unresolved without documented risk acceptance.

Dependency updates must be reviewed for breaking and security impact.

---

## 36. Technical Debt

Technical debt must be visible.

Technical debt issues should document:

* The current problem.
* The affected area.
* The operational or product impact.
* The risk of delay.
* Proposed remediation.
* Estimated complexity.
* Recommended timeline.

Technical debt must be prioritized alongside features.

It must not be treated as invisible work that never enters planning.

---

## 37. Dependency Management

Dependencies must be:

* Necessary.
* Maintained.
* License-compatible.
* Security-reviewed.
* Version-controlled.
* Monitored.
* Replaceable where strategically important.

Avoid dependencies that:

* Have unclear ownership.
* Are abandoned.
* Require excessive privileges.
* Introduce unacceptable data sharing.
* Create avoidable lock-in.
* Duplicate existing platform capabilities.

---

## 38. Documentation Standards

Documentation must be:

* Current.
* Clear.
* Version controlled.
* Owned.
* Discoverable.
* Linked to relevant code or decisions.
* Written for its intended audience.

Required documentation may include:

* README files.
* API references.
* Architecture diagrams.
* ADRs.
* Runbooks.
* User workflows.
* Troubleshooting guides.
* Release notes.
* Security guidance.
* Migration guides.
* AI limitations.
* Operational procedures.

---

## 39. Accessibility Practice

Accessibility review must include:

* Keyboard-only operation.
* Focus order.
* Screen-reader labels.
* Form validation.
* Contrast.
* Responsive zoom.
* Tables.
* Charts.
* Dialogs.
* Notifications.
* Loading states.
* Error states.
* AI-generated content.

Automated testing does not replace manual accessibility review.

---

## 40. Performance Practice

Features should define performance expectations before scale becomes a production problem.

Performance testing should consider:

* API latency.
* Page load.
* Query performance.
* Large tenant datasets.
* Bulk operations.
* Concurrent users.
* Queue depth.
* Connector volume.
* AI response latency.
* Report generation.
* Export size.

Performance regressions must be investigated.

---

## 41. Environment Management

Standard environments are:

* Local.
* Development.
* Test.
* Staging.
* Production.

Each environment must define:

* Purpose.
* Access.
* Data classification.
* Deployment process.
* Secret source.
* Integration behavior.
* Monitoring level.
* Retention.
* Support expectations.

Production-only behavior should be minimized.

---

## 42. Infrastructure as Code

Infrastructure must be managed through reviewed code wherever practical.

Infrastructure pull requests must include:

* Scope.
* Security impact.
* Cost impact.
* Availability impact.
* Migration behavior.
* Rollback plan.
* Environment differences.
* Validation evidence.

Manual emergency changes must be documented and reconciled back into code.

---

## 43. Cloud Cost Management

Engineering must consider cost as an architectural quality.

Cost reviews should include:

* Compute.
* Storage.
* Data transfer.
* Logging.
* Search.
* Queueing.
* AI tokens.
* Embeddings.
* Model choice.
* Third-party APIs.
* Backup retention.
* Development environments.

Cost optimization must not compromise security, reliability, or customer commitments.

---

## 44. Service Ownership

Every production service must identify:

* Owner.
* Repository location.
* Purpose.
* Dependencies.
* Data classification.
* On-call or escalation process.
* Dashboards.
* Alerts.
* Runbook.
* Recovery expectations.
* Deployment process.

Unowned production services are prohibited.

---

## 45. CLAUDE.md Requirements

The root `CLAUDE.md` should instruct Claude Code to:

* Read the Constitution before implementation.
* Read the Engineering Handbook.
* Read relevant ADRs.
* Read the issue in full.
* Avoid inventing product behavior.
* Avoid changing architecture without approval.
* Preserve tenant isolation.
* Preserve authorization.
* Add tests.
* Add audit events.
* Add observability.
* Update documentation.
* Identify ambiguity.
* Stop and report conflicts.
* Never commit secrets.
* Avoid unrelated changes.
* Link implementation to the issue.

---

## 46. Coding-Agent Ticket Rules

A coding-agent ticket must provide enough information to implement safely.

It should specify:

* Exact objective.
* Files or modules affected where known.
* Required behavior.
* Prohibited behavior.
* Data model.
* API contract.
* Permission behavior.
* Tenant behavior.
* Audit events.
* Error behavior.
* Tests.
* Acceptance criteria.
* Definition of Done.

The implementation agent may propose changes but must not silently expand scope.

---

## 47. Definition of Done

Work is Done only when all applicable items are satisfied:

* Requirements are implemented.
* Acceptance criteria pass.
* Code is reviewed.
* Tests pass.
* Tenant isolation is verified.
* Authorization is verified.
* Security requirements are met.
* Audit events are present.
* Observability is present.
* Database migrations are safe.
* API documentation is updated.
* UX matches approved behavior.
* Accessibility is validated.
* AI evaluations pass where applicable.
* Documentation is complete.
* Deployment is successful.
* Post-release validation is complete.
* No unresolved critical issue remains.
* GitHub status is updated.

---

## 48. Engineering Metrics

Engineering metrics should support improvement rather than punishment.

Useful metrics include:

* Lead time.
* Deployment frequency.
* Change failure rate.
* Mean time to recovery.
* Escaped defects.
* Security remediation time.
* Test stability.
* Build duration.
* Review time.
* Sprint completion rate.
* Technical debt trend.
* AI evaluation pass rate.
* Availability.
* Customer-impacting incidents.

Metrics must be interpreted with context.

---

## 49. Continuous Improvement

The Handbook should evolve as PlatformTrust matures.

Improvements may be triggered by:

* Incidents.
* Retrospectives.
* Security reviews.
* Audit findings.
* Customer feedback.
* Scaling challenges.
* Architecture changes.
* AI model changes.
* Regulatory requirements.
* Team growth.

Changes should improve clarity, safety, and execution without creating unnecessary process.

---

## 50. Handbook Change Process

Handbook changes require:

1. A pull request.
2. A clear explanation.
3. Review by the document owner.
4. Security or architecture review where applicable.
5. Version update for material changes.
6. Effective date update.
7. Communication to affected contributors.

The Handbook must remain consistent with the PlatformTrust Constitution.

---

## 51. Final Engineering Principle

PlatformTrust engineering must optimize for durable trust.

The goal is not merely to produce code.

The goal is to produce a platform that customers can rely on for governance, risk, compliance, security, evidence, platform operations, and artificial intelligence oversight.

Every implementation decision should make PlatformTrust more:

* Secure.
* Explainable.
* Reliable.
* Auditable.
* Accessible.
* Maintainable.
* Scalable.
* Trustworthy.
