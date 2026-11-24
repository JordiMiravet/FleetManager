# Testing

Back to the [README](../README.md#tests).

## Table of Contents

- [Testing](#testing)
  - [Table of Contents](#table-of-contents)
  - [Testing Strategy](#testing-strategy)
  - [Running Tests](#running-tests)
    - [Frontend Tests](#frontend-tests)
    - [Backend Tests](#backend-tests)
    - [Backend End-to-End Tests](#backend-end-to-end-tests)
  - [Backend Unit Test Conventions](#backend-unit-test-conventions)
  - [Coverage](#coverage)
    - [Frontend Coverage](#frontend-coverage)
    - [Backend Coverage](#backend-coverage)
  - [Related Documentation](#related-documentation)

## Testing Strategy

The project uses Jasmine and Karma for unit testing Angular components and services, and Jest for testing the NestJS backend.

Tests cover component rendering, user interactions, business logic, validation rules, error handling, and fallback scenarios. The goal is to ensure reliable behavior across the application's main features.

The backend has two levels of tests:

- **Unit tests** (`src/**/*.spec.ts`): controllers, services, DTOs, pipes and configuration in isolation.
- **End-to-end tests** (`test/*.e2e-spec.ts`): the real HTTP routes, going through the global validation pipe, the authentication guard, the services and a real MongoDB.

## Running Tests

### Frontend Tests

All commands in this section must be run from the `frontend/` folder.

Run all unit tests:

```bash
ng test
```

Run tests for a specific feature:

```bash
ng test --include "src/app/features/<feature>/**/*.spec.ts"
```

This allows running tests for a specific feature without executing the complete test suite.

### Backend Tests

All commands in this section must be run from the `backend/` folder.

Run all unit tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run unit tests with coverage:

```bash
npm run test:cov
```

Run end-to-end tests:

```bash
npm run test:e2e
```

### Backend End-to-End Tests

The end-to-end tests boot the real `AppModule` and replace only the external dependencies:

- **Database:** an in-memory MongoDB provided by `mongodb-memory-server`. No local MongoDB is needed. The first run downloads the MongoDB binary, so it needs an internet connection and may take longer.
- **Authentication:** `FirebaseService` is replaced by an in-memory fake (`test/support/fake-firebase.service.ts`). The real `FirebaseAuthGuard` still runs, so missing, malformed and rejected tokens are tested as well.

The global `ValidationPipe` is registered in the test application with the same options used in `main.ts`, so request validation behaves as in production.

The tests are organized by resource:

| File | Covers |
| --- | --- |
| `test/app.e2e-spec.ts` | Health check (`/check-db`) and unknown routes |
| `test/auth.e2e-spec.ts` | `POST /auth/verify` and the 401 response of every protected route |
| `test/vehicles.e2e-spec.ts` | Vehicle CRUD, owner versus shared-user permissions, sharing and removing users, validation |
| `test/events.e2e-spec.ts` | Event CRUD, access through shared vehicles, time-range validation, overlap rules |

Shared helpers live in `test/support/`. The e2e tests run serially (`maxWorkers: 1`) and use their own TypeScript configuration (`test/tsconfig.e2e.json`).

## Backend Unit Test Conventions

The backend unit tests share the same structure, so they are easy to read and extend:

- One `describe` per class, a nested `describe` per method, and nested blocks for each scenario (for example the owner, a shared user and a user without access).
- Tests that only change their data are written once with `it.each`.
- Shared mocks, the HTTP error assertion and the data builders live in `src/common/testing/`. They are excluded from the coverage and from the production build.
- Controller specs also check the route, the HTTP method and the guard of every endpoint, so the contract of the API is covered.
- Module specs check the metadata declared by each module.
- Specs whose code imports `@nestjs/config` mock it, because it is published as an ES module that Jest cannot load in this CommonJS setup.
- The unit tests are compiled with `tsconfig.spec.json`, where `isolatedModules` is disabled. With it enabled, TypeScript generates a branch that can never run for every decorated constructor parameter, and the coverage reports it as uncovered code. The reasons and the alternatives are recorded in [ADR 0005](decisions/0005-backend-unit-test-compilation-and-coverage.md).

## Coverage

Backend and frontend coverage are measured and reported separately.

### Frontend Coverage

Current test coverage:

```text
=============================== Coverage summary ===============================
Statements   : 98.57% ( 1107/1123 )
Branches     : 93.02% ( 200/215 )
Functions    : 97.81% ( 314/321 )
Lines        : 98.71% ( 998/1011 )
================================================================================

TOTAL: 1017 SUCCESS
```

### Backend Coverage

Coverage is collected from the unit tests with `npm run test:cov` and written to `backend/coverage/backend/`. The command fails if the global coverage drops below the configured threshold. Test helpers (`**/testing/**`), spec files and `main.ts` are excluded from the measurement.

Minimum threshold (global): statements, branches, functions and lines 95%.

Current unit test coverage:

```text
Statements   : 100%
Branches     : 100%
Functions    : 100%
Lines        : 100%

TOTAL: 430 SUCCESS (28 test suites)
```

The branch coverage was reported as 88.36% before the unit tests were compiled without `isolatedModules`. The difference comes from that compiler setting and not from the tests, so the figures before and after are not comparable.

The end-to-end tests are not included in this coverage report. They are run separately:

```text
TOTAL: 104 SUCCESS, 1 TODO (4 test suites)
```

## Related Documentation

- [Installation Guide](installation.md)
- [Architecture Guide](architecture.md)
- [Development Workflow](development-workflow.md)

---

[↑ Back to top](#testing)
