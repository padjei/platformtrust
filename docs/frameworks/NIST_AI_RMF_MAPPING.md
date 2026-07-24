# NIST AI RMF Mapping (Informational)

This document maps AI PlatformTrust's readiness domains and controls to the
functions of the **NIST AI Risk Management Framework (AI RMF 1.0)**:
**GOVERN, MAP, MEASURE, MANAGE**.

> **Disclaimer — alignment guidance only.** This mapping is **informational**.
> It shows how the platform's readiness domains *align conceptually* with NIST
> AI RMF functions to help organizations orient their work. It is **not** a
> certification, attestation, endorsement, or claim of conformance with the
> NIST AI RMF or any standard. No compliance or certification claim (SOC 2,
> ISO 27001, FedRAMP, HIPAA, CMMC, or NIST) is made without documented proof.
> The NIST AI RMF is voluntary and non-certifiable by design.

Related documents:

- [`READINESS_DOMAINS.md`](./READINESS_DOMAINS.md) — the domains.
- [`CONTROL_LIBRARY.md`](./CONTROL_LIBRARY.md) — the controls.
- [`SCORING_MODEL.md`](./SCORING_MODEL.md) — deterministic scoring.

---

## 1. NIST AI RMF functions (brief)

| Function | Focus |
|----------|-------|
| **GOVERN** | A culture of risk management: policies, accountability, roles, oversight — cuts across the others. |
| **MAP** | Establish context and identify risks: use cases, data, dependencies, impacts. |
| **MEASURE** | Analyze, assess, and track risks with appropriate methods and metrics. |
| **MANAGE** | Prioritize and act on risks; allocate resources; monitor and respond. |

---

## 2. Domain-to-function alignment

Domains typically span multiple functions; the table shows primary (●) and
secondary (○) alignment.

| Domain | GOVERN | MAP | MEASURE | MANAGE |
|--------|:------:|:---:|:-------:|:------:|
| Data Readiness (`DATA`) | ○ | ● | ○ | |
| Security & Access (`SEC`) | ○ | ○ | | ● |
| Governance & Policy (`GOV`) | ● | ○ | | ○ |
| Infrastructure & Platform (`INFRA`) | | ○ | | ● |
| Operational Readiness (`OPS`) | ○ | | ○ | ● |
| Model / AI Lifecycle (`MODEL`) | ○ | ○ | ● | ○ |
| Compliance Alignment (`COMP`) | ● | ○ | ○ | ○ |

---

## 3. Representative control-to-function mapping

Illustrative; uses the sample controls from
[`CONTROL_LIBRARY.md`](./CONTROL_LIBRARY.md).

| Control | Title | Aligned RMF function(s) |
|---------|-------|-------------------------|
| `DATA-010` | Data inventory & ownership | MAP |
| `DATA-020` | Sensitive data classified | MAP, MEASURE |
| `DATA-030` | Data quality measured | MEASURE |
| `SEC-010` | Least-privilege access | MANAGE, GOVERN |
| `SEC-020` | Centralized secrets | MANAGE |
| `SEC-030` | Encryption in transit & at rest | MANAGE |
| `GOV-010` | Accountable AI owner | GOVERN |
| `GOV-020` | AI use-case registry | GOVERN, MAP |
| `INFRA-010` | Environment separation | MANAGE |
| `INFRA-020` | Backup & DR | MANAGE |
| `OPS-010` | AI monitoring & alerting | MEASURE, MANAGE |
| `OPS-020` | AI incident response | MANAGE |
| `MODEL-010` | Model validation documented | MEASURE |
| `MODEL-020` | Human oversight defined | GOVERN, MANAGE |
| `COMP-010` | Obligations mapped | GOVERN, MAP |

---

## 4. How to use this mapping

- As **orientation**: understand which RMF functions your readiness gaps touch.
- As **communication**: frame remediation in language stakeholders recognize.
- **Not** as evidence of conformance. Readiness scores remain deterministic
  and product-defined (see [`SCORING_MODEL.md`](./SCORING_MODEL.md)); RMF
  alignment does not change any score.

> Reference: NIST AI RMF 1.0. This document paraphrases the framework's
> function structure for alignment purposes and does not reproduce or replace
> the source.
