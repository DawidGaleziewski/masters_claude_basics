#!/usr/bin/env bash
set -euo pipefail

# Reads a Bash tool-call payload on stdin. If the command is a `git commit`,
# runs `npm run typecheck` and — on failure — emits a permissionDecision of
# "deny" with the compiler errors as the reason. Any other command passes
# through silently.
#
# Provided for you. Your job is to figure out where in the plugin this needs
# to be wired up so it actually fires.

payload=$(cat)
command=$(echo "$payload" | node -e '
  const payload = JSON.parse(require("fs").readFileSync(0, "utf8"));
  process.stdout.write(payload.tool_input?.command ?? "");
')

case "$command" in
  *"git commit"*) ;;
  *) exit 0 ;;
esac

if ! errors=$(npm run --silent typecheck 2>&1); then
  ERRORS="$errors" node -e '
    console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason:
          "Blocked: `npm run typecheck` must pass before committing.\n\n" + process.env.ERRORS,
      },
    }));
  '
fi

exit 0
