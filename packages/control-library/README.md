# control-library

Machine-readable AI readiness **control definitions**. Controls are the unit of assessment:
each defines what to check, how heavily it counts, and what evidence is required.

Controls drive **deterministic scoring** — scoring is rules-based and reproducible. The LLM may
help summarize or extract evidence, but it never decides pass/fail.

## Control shape

| Field               | Type    | Notes                                          |
| ------------------- | ------- | ---------------------------------------------- |
| `id`                | string  | Stable unique control identifier.              |
| `domain`            | string  | Readiness domain (e.g. governance, security).  |
| `title`             | string  | Short human-readable title.                    |
| `description`       | string  | What the control checks.                       |
| `weight`            | number  | Relative weight in scoring.                    |
| `severity`          | string  | low / medium / high / critical.                |
| `evidence_required` | array   | Evidence types needed to satisfy the control.  |

See `controls/example-controls.json` for samples.
