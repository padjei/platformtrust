---
name: plan-feature
description: Produce a written implementation plan from a GitHub issue for AI PlatformTrust. Use before coding a new feature to identify DB/API/UI/security/testing/migration impact and the smallest vertical slice.
---

# Plan a Feature

Turn a GitHub issue into a concrete, reviewable implementation plan. Do not write
feature code in this skill — produce the plan only.

## Steps

1. **Read the issue.** Capture the problem, goal, and explicit acceptance criteria
   (ACs). List any ambiguities to resolve before coding.
2. **Gather context.** Read relevant ADRs (`docs/adr` or equivalent), existing
   modules, the event schema, and the domain rules in `.claude/rules/`.
3. **Map impact across layers.** For each, state what changes:
   - **Database**: new/changed tables, `tenant_id`, RLS policies, indexes.
   - **Migration**: what Alembic migration is needed (new only, never edit committed).
   - **API**: endpoints, Pydantic request/response models, authz + tenant scoping.
   - **UI**: pages/components (shadcn/ui), Zod schemas, TanStack Query keys, forms.
   - **Security**: authz checks, untrusted-input handling, audit events, secrets.
   - **AI safety** (if LLM involved): schema-validated output, human approval,
     no PII in prompts, deterministic scoring untouched.
   - **Connectors** (if applicable): read-only default, normalization mapping.
4. **Define the smallest vertical slice.** Identify the thinnest end-to-end path
   (DB → API → UI + tests) that delivers value and satisfies at least one AC.
   Defer everything else to follow-up slices.
5. **List tests.** Unit (scoring/logic), integration (Testcontainers + RLS/tenancy),
   e2e (Playwright) needed to meet the Definition of Done.
6. **Write the plan.** Ordered steps, files to touch, risks/open questions, and the
   sequence of slices. Confirm the plan honors every rule in `.claude/rules/`.

## Additional Considerations
Must:

1. Read the GitHub issue.
2. Read relevant documentation.
3. Inspect existing code.
4. Identify affected modules.
5. Identify risks.
6. Produce an implementation plan.
7. Wait for approval before coding

## Output
A markdown plan: summary, ACs, per-layer impact, the first vertical slice, test
list, and open questions. No code changes.
