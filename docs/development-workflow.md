# Development Workflow

This guide documents the development workflow of the project: how work is organized, how branches and commits are named, and how epics, tasks, and pull requests are written.

The short version lives in the [README](../README.md#development-workflow). This document is the detailed reference.

## Contents

- [Development Workflow](#development-workflow)
  - [Contents](#contents)
  - [Issue and Pull Request Structure](#issue-and-pull-request-structure)
  - [Branch naming](#branch-naming)
  - [Commit messages](#commit-messages)
  - [Epic Structure and Conventions](#epic-structure-and-conventions)
      - [Epic title](#epic-title)
      - [Epic structure](#epic-structure)
      - [Epic example](#epic-example)
  - [Task Structure and Conventions](#task-structure-and-conventions)
      - [Task title](#task-title)
      - [Task structure](#task-structure)
      - [Task example](#task-example)

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

## Branch naming

Create a new branch from `main` using the following convention:

```text
<type>/<task-number>-<short-description>
```

Examples:

```text
feature/234-document-development-workflow
fix/198-handle-null-response
docs/234-update-readme
```

## Commit messages

Commit messages follow this format:

```text
<type>(<scope>): <short description in English> (#<task-number>)
```

Examples:

```text
feat(vehicle): add vehicle filtering (#145)
fix(calendar): prevent overlapping events (#182)
docs(readme): document development workflow (#234)
```

To keep commits consistent:

- Keep commit messages concise.
- Write them in English.
- Focus each commit on a single logical change.

## Epic Structure and Conventions

Epics organize larger features, improvements, or technical objectives into a single initiative that is completed through multiple related tasks. Template: [epic.md](../.github/ISSUE_TEMPLATE/epic.md).

#### Epic title

`[CATEGORY] - Short description of the objective`

The category identifies the type of work, and the description summarizes the overall objective.

Example: `[DOCS] - Document project workflow and issue templates`

#### Epic structure

Every epic must contain the following sections, in this order:

1. Description
2. Scope
3. Acceptance Criteria

**Description**

Explain the problem, need, or objective behind the epic, with enough context to understand why the work is necessary and what it aims to achieve. Introduce the overall goal without listing every implementation step. When relevant, explain the current situation and the improvement expected.

**Scope**

Define the work covered by the epic using a bullet list.

- Describe the main changes, improvements, or deliverables included.
- Keep each item focused on a specific area of work.
- Establish clear boundaries to prevent unrelated changes from being included.
- Keep the scope consistent with the objective described in the description.

**Acceptance Criteria**

List the conditions that must be satisfied for the epic to be considered complete.

- Use a checklist with Markdown checkboxes (`- [ ]`).
- Describe specific, verifiable outcomes rather than implementation steps.
- Ensure each criterion corresponds to the epic's objective and scope.
- Include relevant constraints, such as preserving existing functionality or limiting changes to documentation, when applicable.

#### Epic example

**Title:** `[DOCS] - Document project workflow and issue templates`

```markdown
## Description

Document the project's development workflow and establish consistent conventions for organizing and documenting development work.

The project already follows a structured workflow using epics, tasks, branches, commits, and pull requests. However, these conventions are not yet fully documented in the README.

The goal is to document the existing workflow and define reusable structures for epics, tasks, and pull requests, ensuring that future work follows a consistent and professional standard.

## Scope

- Document the overall issue and pull request organization strategy in the README.
- Document the structure and expected content of epics.
- Document the structure and expected content of tasks.
- Document the structure and expected content of pull requests.
- Provide examples consistent with the conventions already used in the project.
- Explain how epics, tasks, and pull requests relate to each other.
- Keep the documentation concise, practical, and easy to follow.
- Preserve the existing branch naming and commit message conventions.
- Avoid unnecessary changes to the existing development workflow.

## Acceptance Criteria

- [ ] The README documents the project's issue and pull request organization strategy.
- [ ] The expected structure of epics is documented.
- [ ] The expected structure of tasks is documented.
- [ ] The expected structure of pull requests is documented.
- [ ] Examples follow the conventions already used in the project.
- [ ] The relationship between epics, tasks, and pull requests is clearly explained.
- [ ] Existing branch naming and commit message conventions remain documented and unchanged.
- [ ] The documentation is consistent, readable, and written in English.
- [ ] No application code or functionality is modified as part of this epic.
```

## Task Structure and Conventions

Tasks break epics down into specific, manageable pieces of work. Each task has a clear purpose, a defined implementation scope, and verifiable acceptance criteria. Template: [task.md](../.github/ISSUE_TEMPLATE/task.md).

#### Task title

`[CATEGORY] - Short description of the task`

The category identifies the type of work, and the description summarizes the specific objective of the task.

Example: `[DOCS] - Document issue and pull request workflow`

#### Task structure

Every task must contain the following sections, in this order:

1. PR Reference
2. Description
3. Scope
4. Acceptance Criteria

**PR Reference**

Reference the pull request associated with the task using this format:

`### [PR #]()`

Leave it empty until a PR exists, then replace the placeholder with the PR number and URL. This connects the task to its implementation.

**Description**

Explain the specific objective of the task and provide enough context to understand what needs to be achieved and why. Focus on the particular piece of work covered by the task rather than repeating the objective of its parent epic.

**Scope**

Define the changes required to complete the task using a bullet list.

- Describe the specific changes or deliverables included.
- Keep each item focused on a clear part of the implementation.
- Establish boundaries to avoid unrelated changes and work that belongs to other tasks.
- Ensure the scope contributes to the parent epic's objective.

**Acceptance Criteria**

List the conditions that must be satisfied for the task to be considered complete.

- Use a checklist with Markdown checkboxes (`- [ ]`).
- Describe specific, verifiable outcomes.
- Ensure each criterion corresponds to an item in the task's scope or its expected result.
- Include relevant constraints, such as preserving existing behavior or limiting changes to documentation, when applicable.

#### Task example

**Title:** `[DOCS] - Document issue and pull request workflow`

```markdown
### [PR #]()

## Description

Document the overall issue and pull request organization strategy in the README to make the project's development process easier to understand and follow.

The goal is to explain how development work is organized through epics, tasks, and pull requests, and how these elements relate to each other throughout the implementation lifecycle.

## Scope

- Introduce an Issue and Pull Request Structure subsection within Development Workflow.
- Explain the purpose of epics, tasks, and pull requests.
- Describe how work progresses from an epic to individual tasks and their corresponding pull requests.
- Keep the explanation concise and consistent with the existing development workflow documentation.
- Preserve the existing branch naming, commit message, and pull request workflow sections.

## Acceptance Criteria

- [ ] The README includes an Issue and Pull Request Structure subsection.
- [ ] The purpose of epics, tasks, and pull requests is clearly explained.
- [ ] The relationship between these elements is documented.
- [ ] The new section fits naturally into the existing Development Workflow section.
- [ ] Existing workflow documentation remains intact.
```

