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

## Alternatives considered

- **Keep the previous configuration and thresholds:** the branch figure would stay at 88% and would keep mixing real gaps with branches that cannot run, so the number would not say where the missing tests are. It was rejected.
- **Write tests for those branches:** they cannot be reached, because the fallback only exists in the generated code.
- **Add `istanbul ignore` comments or exclude files with `coveragePathIgnorePatterns`:** the comments pollute the production code, and excluding files removes real logic from the measurement. It was rejected.
- **Use the `v8` coverage provider:** it does not generate those branches, but it reported lower figures (94.09% statements and 92.13% functions), because it counted module and schema files as mostly uncovered, and it kept gaps in the controllers. It was rejected.
- **Disable `isolatedModules` in `tsconfig.json`:** it changes how the production build and the tools compile the code, which is outside the scope of a testing task. It was rejected.
- **Use another transformer such as SWC:** it adds a dependency and a second compiler that has to stay consistent with the build. It was rejected.
- **Set the threshold at 100%:** any new uncovered line would fail the check. A 95% threshold keeps a margin.

## Consequences

- The branch coverage now measures real logic. The unit tests reach 100% in every metric, with 430 tests in 28 suites.
- The branch figures before and after this change are not comparable, because the difference comes from the compiler configuration and not from the tests.
- ts-jest type-checks the specs with the whole program, so type errors in the tests surface, and the run takes somewhat longer.
- There are now three TypeScript configurations to keep aligned when the compilation options change: `tsconfig.json` for the build, `tsconfig.spec.json` for the unit tests and `test/tsconfig.e2e.json` for the end-to-end tests.
- Some specs assert Nest metadata (routes, methods, guards and module declarations). They pin the contract of the API and cover declarative code, but they do not replace the end-to-end tests.
- The coverage report still measures only the unit tests.


