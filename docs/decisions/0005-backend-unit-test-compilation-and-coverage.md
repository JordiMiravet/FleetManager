# ADR 0005: Backend unit test compilation and coverage

Back to the [ADR index](index.md).

- **Status:** Accepted
- **Date:** 2026-11-24
- **Related:** Task #658. Builds on the backend test suite of task #647 and [ADR 0004](0004-backend-authorization-and-module-boundaries.md).

## Context

After task #647 the backend unit tests reported 97.91% statements, 88.36% branches, 100% functions and 98.6% lines. The goal of task #658 was to reach at least 95% in every metric.

The audit of the uncovered branches showed that they were not untested logic. They were reported on the constructors of services, guards and controllers, and on properties and parameters typed with a class. The cause is the `isolatedModules` option of `tsconfig.json` combined with `emitDecoratorMetadata`. ts-jest compiles each file on its own, so TypeScript cannot know whether an imported type is a class or an interface, and for every decorated parameter it emits a `typeof` check with a fallback to `Object`. The fallback can never run, so Jest counts it as an uncovered branch.

## Decision

Compile the unit tests with their own TypeScript configuration, keep the production build unchanged and raise the coverage threshold to 95%.

- Added `backend/tsconfig.spec.json`, with the options of `tsconfig.json` that the tests need and `isolatedModules` disabled. The Jest `transform` passes it to ts-jest. `tsconfig.json` is not modified, so the build is unchanged, and the end-to-end tests keep their own configuration.
- Raised the global threshold to 95% for statements, branches, functions and lines.
- Organized every spec with a `describe` per class, a nested `describe` per method and nested blocks per scenario, using `it.each` when only the data changes.
- Moved the shared mocks, the HTTP error assertion and the data builders to `src/common/testing/`, which is excluded from the coverage and from the production build.
- Made the controller specs check the route, the HTTP method and the guard of every endpoint, and the module specs check the metadata of each module.

Changing only the compiler configuration, without adding tests, raised the branch coverage from 88.36% to 97.14%. The branches that remained were real: the exception filter and the exception mapper, which were covered with new cases.
