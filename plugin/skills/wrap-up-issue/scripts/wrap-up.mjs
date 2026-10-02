#!/usr/bin/env node
// Wraps up one issue: status -> done, assignee -> null, and a one-line
// "Done: ..." summary appended to the description, all in a single PATCH.
//
// Usage: node wrap-up.mjs <issue-id> <<'EOF'
//        <one-line summary>
//        EOF
// The summary is read from stdin so quotes and apostrophes need no escaping;
// it may also be passed as arguments after the id.
// The API base URL defaults to http://localhost:3000 and can be overridden
// with ISSUE_TRACKER_URL (e.g. when the dev server landed on another port).

import { readFileSync } from "node:fs";

const base = (process.env.ISSUE_TRACKER_URL ?? "http://localhost:3000").replace(/\/+$/, "");
const [id, ...rest] = process.argv.slice(2);
const raw = rest.length > 0 ? rest.join(" ") : process.stdin.isTTY ? "" : readFileSync(0, "utf8");
const summary = raw.replace(/\s+/g, " ").trim().replace(/^done:\s*/i, "");

function fail(message, code = 1) {
  console.error(message);
  process.exit(code);
}

if (!id || !summary) {
  fail("Usage: node wrap-up.mjs <issue-id> <<'EOF'\n<one-line summary>\nEOF", 2);
}

async function request(path, init) {
  try {
    return await fetch(`${base}${path}`, init);
  } catch {
    fail(`Cannot reach ${base}. Is the dev server running (npm run dev)? Set ISSUE_TRACKER_URL if it is on another port.`);
  }
}

const url = `/api/issues/${encodeURIComponent(id)}`;

const current = await request(url);
if (current.status === 404) fail(`No issue with id ${id}. List the issues again and retry with a full id.`);
if (!current.ok) fail(`GET ${url} failed with HTTP ${current.status}.`);
const issue = await current.json();

const line = `Done: ${summary}`;
const existing = (issue.description ?? "").trimEnd();
const hasLine = existing.split("\n").some((l) => l.trim() === line);
const description = hasLine ? existing : existing ? `${existing}\n\n${line}` : line;

if (issue.status === "done" && issue.assignee == null && hasLine) {
  console.log(JSON.stringify({ result: "already wrapped up", issue }, null, 2));
  process.exit(0);
}

const patched = await request(url, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ status: "done", assignee: null, description }),
});
if (!patched.ok) fail(`PATCH ${url} failed with HTTP ${patched.status}.`);
const updated = await patched.json();

if (updated.status !== "done" || updated.assignee != null || updated.description !== description) {
  fail(`The update did not stick:\n${JSON.stringify(updated, null, 2)}`);
}

console.log(JSON.stringify({ result: "wrapped up", added: line, issue: updated }, null, 2));
