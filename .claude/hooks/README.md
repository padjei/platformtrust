# Project Hooks

Claude Code hooks that enforce the rules in `CLAUDE.md` and `.claude/rules/`.
Hooks are wired in `.claude/settings.json`; the scripts live in this directory.

## Implemented

| Hook | Event / matcher | Script | Enforcement |
|------|-----------------|--------|-------------|
| Block direct changes to released migrations | PreToolUse / Edit\|Write | `protect-committed-migrations.sh` | Hard block (files present in `HEAD`) |
| Prevent commits containing secrets | PostToolUse / Write\|Edit | `secret-scan.sh` | Advisory (warns; CI gitleaks is the gate) |
| Run formatting after edits | PostToolUse / Write\|Edit | `auto-format.sh` | Best-effort (Ruff / ESLint) |
| Prevent direct production deployment commands | PreToolUse / Bash | `block-push-to-main.sh` | Hard block (`git push` to main/master) |

## Roadmap (not yet implemented)

- Block access to `.env` and credential files
- Block destructive shell commands
- Run targeted tests after backend changes
- Warn when code touches authorization modules

## Notes

- Hard-block guardrails are overridable via the `/hooks` menu; they are strong
  defaults, not a substitute for GitHub branch protection and CI.
- Editing `.claude/settings.json` mid-session may require opening `/hooks` once
  (or restarting) before new hooks fire.
