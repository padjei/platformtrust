# AI Readiness Domains

> **Status:** Authoritative. Referenced by `CLAUDE.md`. This defines the
> domains the AI Readiness Auditor assesses.

An AI readiness assessment evaluates an organization across a fixed set of
**domains**. Each domain groups related **controls** (see
[`CONTROL_LIBRARY.md`](./CONTROL_LIBRARY.md)), which are assessed against
**evidence** and rolled up **deterministically** into a readiness score (see
[`SCORING_MODEL.md`](./SCORING_MODEL.md)). Domains are also mapped,
informationally, to the NIST AI RMF (see
[`NIST_AI_RMF_MAPPING.md`](./NIST_AI_RMF_MAPPING.md)).

The platform is cloud/app/model-neutral; domains describe *readiness*, not any
specific vendor.

---

## Domain summary

| ID | Domain |
|----|--------|
| `DATA` | Data Readiness |
| `SEC` | Security & Access |
| `GOV` | Governance & Policy |
| `INFRA` | Infrastructure & Platform |
| `OPS` | Operational Readiness |
| `MODEL` | Model / AI Lifecycle |
| `COMP` | Compliance Alignment |

---

## 1. Data Readiness (`DATA`)

**Purpose:** Assess whether data feeding AI systems is available, governed,
high-quality, and appropriately classified — the foundation of trustworthy AI.

**Example controls:**
- Data inventory and ownership are documented.
- Data is classified and sensitive/PII data is identified.
- Data quality (completeness, accuracy, freshness) is measured.
- Lineage and provenance are tracked for AI training/inference inputs.

**Evidence types:** data catalog exports, classification policy, data-quality
reports, lineage diagrams, sample schemas (no real PII).

---

## 2. Security & Access (`SEC`)

**Purpose:** Assess protection of AI systems, data, and credentials, and the
access controls around them.

**Example controls:**
- Access is role-based and least-privilege.
- Secrets are centrally managed (e.g., a vault), not hard-coded.
- Data is encrypted in transit and at rest.
- Multi-tenant / environment isolation is enforced.

**Evidence types:** IAM/role configuration exports, secret-management config,
encryption settings, access-review records, network/isolation diagrams.

---

## 3. Governance & Policy (`GOV`)

**Purpose:** Assess whether there is accountable oversight, policy, and
decision-making for AI use.

**Example controls:**
- An AI governance body / accountable owner exists.
- AI acceptable-use and risk policies are documented and communicated.
- An AI use-case inventory / registry is maintained.
- Roles and responsibilities for AI risk are defined.

**Evidence types:** governance charter, policy documents, use-case registry,
RACI/responsibility matrices, meeting/decision records.

---

## 4. Infrastructure & Platform (`INFRA`)

**Purpose:** Assess whether the underlying platform can host AI workloads
reliably, scalably, and securely.

**Example controls:**
- Environments are separated (dev/test/prod) with controlled promotion.
- Infrastructure is provisioned as code and reproducible.
- Compute/scaling for AI workloads is defined and cost-controlled.
- Backup and disaster recovery are in place.

**Evidence types:** IaC repositories/config, environment diagrams, DR/backup
policies and test results, capacity plans.

---

## 5. Operational Readiness (`OPS`)

**Purpose:** Assess the organization's ability to run, monitor, and respond to
AI systems in production.

**Example controls:**
- Monitoring, logging, and alerting cover AI systems.
- Incident response covers AI-specific failure modes.
- Runbooks and on-call exist for AI services.
- Change management governs AI deployments.

**Evidence types:** monitoring/dashboard config, alerting rules, incident
runbooks, on-call schedules, change-management records.

---

## 6. Model / AI Lifecycle (`MODEL`)

**Purpose:** Assess how AI/ML models are developed, validated, deployed, and
maintained responsibly.

**Example controls:**
- Model development and validation are documented.
- Models are versioned and tracked (registry).
- Human oversight / human-in-the-loop is defined for consequential decisions.
- Model performance and drift are monitored post-deployment.
- Bias/fairness and safety evaluations are performed where relevant.

**Evidence types:** model cards, validation reports, model registry exports,
oversight/approval records, drift-monitoring dashboards, evaluation results.

---

## 7. Compliance Alignment (`COMP`)

**Purpose:** Assess alignment with applicable regulations, standards, and
internal obligations — as *alignment*, not certification.

**Example controls:**
- Applicable regulatory/standard obligations are identified and mapped.
- Records/audit trails support accountability.
- Third-party / vendor AI risk is assessed.
- Data-subject and privacy obligations are addressed.

**Evidence types:** regulatory mapping documents, audit-trail samples, vendor
assessments, privacy/DPIA records.

> Compliance Alignment produces informational alignment only. No SOC 2 / ISO
> 27001 / FedRAMP / HIPAA / CMMC certification claim is made without
> documented proof. See
> [`NIST_AI_RMF_MAPPING.md`](./NIST_AI_RMF_MAPPING.md).
