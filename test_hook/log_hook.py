#!/usr/bin/env python3
"""Append every hook invocation's payload as one JSON line to test-hook/hooks.ndjson."""
import json
import sys
import datetime
import os

try:
    raw = sys.stdin.read()
    payload = json.loads(raw) if raw.strip() else {}
except json.JSONDecodeError:
    payload = {"_raw_stdin": raw}

payload["_logged_at"] = datetime.datetime.now().isoformat()

out_dir = "test-hook"
os.makedirs(out_dir, exist_ok=True)
with open(os.path.join(out_dir, "hooks.ndjson"), "a") as f:
    f.write(json.dumps(payload) + "\n")
