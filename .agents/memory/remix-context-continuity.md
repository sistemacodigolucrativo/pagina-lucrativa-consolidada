---
name: Remix context continuity
description: Keeping durable project knowledge available when a Replit project is remixed.
---

When continuity matters across a Remix, persist durable project decisions in files inside the project rather than relying on chat history or Agent-only memory. Replit's Remix documentation says project files and configuration are copied, while Agent chat history and persistent memory are not inherited.

**Why:** A remixed project starts with a fresh Agent, so conversational context can be lost even when the code is copied.

**How to apply:** Before a Remix, keep only non-code-derivable decisions and constraints in `.agents/memory/` or collaborator-visible project instructions. After the Remix, verify those files exist; do not assume the prior conversation is available.