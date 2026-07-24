# Trust Graph — AI PlatformTrust

> **Related docs:** [System Architecture](./SYSTEM_ARCHITECTURE.md) · [Domain Model](./DOMAIN_MODEL.md) · [Event Model](./EVENT_MODEL.md) · [MVP Scope](../product/MVP_SCOPE.md) · [Roadmap](../product/ROADMAP.md)

## 1. Concept

The **trust graph** is a conceptual model of an organization's AI trust posture: the assets and systems that AI depends on, how they relate, and which controls cover them. It lets readiness and risk be reasoned about **relationally** — a weak control on a critical data store affects everything downstream that depends on it.

> **MVP note:** The trust graph is implemented as a **simplified relational representation** in PostgreSQL. It is **NOT** Neo4j or any graph database — those are explicitly out of scope for the MVP (see [MVP Scope](../product/MVP_SCOPE.md) §4). The relational model is sufficient for MVP-scale propagation.

## 2. Nodes

Nodes represent the things whose trust we care about.

| Node type | Examples |
|-----------|----------|
| **Asset** | An application, service, or workload endpoint. |
| **System** | Cloud platform, integration, or application system. |
| **Data store** | Database, warehouse, storage bucket, SFTP location. |
| **AI workload** | Model deployment, inference pipeline, training job. |
| **Control** | A readiness check ([Control](./DOMAIN_MODEL.md)) that covers one or more nodes. |

## 3. Edges

Edges represent relationships between nodes.

| Edge type | Meaning |
|-----------|---------|
| **depends_on** | Node A requires Node B to function (e.g., AI workload depends_on data store). |
| **data_flow** | Data moves from one node to another. |
| **control_coverage** | A control covers/evaluates a node. |

## 4. How Readiness / Risk Propagates

1. Each **control** yields a deterministic [ControlResult](./DOMAIN_MODEL.md) for the node(s) it covers via `control_coverage` edges.
2. A node's readiness is derived from the controls covering it.
3. Along `depends_on` and `data_flow` edges, a weak or failing upstream node **lowers confidence** in downstream nodes that rely on it.
4. Propagation is **deterministic** — the same graph and control results always yield the same derived posture. LLM output never sets node readiness or risk.

For the MVP, propagation is a bounded relational traversal (adjacency via join tables), not a general graph-database query. Depth and fan-out are constrained to MVP scale.

## 5. Relational Representation (MVP)

Conceptually:

```
node(id, tenant_id, node_type, ref, created_at)
edge(id, tenant_id, edge_type, from_node_id, to_node_id, created_at)
control_coverage(control_id, node_id, tenant_id)
```

- `tenant_id` on every row; UUID PKs; UTC timestamps — same conventions as the [Domain Model](./DOMAIN_MODEL.md).
- Tenant isolation via API + RLS (see [Multi-Tenancy](./MULTI_TENANCY.md)).
- Traversals are tenant-scoped queries; no cross-tenant edges are possible.

## 6. Text Illustration

```
   [AI workload: fraud-scorer]
            │ depends_on
            ▼
     [Data store: customer-db] ◄── control_coverage ── (Control: encryption-at-rest = fail)
            │ data_flow
            ▼
     [System: crm-integration] ◄── control_coverage ── (Control: least-privilege = pass)
```

A failed control on `customer-db` reduces confidence in `fraud-scorer` (which depends on it), even though the CRM integration control passed. This is how findings can flag downstream impact.

## 7. Relationship to Findings and Roadmap

- Control failures on covered nodes generate [Findings](./DOMAIN_MODEL.md).
- Downstream propagation informs finding **severity** and remediation **priority** (deterministically).
- Business-impact narratives on findings may be AI-drafted and schema-validated, but never change graph-derived readiness or severity.

## 8. Future Direction

Continuous monitors (Phase 2) and drift/failure detection (Phase 3) will re-use the trust graph to propagate *live* signals, not just point-in-time assessment results. A graph database remains a possible future optimization but is **not** part of the MVP. See [Roadmap](../product/ROADMAP.md).
