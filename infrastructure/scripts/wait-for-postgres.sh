#!/usr/bin/env bash
# Wait until PostgreSQL is ready to accept connections.
#
# Usage: wait-for-postgres.sh [host] [port] [timeout_seconds]
# Env:   PGHOST, PGPORT, PGUSER can also be used by pg_isready.

set -euo pipefail

HOST="${1:-${PGHOST:-localhost}}"
PORT="${2:-${PGPORT:-5432}}"
TIMEOUT="${3:-60}"

echo "Waiting for PostgreSQL at ${HOST}:${PORT} (timeout ${TIMEOUT}s)..."

elapsed=0
until pg_isready --host="${HOST}" --port="${PORT}" >/dev/null 2>&1; do
  if [ "${elapsed}" -ge "${TIMEOUT}" ]; then
    echo "Timed out waiting for PostgreSQL at ${HOST}:${PORT}" >&2
    exit 1
  fi
  sleep 1
  elapsed=$((elapsed + 1))
done

echo "PostgreSQL is ready at ${HOST}:${PORT}."
