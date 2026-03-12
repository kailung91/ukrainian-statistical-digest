---
description: Step-by-step workflow the agent follows for every new feature request
---

# Workflow: New Feature Implementation

1. Read `GEMINI.md` → confirm understanding of operating principles, tech stack, and conventions.
2. State implementation plan (≤5 bullets), await user approval.
3. Implement the feature in small, reviewable chunks.
4. Self-verify: run type check / linter if available in the workspace.
5. Write or update the relevant `SKILL.md` if a new reusable pattern has emerged.
6. Commit the changes using Conventional Commits.
7. Update `.gemini/antigravity/brain/memory.md` with any new architectural decisions made during implementation.
