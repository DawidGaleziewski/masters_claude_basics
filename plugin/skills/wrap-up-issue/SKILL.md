---
name: wrap-up-issue
description: >-
  Runs the team's full wrap-up ritual for a finished Issue Tracker issue -
  moves the card to Done, clears the assignee, and appends a one-line summary
  of what changed to the issue description. Use this whenever the developer
  signals that work on an issue is finished, in whatever words - "I'm done
  with #3", "wrap up the board-layout issue", "that's finished", "close the
  ticket", "mark it done", "we can close this one out" - even if they never
  say "wrap up" and even if they only ask for one of the three steps (e.g.
  "move it to done"). Do not wait to be asked for the individual steps; a
  finished issue always gets all three.
---

# Wrap up an issue

When work on an issue is finished, three things are supposed to happen on the
board. Developers reliably do the first and forget the other two, which leaves
"done" cards that still look owned by someone and carry no record of what
changed. This skill exists so that all three land together, every time:

1. The card moves to **Done** (`status: "done"`).
2. The **assignee is cleared** (`assignee: null`).
3. A **one-line summary** of what changed is appended to the description.

Do all three even if the developer only mentioned one. Sending them in a single
request (below) is what keeps the ritual from being half-finished.

## The API

The app serves a REST API while `npm run dev` is running:

- `GET http://localhost:3000/api/issues` - list all issues
- `PATCH http://localhost:3000/api/issues/<id>` - update one; the body is any
  subset of `title`, `description`, `status`, `assignee`

Listing is a plain `curl -sS http://localhost:3000/api/issues`. The update goes
through the bundled `scripts/wrap-up.mjs` (step 3) rather than a hand-written
PATCH.

If a request can't connect, the dev server isn't running or is on another
port - Next.js picks 3001, 3002, ... when 3000 is taken. In the second case,
use that port for the listing and set `ISSUE_TRACKER_URL=http://localhost:<port>`
when running the script. Otherwise say so and ask the developer to start it
with `npm run dev`. Issues live in the server's memory, so there is nothing to
update while it is down - don't report the wrap-up as done, and don't edit
source files to fake it.

## Steps

### 1. Find the issue

List the issues and work out which one the developer means:

- **By name** ("the board-layout issue"): match against titles loosely. It
  doesn't need to be exact, just unambiguous.
- **By id**: issue ids are UUIDs, so a full id or a unique prefix identifies
  one directly.
- **By number** ("#3"): there are no numeric ids. Read `#N` as the Nth issue
  in the listing, and proceed only if that fits the conversation (it is the
  issue being worked on, or it is in progress). Otherwise confirm the title
  first.
- **Not named at all** ("ok, I'm done"): use the issue this session has been
  working on. If that isn't clear from the conversation, a single issue in
  `in_progress` is the obvious candidate.

If more than one issue fits and the conversation doesn't settle it, ask which
one - show the candidate titles so it's a one-word answer. Updating the wrong
card is worse than a quick question. When exactly one fits, just proceed.

### 2. Write the one-line summary

Describe what actually changed, in one line, past tense, concrete enough that
someone reading the card later learns something:

- Good: `Reworked board columns to a CSS grid so cards stop overflowing on narrow screens.`
- Weak: `Finished the work.` / `Done.` / a restatement of the title

Draw it from what happened in this session - the changes made, the commits,
the diff (`git log` / `git diff` help if the work predates the conversation).
If the developer described the change themselves, use their words. If there is
genuinely nothing to go on, ask for a one-liner rather than inventing one.

Keep it to a single line: no line breaks, no bullet lists.

### 3. Run the wrap-up script

Run the bundled script with the issue's full id, passing the summary on stdin:

```bash
node "${CLAUDE_SKILL_DIR}/scripts/wrap-up.mjs" <id> <<'EOF'
Reworked board columns to a CSS grid so cards stop overflowing on narrow screens.
EOF
```

The quoted heredoc is deliberate: summaries routinely contain apostrophes and
quotes ("Don't wrap long titles"), and this form passes them through without
any shell or JSON escaping. Give the summary on its own, without a `Done:`
prefix - the script adds it.

In one request the script sets `status: "done"` and `assignee: null`, and
appends the summary to the description after a blank line:

```
<existing description>

Done: Reworked board columns to a CSS grid so cards stop overflowing on narrow screens.
```

It keeps whatever description was already there, and it won't add the same
line twice if the issue was already wrapped up. Use it instead of writing the
PATCH by hand - that is where escaping mistakes and forgotten fields come from.

### 4. Confirm

On success the script prints the updated issue with `"result": "wrapped up"`
(or `"already wrapped up"`). Tell the developer briefly which issue it was, by
title, and the summary line that was added.

A non-zero exit means nothing should be reported as done: the message says
whether the server was unreachable, the id didn't match (re-list and retry
with the full id), or the update didn't stick.
