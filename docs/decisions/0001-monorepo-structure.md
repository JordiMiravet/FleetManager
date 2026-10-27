# ADR 0001: Monorepo structure

- **Status:** Accepted
- **Date:** 2026-10-27

## Context

Fleet Manager was developed in two independent repositories: `FleetManager-Frontend` (Angular) and `FleetManager-Backend` (NestJS). The frontend repository also holds the product documentation, the GitHub templates, the issues, and the project planning, while the backend repository is small and has no documentation of its own. With two repositories, a feature that touches both the API and the UI is split across two issue trackers and two pull requests.
