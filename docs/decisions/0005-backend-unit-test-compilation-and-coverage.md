# ADR 0005: Backend unit test compilation and coverage

Back to the [ADR index](index.md).

- **Status:** Accepted
- **Date:** 2026-11-24
- **Related:** Task #658. Builds on the backend test suite of task #647 and [ADR 0004](0004-backend-authorization-and-module-boundaries.md).

## Context

After task #647 the backend unit tests reported 97.91% statements, 88.36% branches, 100% functions and 98.6% lines. The goal of task #658 was to reach at least 95% in every metric.

The audit of the uncovered branches showed that they were not untested logic. They were reported on the constructors of services, guards and controllers, and on properties and parameters typed with a class. The cause is the `isolatedModules` option of `tsconfig.json` combined with `emitDecoratorMetadata`. ts-jest compiles each file on its own, so TypeScript cannot know whether an imported type is a class or an interface, and for every decorated parameter it emits a `typeof` check with a fallback to `Object`. The fallback can never run, so Jest counts it as an uncovered branch.
