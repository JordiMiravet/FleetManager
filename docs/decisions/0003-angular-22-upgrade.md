# ADR 0003: Upgrade the frontend to Angular 22

Back to the [README](../../README.md).

- **Status:** Accepted
- **Date:** 2026-11-03
- **Related:** Epic #622, task #624. Builds on [ADR 0002](0002-angular-21-upgrade.md).

## Context

After upgrading to Angular 21 ([ADR 0002](0002-angular-21-upgrade.md)), the frontend was upgraded to Angular 22, the latest major version at the time. Angular 20 was approaching the end of its support window, and Angular 22 was already available.

The upgrade affects several dependencies and changes some framework defaults, such as change detection and strict template type checking. It also raises the minimum Node.js and TypeScript versions.
