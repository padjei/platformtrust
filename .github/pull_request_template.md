# Summary

<!-- What does this PR do and why? Keep it concise. -->

## Linked issue

<!-- e.g. Closes #123 -->

## Type of change

- [ ] Feature
- [ ] Bug fix
- [ ] Refactor / tech debt
- [ ] Documentation
- [ ] Migration
- [ ] CI / tooling

## Definition of Done checklist

- [ ] Acceptance criteria from the linked issue are met
- [ ] Authorization and tenant isolation (RLS) are enforced for all new paths
- [ ] All inputs and outputs are validated (Pydantic / Zod)
- [ ] Database migrations are included if the schema changed (Alembic)
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated (where applicable)
- [ ] End-to-end tests added/updated (where applicable)
- [ ] Audit logging added for security-relevant actions
- [ ] Error handling covers failure and edge cases
- [ ] Documentation updated (README / ADRs / API docs)
- [ ] `make verify` passes locally
- [ ] No secrets, tokens, or credentials in the diff
- [ ] No scope creep beyond the linked issue

## Security & tenancy self-review

<!-- Describe how this change preserves multi-tenant isolation and least privilege. -->

- Tenant scoping: <!-- How is the tenant boundary enforced for reads/writes? -->
- Authorization: <!-- What roles/permissions gate this change? -->
- Data exposure: <!-- Any risk of cross-tenant or sensitive data leakage? How mitigated? -->
- New dependencies: <!-- Any new third-party packages? Audited? -->
