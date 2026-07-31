#!/usr/bin/env bash
# PostToolUse/Write|Edit advisory: run targeted tests after a backend change.
#
# When a services/api Python source file changes, run the matching test module
# (tests/test_<name>.py) if it exists. Advisory and best-effort: never blocks the
# edit, stays silent when pytest or the test file is unavailable, and reports a
# concise pass/fail summary. Full `make test` in CI remains authoritative.
set -euo pipefail

payload="$(cat)"
file="$(printf '%s' "$payload" | jq -r '.tool_response.filePath // .tool_input.file_path // ""')"

[ -n "$file" ] || exit 0

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
api_dir="$repo_root/services/api"

# Only react to backend source files under services/api/app.
case "$file" in
  "$api_dir"/app/*.py) ;;
  */services/api/app/*.py) ;;
  *) exit 0 ;;
esac

# Skip test files themselves and dunder files.
base="$(basename "$file" .py)"
case "$base" in __init__|conftest) exit 0 ;; esac

test_file="$api_dir/tests/test_${base}.py"
[ -f "$test_file" ] || exit 0

# Locate a pytest runner without polluting the environment.
pytest_cmd=""
if [ -x "$api_dir/.venv/bin/pytest" ]; then
  pytest_cmd="$api_dir/.venv/bin/pytest"
elif command -v pytest >/dev/null 2>&1; then
  pytest_cmd="pytest"
else
  exit 0
fi

rel_test="${test_file#"$repo_root"/}"
output="$(cd "$api_dir" && "$pytest_cmd" -q --no-header -p no:cacheprovider "tests/test_${base}.py" 2>&1 || true)"
summary="$(printf '%s' "$output" | grep -Ei '[0-9]+ (passed|failed|error)' | tail -1)"

if printf '%s' "$output" | grep -Eiq '[0-9]+ (failed|error)'; then
  msg="$(printf 'Targeted tests FAILED for %s (%s).\n%s' "$rel_test" "$summary" "$(printf '%s' "$output" | tail -15)")"
  jq -n --arg m "$msg" '{systemMessage: $m, suppressOutput: true}'
elif [ -n "$summary" ]; then
  jq -n --arg m "Targeted tests passed for $rel_test ($summary)." '{systemMessage: $m, suppressOutput: true}'
fi

exit 0
