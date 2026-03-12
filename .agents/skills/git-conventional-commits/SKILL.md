---
name: git-conventional-commits
description: Enforce Conventional Commits on every git operation
---

# Skill: Git Conventional Commits

## Type List
- `feat`: A new feature
- `fix`: A bug fix
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `docs`: Documentation only changes
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries

## Scope Examples
For this project, use the following scopes where applicable:
- `map`: SVG mapping logic, geographic data
- `pdf`: PDF extraction, rendering logic
- `api`: Anthropic API integration, endpoints
- `ui`: General React components, layout
- `i18n`: Ukrainian localization updates

## Breaking Change Syntax
Add a `!` after the type/scope, or include `BREAKING CHANGE:` in the footer.
Example: `feat(api)!: modify document block format`

## Commit Message Template
```
type(scope): subject in imperative mood, lowercase

[optional body describing the motivation and context]

[optional footer(s)]
```
