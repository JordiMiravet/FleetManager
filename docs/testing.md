# Testing

Back to the [README](../README.md#tests).

## Table of Contents

- [Testing](#testing)
  - [Table of Contents](#table-of-contents)
  - [Testing Strategy](#testing-strategy)
  - [Running Tests](#running-tests)
    - [Frontend Tests](#frontend-tests)
    - [Backend Tests](#backend-tests)
  - [Coverage](#coverage)

---

## Testing Strategy

The project uses Jasmine and Karma for unit testing Angular components and services, and Jest for testing the NestJS backend.

Tests cover component rendering, user interactions, business logic, validation rules, error handling, and fallback scenarios. The goal is to ensure reliable behavior across the application's main features.

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

Run tests with coverage:

```bash
npm run test:cov
```

Run end-to-end tests:

```bash
npm run test:e2e
```

The backend uses Jest for unit testing and end-to-end testing, with Supertest available for HTTP testing.

## Coverage

Current test coverage:

```text
=============================== Coverage summary ===============================
Statements   : 98.57% ( 1108/1124 )
Branches     : 93.02% ( 200/215 )
Functions    : 97.81% ( 314/321 )
Lines        : 98.71% ( 999/1012 )
================================================================================

TOTAL: 1017 SUCCESS
```

---

[↑ Back to top](#testing)
