# ADR 0002: Upgrade the frontend to Angular 22

- **Status:** Accepted
- **Date:** 2026-11-04
- **Related:** Epic #<epic-number>, tasks #623 and #624

## Context

The frontend of Fleet Manager was running on Angular 20, which was approaching the end of its support window. Staying on a supported framework version keeps the project compatible with maintained versions of Node.js, TypeScript and the libraries it depends on.

`ng update` only supports upgrading one major version at a time, so going from Angular 20 to Angular 22 requires two sequential upgrades. The upgrade also affects several dependencies (AngularFire, FullCalendar, Angular CDK, TypeScript) and changes some framework defaults, such as change detection.

## Decision

Upgrade the frontend from Angular 20 to Angular 22 in two independent steps, each with its own task and pull request:

1. **Angular 20 → 21 (task #623).**
2. **Angular 21 → 22 (task #624).**

The upgrade must preserve the existing behavior of the application. No new features, visual changes or functional modifications are included.
