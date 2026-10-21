# Development Workflow

This guide documents the development workflow of the project: how work is organized, how branches and commits are named, and how epics, tasks, and pull requests are written.

The short version lives in the [README](../README.md#development-workflow). This document is the detailed reference.

## Contents

- [Development Workflow](#development-workflow)
  - [Contents](#contents)
  - [Issue and Pull Request Structure](#issue-and-pull-request-structure)

## Issue and Pull Request Structure

Work is organized into epics, tasks, and pull requests, so every change can be traced from its objective to its implementation.

- **Epics:** Define broader objectives, features, or improvements, establishing their motivation, scope, and acceptance criteria.
- **Tasks:** Break epics down into specific, actionable steps. Each task defines a clear goal, implementation scope, and verifiable acceptance criteria.
- **Pull Requests (PRs):** Document and submit the changes implemented for a task, providing the context needed to review them before merging into `main`.

```text
Epic
 └─ Task          (linked to its parent epic in GitHub)
     └─ Pull Request   (references the task it implements)
```

How they relate:

- Each task must be linked to its parent epic in GitHub. Tasks should be focused enough to be implemented and reviewed independently, and together they must cover the epic's scope and acceptance criteria. An epic is complete only when its required work and acceptance criteria have been satisfied.
- Each PR must reference the task it implements. A task may require one or more PRs, and each PR should stay focused on the changes needed for that task.
- Epics and tasks are GitHub issues. Their issue number is the `<task-number>` used in branch names, commit messages, and PR titles.

Quick reference:

| Element | Title format | Sections (in order) | Template |
| --- | --- | --- | --- |
| Epic | `[CATEGORY] - Short description` | Description, Scope, Acceptance Criteria | [epic.md](../.github/ISSUE_TEMPLATE/epic.md) |
| Task | `[CATEGORY] - Short description` | PR Reference, Description, Scope, Acceptance Criteria | [task.md](../.github/ISSUE_TEMPLATE/task.md) |
| Pull Request | `<type>(<scope>): <short description> (#<task-number>)` | Task Reference, Summary, Components, What's included, Notes | [PULL_REQUEST_TEMPLATE.md](../.github/PULL_REQUEST_TEMPLATE.md) |

GitHub loads these templates automatically when creating an issue or opening a PR. The sections below explain what to write in each one. The PR title is not filled in by the template and must be written manually.

The typical flow is:

1. Create an epic to define the overall objective, scope, and expected outcome.
2. Create individual tasks for the steps required to complete the epic, linking each one to its parent epic.
3. Create a dedicated branch for each task, following the [branch naming](#branch-naming) convention.
4. Implement the task through small, granular commits that follow the [commit message](#commit-messages) convention, each focused on a single responsibility or logical change.
5. Open a PR referencing the task, following the [pull request structure](#pull-request-structure-and-conventions) and the [pull request workflow](#pull-request-workflow).
6. Review the PR, address any feedback, and merge it into `main` once approved.

