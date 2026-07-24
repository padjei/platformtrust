# Secure Development Lifecycle (SDLC)

This document describes how security is built into the way we develop AI
PlatformTrust — from design through review, CI, and incident response.

Related documents:

- [`THREAT_MODEL.md`](./THREAT_MODEL.md) — authoritative threat model.
- [`TENANT_ISOLATION.md`](./TENANT_ISOLATION.md) — isolation requirements and tests.
- [`AUTHORIZATION_MODEL.md`](./AUTHORIZATION_MODEL.md) — authZ enforcement.
- [`DATA_CLASSIFICATION.md`](./DATA_CLASSIFICATION.md) — data handling rules.

---

## 1. Threat modeling per feature

Every feature is threat-modeled during design, not after.

- Identify new **assets**, **trust boundaries**, connectors, and external
  dependencies; if any are added, update
  [`THREAT_MODEL.md`](./THREAT_MODEL.md).
- Walk STRIDE for the feature's boundaries.
- Confirm the top risk — cross-tenant access — is addressed: does the feature
  add tenant-owned tables (need `tenant_id` + RLS + isolation tests)? Does it
  read client input that could carry a tenant id?
- Treat all uploaded files, connector data, and LLM output as **untrusted
  input**.
- Confirm deterministic-scoring rules: LLM output must not decide pass/fail,
  authorization, compliance status, production changes, or final scores.

---

## 2. Dependency management and justification

- Every new dependency is **justified**: why it is needed, what it replaces,
  its maintenance/security posture, and its license.
- Prefer well-maintained, widely-used libraries; minimize transitive surface.
- Pin versions and use lockfiles for reproducible builds.
- Dependencies are scanned in CI (`pip-audit`, `npm audit`) — see Section 5.
- Vulnerable dependencies are upgraded or mitigated before release.

---

## 3. Secret management via Key Vault

- All secrets (connector tokens, DB credentials, LLM keys, signing keys) live
  in **Azure Key Vault**, retrieved at runtime via **managed identity**.
- No secrets in source, config files, environment dumps, logs, error
  messages, fixtures, or prompts.
- Secrets are rotated regularly and revoked immediately on suspected
  compromise.
- `gitleaks` runs in CI to catch accidental secret commits (Section 5).
- See [`DATA_CLASSIFICATION.md`](./DATA_CLASSIFICATION.md#3-handling-requirements-per-level)
  for Restricted/PII handling.

---

## 4. Code review and the security-reviewer agent

- All changes go through code review before merge.
- Reviews check: input validation, parameterized queries only, server-side
  authZ, tenant scoping + RLS for new tables, no secrets/PII in code or
  fixtures, audit events for privileged actions, and schema validation of any
  AI machine-readable output.
- A dedicated **security-reviewer agent** assists review on
  security-relevant changes (auth, tenant scoping, connectors, evidence
  handling, LLM integration, data storage).
- Security-sensitive changes require explicit sign-off.

---

## 5. CI security scanning

Automated scans run in GitHub Actions on every change:

| Tool | Purpose |
|------|---------|
| **gitleaks** | Detect committed secrets/credentials |
| **pip-audit** | Known vulnerabilities in Python dependencies |
| **npm audit** | Known vulnerabilities in frontend dependencies |
| Linters / type checks | Catch unsafe patterns early |
| Tests (incl. tenant isolation) | Enforce required isolation tests (see [`TENANT_ISOLATION.md`](./TENANT_ISOLATION.md#6-required-isolation-tests)) |

A failing security scan blocks merge.

---

## 6. The `make verify` gate

`make verify` is the single local/CI gate that must pass before code is
considered mergeable. It aggregates the checks above so developers get the
same result locally as CI:

- formatting and linting
- type checks
- unit + integration tests, including **tenant isolation tests**
- dependency audits (`pip-audit`, `npm audit`)
- secret scan (`gitleaks`)

**Rule:** do not merge if `make verify` is red. CI runs the same gate.

---

## 7. Incident response basics

1. **Detect** — alerts from monitoring, audit log anomalies, scan findings,
   or reports.
2. **Triage & classify severity** — cross-tenant data exposure is **Sev-1**.
3. **Contain** — revoke affected credentials, disable affected
   connectors/endpoints, isolate impacted components.
4. **Eradicate & recover** — fix root cause, rotate secrets, restore from
   clean encrypted backups if needed.
5. **Preserve evidence** — rely on the append-only audit log; do not destroy
   forensic data.
6. **Notify** — follow contractual/legal notification obligations for
   affected tenants.
7. **Post-incident review** — blameless retro; feed findings back into the
   threat model and this SDLC.

No compliance/certification claim (SOC 2, ISO 27001, FedRAMP, HIPAA, CMMC) is
made without documented proof.
