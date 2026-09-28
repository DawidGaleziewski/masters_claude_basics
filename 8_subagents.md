# subagent
It is its own loop, has its own context.
Helps us avoide context polliution in our main loop.
It has its own system prompt.

Main agent can spawn subagents.. It forks with its own task and will return only with its resault to main loop.

Agents can use their own model. In order to optimize. I.e if we want to have agent for cleaning up something it maybe worth using something like haiku.


## when to use agents vs skills
Agents should be used when we want to do i.e diffrent tasks and avoid polluting our own context


## input/output
Subagent will recive system prompt from main agent (summary oif conversation and what it has to do).
We can change this behaviour with /brach (fork) for it to ingherit whole conversation

## IMPORTANT
subagents can use quite a lot tookens (wonder why?)

This is because subagent will re-create the session from start. And there is no CACHED session or prompts.

Subagents are good to not block main session. As they can run in parallel
