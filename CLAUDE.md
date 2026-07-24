# AI PlatformTrust

## Product Mission

AI PlatformTrust is a multi-tenant AI Trust Operations Platform.

It helps organizations:

1. Assess readiness for AI.
2. Identify data, security, governance, infrastructure, and operational gaps.
3. Create remediation roadmaps.
4. Convert approved readiness controls into continuous monitors.
5. Detect failures and drift across applications, cloud platforms, data systems,
   integrations, storage services, and AI workloads.
6. Explain business impact and support approval-based remediation.

The product must remain cloud-neutral, application-neutral, and model-neutral.
Salesforce is an initial connector, not a platform dependency.

## Current Build Phase

The current milestone is the AI Readiness Auditor MVP.

Do not implement advanced continuous monitoring, autonomous remediation,
customer-side agents, Kafka, Kubernetes, Neo4j, or ClickHouse unless the
current GitHub issue explicitly requires it.

Read `docs/product/MVP_SCOPE.md` before planning any feature.

## Approved Stack

Frontend:
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- React Hook Form
- Zod

Backend:
- Python
- FastAPI
- Pydantic
- SQLAlchemy
- Alembic

Data:
- PostgreSQL
- PostgreSQL Row-Level Security
- Azure Blob Storage for evidence files
- Redis only when justified

Infrastructure:
- Docker
- Azure Container Apps
- Azure Database for PostgreSQL
- Azure Key Vault
- Terraform
- GitHub Actions

Testing:
- Pytest
- Playwright
- Testcontainers
- Ruff
- mypy
- ESLint
- TypeScript strict mode

## Architecture Rules

- Start as a modular monolith.
- Maintain clear module boundaries.
- Every tenant-owned database record must include `tenant_id`.
- Tenant isolation must be enforced in the API and PostgreSQL RLS.
- Never trust a tenant identifier supplied only by the client.
- Use UUIDs for public and internal resource identifiers.
- Use UTC for all persisted timestamps.
- Use database migrations for every schema change.
- Do not modify existing migrations after they have been committed.
- Keep provider-specific formats inside connector adapters.
- Normalize external events into the PlatformTrust event schema.
- Keep readiness scoring deterministic.
- LLM output must not determine control pass/fail, authorization, compliance
  status, production changes, or final risk scores.
- AI-generated machine-readable output must be schema validated.
- Production remediation requires explicit human approval.
- Default connector permissions must be read-only.

## Security Rules

- Never commit credentials, secrets, tokens, private keys, customer data, or PII.
- Never place real customer data in fixtures, screenshots, logs, or prompts.
- Use parameterized queries only.
- Validate all API inputs.
- Enforce authorization server-side.
- Encrypt evidence in transit and at rest.
- Log security-relevant actions without logging sensitive payloads.
- Every privileged action must create an audit event.
- Treat uploaded files and connector data as untrusted input.
- No compliance or certification claim may be added without documented proof.

Read:
- `docs/security/THREAT_MODEL.md`
- `docs/security/TENANT_ISOLATION.md`
- `.claude/rules/security.md`

## Development Workflow

For every GitHub issue:

1. Read the issue, acceptance criteria, referenced documentation, and ADRs.
2. Inspect the existing implementation before proposing changes.
3. Produce a written implementation plan before editing code.
4. Identify database, API, UI, security, testing, and migration impact.
5. Implement the smallest complete vertical slice.
6. Add or update tests.
7. Run all relevant validation commands.
8. Review the final diff for security, tenancy, and scope violations.
9. Update documentation when behavior or architecture changes.
10. Do not commit unrelated refactoring.

Never push directly to `main`.

## Required Commands

Use repository commands rather than inventing alternatives:

- `make setup`
- `make dev`
- `make lint`
- `make typecheck`
- `make test`
- `make test-integration`
- `make test-e2e`
- `make security-check`
- `make verify`

If a command is missing or broken, report it and fix the repository tooling
rather than silently bypassing it.

## Definition of Done

A feature is complete only when:

- Acceptance criteria are satisfied.
- Authorization and tenant isolation are enforced.
- Inputs and outputs are validated.
- Database migrations are included when required.
- Unit tests are present.
- Integration tests cover important boundaries.
- Relevant end-to-end behavior is tested.
- Audit logging is included where appropriate.
- Error handling is explicit.
- Documentation is updated.
- `make verify` passes.
- No secrets or sensitive data appear in the diff.
- No unresolved TODO placeholders remain in the feature.

## Prohibited Shortcuts

Do not:

- Build the entire product in one task.
- Disable tests to make CI pass.
- Use mock data in production paths.
- bypass authorization temporarily.
- use `any` to suppress TypeScript design problems.
- catch exceptions without logging or handling them.
- add a new dependency without explaining its purpose.
- expose cloud credentials to the browser.
- let an LLM execute production remediation directly.
- claim SOC 2, ISO 27001, FedRAMP, HIPAA, CMMC, or other certification.
- implement functionality outside the current issue.

## Documentation Index

- Product requirements: `docs/product/PRD.md`
- MVP scope: `docs/product/MVP_SCOPE.md`
- Architecture: `docs/architecture/SYSTEM_ARCHITECTURE.md`
- Domain model: `docs/architecture/DOMAIN_MODEL.md`
- Trust graph: `docs/architecture/TRUST_GRAPH.md`
- Connector framework: `docs/architecture/CONNECTOR_FRAMEWORK.md`
- Security model: `docs/security/THREAT_MODEL.md`
- Readiness domains: `docs/frameworks/READINESS_DOMAINS.md`
- Scoring model: `docs/frameworks/SCORING_MODEL.md`
