# Skills

Skill is just a markdow with a procedure.
With metadata (name and description on top). That is using progressive disclosure, to only load first in context window and load reast only when needed.
i.e deployment, human made loop, integrations

We can also set model in skill

## skill structure

Skill structure
```md
---
name: skill name
description: skill description
model: sonnet
disable-model-invocation: true // this will be used only by us. Model will never inbvoke it by itself
---

### when_to_use vs description
description is the main one. However we can precise even more for model when to use the skill with use_for. 

# skill name
Do this and that. Find $ARGUMENTS bugs
```

Example skill with arguments
/deploy staging

```md
---
name: deploy
description: Deploys codebase to staging or production
model: sonnet
---

# Deploy

1. Run the tests
2. Bundle the app
3. Deploy to $ARGUMENTS

```


### Dynamic context injection
!<command> syntax runs the shell command before the skill context is send to claude. Command output replaces the placeholder.

```md
---
name: deploy
description: Deploys codebase to staging or production
model: sonnet
agent: git-analyst
allowed-tools: Bash(gh *)
---

## Pull request context
- PR diff: !`gh pr diff`
- PR title: !`gh pr view --json title`

# Deploy

1. Run the tests
2. Bundle the app
3. Deploy to $ARGUMENTS

```


# Extra tips and commands

## use @ in prompts to add files
This adds the file to prompt. It removes a tool call so it is great for better usage

## /powerup
you oboard yourself with claude

## /insights
to check how well you are preforming with claude code

## /skill-creator

https://github.com/anthropics/skills/tree/main/skills/skill-creator

Used to add custom skills.
It also will run evals on skills. It will check how codebase will perform with and without skills.


# Experiment and observe

## /context check the context window

## Effort and model
try to adjust skills and some tasks with effort and model to optimize performance