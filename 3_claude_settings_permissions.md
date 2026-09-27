We can include or exclude commands in permissions
liek

```json
{
  "permissions": {
    "allow": ["Bash(nom run *)"],
    "deny": ["Bash(git push *)"],
    "ask": ["Bash(rm *)"]
  }
}
```
We can add and endit those also with /permissions command.