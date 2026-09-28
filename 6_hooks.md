# Hook Lifecycle

You can see all hooks with /hooks command

## 1. SessionStart

## 2. Each turn

### 2.1 UserPromptSubmit

### 2.2 Agentic Loop

[Agentic loop starts here]
1. PreToolUse <- most useful one 1
2. PermissionRequest
3. *executing tool call...*
4. PostToolUse <- most useful one 2
5. SubagentStart
6. TaskCreated
7. TaskCompleted
[Agentic loop finishes here]

### 2.3 Stop / StopFailure

## 3. TeammateIdle

## 4. PreCompact

## 5. PostCompact

## 6. SessionEnd

---

## Flow Summary

```
SessionStart
  → [Each turn]
      UserPromptSubmit
      → [Agentic Loop]
          PreToolUse
          → PermissionRequest
          → executing tool call...
          → PostToolUse
          → SubagentStart
          → TaskCreated
          → TaskCompleted
      → Stop/StopFailure
  → TeammateIdle
  → PreCompact
  → PostCompact
  → SessionEnd
```

# settings.json
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": " echo '##############Edit Or Write ##########'"
          }
        ]
        
      }
    ],
    "PostToolUse": [],
    "SessionStart": [],
    "EachTurn": [],
    "SessionEnd": []
  }
}
```