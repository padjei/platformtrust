"""Worker entrypoint.

MVP stub. Future responsibilities:
  - Poll read-only connectors and normalize results into the PlatformTrust event schema.
  - Process uploaded evidence (parse, hash, persist to Blob Storage).
  - Trigger deterministic scoring runs (the LLM never decides pass/fail).

All work is tenant-scoped: every job carries a tenant_id and enforces RLS.
"""


def main() -> None:
    # TODO: connect to the job queue and start the processing loop.
    print("platformtrust-worker: idle (MVP stub)")


if __name__ == "__main__":
    main()
