"""initial schema: tenants and assessments with tenant isolation

Establishes the two foundational tables for the AI Readiness Auditor MVP and
demonstrates the tenant-isolation pattern required across the platform:

* every tenant-owned row carries a ``tenant_id``;
* primary keys are UUIDs generated in the database;
* timestamps are stored in UTC (``timestamptz``);
* PostgreSQL Row-Level Security (RLS) is enabled on tenant-owned tables and a
  policy scopes visibility to the current tenant set via the
  ``app.current_tenant`` session variable.

Revision ID: 0001
Revises:
Create Date: 2026-07-24 00:00:00.000000
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "tenants",
        sa.Column(
            "id",
            sa.UUID(),
            server_default=sa.text("gen_random_uuid()"),
            primary_key=True,
        ),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )

    op.create_table(
        "assessments",
        sa.Column(
            "id",
            sa.UUID(),
            server_default=sa.text("gen_random_uuid()"),
            primary_key=True,
        ),
        sa.Column("tenant_id", sa.UUID(), nullable=False),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column(
            "status",
            sa.Text(),
            server_default=sa.text("'draft'"),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["tenant_id"], ["tenants.id"], ondelete="CASCADE"
        ),
    )
    op.create_index(
        "ix_assessments_tenant_id", "assessments", ["tenant_id"]
    )

    # Defense in depth: enforce tenant isolation at the database layer via RLS,
    # in addition to the application-layer checks. The application sets
    # `app.current_tenant` per request from the authenticated context (never
    # from client-supplied input).
    op.execute("ALTER TABLE assessments ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE assessments FORCE ROW LEVEL SECURITY")
    op.execute(
        """
        CREATE POLICY tenant_isolation ON assessments
            USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
            WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid)
        """
    )


def downgrade() -> None:
    op.execute("DROP POLICY IF EXISTS tenant_isolation ON assessments")
    op.drop_index("ix_assessments_tenant_id", table_name="assessments")
    op.drop_table("assessments")
    op.drop_table("tenants")
