<!--
  Thank you for your contribution. Fill out every relevant section.
  Delete sections that genuinely do not apply, and write "N/A" where an impact
  area was considered but has no effect. Do not include secrets, tokens, or PII.
-->

## Summary

<!-- What does this PR do and why? Keep it concise. -->

## Linked issue

<!-- Required. Reference the tracking issue, e.g. Closes PT-001 -->

- Closes PT-###

## Type of change

- [ ] Feature
- [ ] Bug fix
- [ ] Refactor / tech debt
- [ ] Documentation
- [ ] Migration
- [ ] CI / tooling
- [ ] Security

## Implementation notes

<!-- Key decisions, trade-offs, and anything a reviewer needs to understand the change. -->

## Constitution compliance

<!-- Confirm alignment with docs/constitution/PLATFORMTRUST_CONSTITUTION.md.
     Call out any principle this change touches (multi-tenancy, deny-by-default
     authorization, auditability, determinism, human approval, neutrality). -->

## Security impact

<!-- New attack surface, authz changes, secret handling, input validation. "N/A" if none. -->

## Tenant isolation impact

<!-- How is the tenant boundary preserved? Isolation must be enforced server-side for any new data path. "N/A" if none. -->

## Database impact

<!-- Schema changes, new tables/columns, indexes. Migrations included? Reversible? "N/A" if none. -->

## API impact

<!-- New/changed endpoints, request/response contracts, versioning, breaking changes. "N/A" if none. -->

## AI impact

<!-- Any use of the AI service? Confirm LLM output does not decide pass/fail, authorization,
     compliance, or scoring, and that machine-readable output is schema-validated. "N/A" if none. -->

## UX & accessibility impact

<!-- User-facing changes; loading/empty/error states; keyboard/screen-reader/contrast considerations. "N/A" if none. -->

## Tests performed

<!-- Unit / integration / e2e. Include tenant-isolation and authorization-failure coverage where relevant. -->

## Documentation

<!-- README / CONTRIBUTING / docs/ / ADRs / inline docs updated? "N/A" if none. -->

## Migration steps

<!-- Operational steps required to deploy (migrations, config, feature flags, backfills). "N/A" if none. -->

## Rollback considerations

<!-- How to safely revert this change. Any irreversible operations? "N/A" if none. -->

## Screenshots

<!-- For UI changes. Redact any sensitive or tenant-identifying data. -->

## Checklist (Definition of Done)

- [ ] References the tracking issue (PT-###)
- [ ] `pnpm build` succeeds
- [ ] `pnpm lint`, `pnpm format:check`, and `pnpm typecheck` pass
- [ ] `pnpm test` passes (and `uv run pytest` for apps/ai-service if touched)
- [ ] Architecture boundary check passes (`node scripts/check-app-boundaries.mjs`)
- [ ] No secrets, tokens, credentials, or PII in the diff
- [ ] Documentation updated where behavior or architecture changed
- [ ] No unrelated changes / scope creep beyond the linked issue
