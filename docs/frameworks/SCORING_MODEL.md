# Scoring Model

> **Status:** Authoritative. Referenced by `CLAUDE.md`. This defines how
> readiness scores are computed.

Readiness scoring in AI PlatformTrust is **deterministic**: the same inputs
always produce the same score. Scores are computed by a rules-based engine
from control result states and weights — **never by an LLM**.

> **Hard rule:** LLM output never determines control pass/fail, scores,
> readiness level, or remediation decisions. The LLM may only draft
> human-readable explanations. See
> [`../security/THREAT_MODEL.md`](../security/THREAT_MODEL.md#6-llm-specific-threats).

Related documents:

- [`READINESS_DOMAINS.md`](./READINESS_DOMAINS.md) — the domains.
- [`CONTROL_LIBRARY.md`](./CONTROL_LIBRARY.md) — control fields (weight, severity).

---

## 1. Per-control scoring

Each control is assessed to one result state, which maps to a fixed fraction:

| Result | Meaning | Score fraction |
|--------|---------|:--------------:|
| `pass` | Fully met with sufficient evidence | `1.0` |
| `partial` | Partially met / incomplete evidence | `0.5` |
| `fail` | Not met or no evidence | `0.0` |

The mapping is a fixed table — not a judgment call at scoring time. `partial`
= `0.5` is the platform default; if a control defines custom banding it is
still a deterministic table.

A control's weighted contribution is:

```
control_points   = fraction × weight
control_max      = 1.0       × weight
```

---

## 2. Domain rollup with weights

Each domain score is the weighted average of its controls, expressed as a
percentage:

```
domain_score = ( Σ control_points ) / ( Σ control_max ) × 100
             = ( Σ fraction_i × weight_i ) / ( Σ weight_i ) × 100
```

Higher-weight controls move the domain score more. All values come from the
control library and the assessed result states — deterministic.

---

## 3. Overall readiness score and level

The overall score is the weighted rollup across domains. Domains may carry
their own domain weights (`Dw`); by default all domain weights are equal.

```
overall_score = ( Σ domain_score_d × Dw_d ) / ( Σ Dw_d )
```

The numeric score maps to a **readiness level** via fixed bands:

| Score range | Readiness level |
|-------------|-----------------|
| 90–100 | Optimized |
| 75–89 | Ready |
| 50–74 | Developing |
| 25–49 | Initial |
| 0–24 | Not Ready |

Bands are fixed configuration, applied deterministically.

---

## 4. Gaps and remediation priority

- Every control assessed `partial` or `fail` produces a **gap**.
- Remediation **priority** is derived deterministically from the gap's
  `severity` and `weight` (and how far it is from `pass`). A representative
  ordering:

  ```
  priority_rank = f(severity, weight, gap_size)
  ```

  where `Critical` severity outranks `High`, then `Medium`, then `Low`, with
  weight and gap size breaking ties. Fails outrank partials at equal severity.
- The remediation **roadmap** lists gaps in priority order. The *text* of a
  remediation suggestion may be LLM-drafted, but the priority ranking and the
  pass/fail status are deterministic, and **production remediation requires
  explicit human approval** (see
  [`../security/AUTHORIZATION_MODEL.md`](../security/AUTHORIZATION_MODEL.md)).

---

## 5. Worked example

A small assessment with two domains, equal domain weights.

**Security & Access (`SEC`)**

| Control | Result | Fraction | Weight | Points | Max |
|---------|--------|:--------:|:------:|:------:|:---:|
| SEC-010 | pass | 1.0 | 3 | 3.0 | 3 |
| SEC-020 | fail | 0.0 | 3 | 0.0 | 3 |
| SEC-030 | partial | 0.5 | 3 | 1.5 | 3 |

```
SEC domain_score = (3.0 + 0.0 + 1.5) / (3 + 3 + 3) × 100
                 = 4.5 / 9 × 100 = 50.0
```

**Data Readiness (`DATA`)**

| Control | Result | Fraction | Weight | Points | Max |
|---------|--------|:--------:|:------:|:------:|:---:|
| DATA-010 | pass | 1.0 | 3 | 3.0 | 3 |
| DATA-020 | pass | 1.0 | 3 | 3.0 | 3 |
| DATA-030 | partial | 0.5 | 2 | 1.0 | 2 |

```
DATA domain_score = (3.0 + 3.0 + 1.0) / (3 + 3 + 2) × 100
                  = 7.0 / 8 × 100 = 87.5
```

**Overall (equal domain weights):**

```
overall_score = (50.0 + 87.5) / 2 = 68.75  →  "Developing"
```

**Gaps produced:** `SEC-020` (fail, Critical) → top priority; `SEC-030`
(partial, High) → next; `DATA-030` (partial, Medium) → lowest. Given the same
inputs, this result is fully reproducible.
