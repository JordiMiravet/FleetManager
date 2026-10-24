# Testing

Back to the [README](../README.md#tests).

## Testing Strategy

The project uses Jasmine and Karma for unit testing Angular components and services.

Tests cover component rendering, user interactions, business logic, validation rules, error handling, and fallback scenarios. The goal is to ensure reliable behavior across the application's main features.

## Running Tests

Run all unit tests:

```bash
ng test
```

Run tests for a specific feature:

```bash
ng test --include "src/app/features/<feature>/**/*.spec.ts"
```

This allows running tests for a specific feature without executing the complete test suite.

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