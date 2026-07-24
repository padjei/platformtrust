# Personas — AI PlatformTrust

> **Related docs:** [Product Vision](./PRODUCT_VISION.md) · [PRD](./PRD.md) · [MVP Scope](./MVP_SCOPE.md)

These personas anchor product decisions for the AI Readiness Auditor MVP and beyond. Each entry lists goals, pains, and how AI PlatformTrust helps.

## 1. CISO / Head of Security

**Context:** Accountable for the organization's security posture as AI adoption expands the attack surface.

| | |
|---|---|
| **Goals** | Know that AI systems and their dependencies are secure; avoid surprise exposures; produce a defensible security readiness story. |
| **Pains** | Security-relevant configuration drifts silently; readiness is assessed point-in-time and goes stale; evidence is scattered across cloud consoles and tools. |
| **How the product helps** | Security readiness domain with deterministic, evidence-backed controls; findings with business impact; foundation for continuous security monitors (Phase 2). Read-only connectors mean assessment never mutates production. |

## 2. AI / Platform Engineering Lead

**Context:** Owns the platform and infrastructure that AI workloads run on; turns readiness gaps into engineering work.

| | |
|---|---|
| **Goals** | A clear, prioritized backlog of what to fix; confidence the platform can support AI reliably; reproducible results. |
| **Pains** | Unbounded, unprioritized remediation backlog; unclear which gaps matter most; manual audits that don't map to engineering tasks. |
| **How the product helps** | Runs assessments, gets **deterministic** scores across infrastructure and operations domains, and a **prioritized remediation roadmap** with effort estimates that maps directly to engineering work. |

## 3. Compliance / Governance Officer

**Context:** Ensures AI adoption aligns with internal policy and external regulation.

| | |
|---|---|
| **Goals** | Evidence-backed, auditable readiness posture; traceability from control result to evidence; alignment with governance policy. |
| **Pains** | Manual evidence gathering; audit trails that don't hold up; readiness claims without proof. |
| **How the product helps** | Governance readiness domain; every control result is traceable to **evidence** in Azure Blob; **audit events** for significant actions; determinism means results are reproducible for auditors. |

## 4. Data Owner

**Context:** Responsible for specific data systems that feed AI workloads.

| | |
|---|---|
| **Goals** | Confirm the data systems under their care are ready to feed AI safely; understand data-related gaps. |
| **Pains** | Unclear data readiness criteria; no single place to attach evidence about data quality, lineage, or access controls. |
| **How the product helps** | Data readiness domain with concrete controls; ability to attach evidence per control; findings that pinpoint data gaps and their impact. |

## 5. Executive Sponsor

**Context:** Funds and champions AI initiatives; answers to the board.

| | |
|---|---|
| **Goals** | Confidence that AI rests on a trustworthy foundation; a clear, high-level readiness narrative; understanding of risk and remediation cost. |
| **Pains** | Readiness reported in technical jargon; no single number to track; unclear cost/benefit of remediation. |
| **How the product helps** | Overall and per-domain readiness scores at a glance; **plain-language, AI-drafted business-impact** explanations of findings; roadmap that ties remediation to effort and impact. |

## Persona-to-Feature Map

| Persona | Primary MVP touchpoints |
|---------|-------------------------|
| CISO | Security domain, findings, connectors (read-only) |
| AI/Platform Engineering Lead | Assessment creation, all domains, remediation roadmap |
| Compliance/Governance Officer | Governance domain, evidence, audit events |
| Data Owner | Data domain, evidence attachment |
| Executive Sponsor | Readiness scores, business-impact explanations, roadmap summary |

> AI-drafted explanations assist these personas but never determine control outcomes, scores, or compliance status — see [MVP Scope](./MVP_SCOPE.md) §3.6.
