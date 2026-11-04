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

### Migration approach

- Use `ng update` and apply the automatic migrations provided by each major version.
- Verify the build, the unit tests, the coverage and the main application flows after each step, before merging.
- Make one commit per file or per dependency change, so every change can be reviewed and reverted on its own.

### Compatibility decisions

- **AngularFire:** updated to 21.0.0 in the first step. In the second step it is installed as `22.0.0-rc.0`, because the latest stable release (21.x) does not support Angular 22. It was installed in the same `ng update` command as Angular, as its maintainers recommend. The project only uses AngularFire for authentication, which limits the risk. It must be moved to the stable release as soon as it is published.
- **Firebase:** raised from v11 to v12 by the AngularFire 21 migration, which requires it. A single copy of `firebase` is kept in the dependency tree.
- **FullCalendar:** kept on the 6.x line (updated to 6.1.22, which declares support for Angular 22). FullCalendar 7 changes the package structure and the imports, so it is out of scope for this upgrade.
- **TypeScript:** 5.9 for Angular 21 and 6.0 for Angular 22, as required by each version.
- **Node.js:** Angular 22 requires Node.js v22.22.3 or v24.15.0 and later. The project uses the 22 line (verified with v22.23.4) to avoid mixing a runtime change with the framework upgrade. The documentation lists v22.22.3 as the minimum version.
- **Angular CDK:** kept aligned with the Angular version, although the source code does not import it directly.
