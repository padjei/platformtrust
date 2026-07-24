# Control Library

The control library is the catalog of individual **controls** assessed during
an AI readiness assessment. Controls belong to **domains** (see
[`READINESS_DOMAINS.md`](./READINESS_DOMAINS.md)) and feed the deterministic
scoring engine (see [`SCORING_MODEL.md`](./SCORING_MODEL.md)).

Control definitions are versioned, **Internal**-classified reference data (see
[`../security/DATA_CLASSIFICATION.md`](../security/DATA_CLASSIFICATION.md));
they are integrity-sensitive because tampering would change results.

---

## 1. Control ID scheme

```
<DOMAIN>-<NNN>
```

- `<DOMAIN>` — the domain prefix: `DATA`, `SEC`, `GOV`, `INFRA`, `OPS`,
  `MODEL`, `COMP`.
- `<NNN>` — a zero-padded sequence number within the domain (e.g., `010`,
  `020`), left gapped so new controls can be inserted.

Examples: `SEC-010`, `DATA-020`, `MODEL-030`.

IDs are stable and never reused; a retired control's ID is not reassigned.

---

## 2. Control fields

| Field | Description |
|-------|-------------|
| `id` | Unique control identifier (scheme above). |
| `domain` | Owning domain. |
| `title` | Short human-readable name. |
| `description` | What the control requires and why it matters. |
| `assessment_method` | How the control is evaluated (e.g., document review, config inspection, interview + evidence). |
| `evidence_required` | The evidence type(s) needed to substantiate a result (see domain evidence types). |
| `weight` | Relative contribution to its domain score (see [`SCORING_MODEL.md`](./SCORING_MODEL.md)). |
| `severity` | Impact if the control is unmet (`Critical` / `High` / `Medium` / `Low`); drives remediation priority. |

Additional operational fields (version, status, references, RMF mapping) may
accompany a control but the above are the core assessed fields.

---

## 3. Representative sample controls

> Illustrative sample across domains. `W` = weight, `Sev` = severity.

| ID | Domain | Title | Description | Assessment method | Evidence required | W | Sev |
|----|--------|-------|-------------|-------------------|-------------------|---|-----|
| `DATA-010` | Data Readiness | Data inventory & ownership | A maintained inventory of datasets with named owners exists. | Document review | Data catalog export | 3 | High |
| `DATA-020` | Data Readiness | Sensitive data classified | Datasets are classified; PII/sensitive data identified. | Document + config review | Classification policy + sample | 3 | High |
| `DATA-030` | Data Readiness | Data quality measured | Completeness/accuracy/freshness are measured for AI inputs. | Evidence review | Data-quality reports | 2 | Medium |
| `SEC-010` | Security & Access | Least-privilege access | Access to AI systems/data is role-based and least-privilege. | Config inspection | IAM/role export | 3 | Critical |
| `SEC-020` | Security & Access | Centralized secrets | Secrets are vault-managed, not hard-coded. | Config inspection | Secret-manager config | 3 | Critical |
| `SEC-030` | Security & Access | Encryption in transit & at rest | Data is encrypted end to end. | Config inspection | Encryption settings | 3 | High |
| `GOV-010` | Governance & Policy | Accountable AI owner | A governance body / accountable owner for AI exists. | Interview + document | Charter / RACI | 2 | High |
| `GOV-020` | Governance & Policy | AI use-case registry | A maintained registry of AI use cases exists. | Document review | Use-case registry | 2 | Medium |
| `INFRA-010` | Infrastructure & Platform | Environment separation | Dev/test/prod are separated with controlled promotion. | Config + document review | Environment diagram / config | 2 | High |
| `INFRA-020` | Infrastructure & Platform | Backup & DR | Backups and disaster recovery are in place and tested. | Evidence review | DR policy + test results | 2 | High |
| `OPS-010` | Operational Readiness | AI monitoring & alerting | Monitoring/logging/alerting cover AI systems. | Config inspection | Dashboard/alert config | 2 | High |
| `OPS-020` | Operational Readiness | AI incident response | Incident response covers AI-specific failures. | Document review | Runbooks | 2 | Medium |
| `MODEL-010` | Model / AI Lifecycle | Model validation documented | Model development & validation are documented. | Document review | Model card / validation report | 3 | High |
| `MODEL-020` | Model / AI Lifecycle | Human oversight defined | Human-in-the-loop exists for consequential decisions. | Interview + document | Oversight/approval records | 3 | Critical |
| `COMP-010` | Compliance Alignment | Obligations mapped | Applicable regulatory/standard obligations are identified. | Document review | Regulatory mapping | 2 | Medium |

---

## 4. How controls map to results deterministically

- Each control is assessed to a single **result state**: `pass`, `partial`,
  or `fail`, based on its `assessment_method` and whether `evidence_required`
  substantiates it.
- The result state maps to a fixed numeric score for that control; combined
  with `weight`, this produces the domain rollup — fully deterministic. See
  [`SCORING_MODEL.md`](./SCORING_MODEL.md).
- **LLM assistance never sets the result state or score.** An LLM may draft an
  explanation or summarize evidence, but the pass/partial/fail decision is
  made by the deterministic engine with human review. Any AI machine-readable
  output is schema-validated before use (see
  [`../security/THREAT_MODEL.md`](../security/THREAT_MODEL.md#6-llm-specific-threats)).
- Failed/partial controls become **gaps**; `severity` (and weight) drive
  remediation priority in the roadmap.
