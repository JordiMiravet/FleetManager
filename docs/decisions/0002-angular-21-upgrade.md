# ADR 0002: Upgrade the frontend to Angular 21

Back to the [ADR index](index.md).

- **Status:** Accepted
- **Date:** 2026-11-02
- **Related:** Epic #622, task #623. Followed by [ADR 0003](0003-angular-22-upgrade.md).

## Context

The frontend of Fleet Manager was running on Angular 20, which was approaching the end of its support window. Staying on a supported framework version keeps the project compatible with maintained versions of Node.js, TypeScript and the libraries it depends on.

`ng update` only supports upgrading one major version at a time, so the upgrade from Angular 20 to Angular 22 is split into two independent steps. This record covers the first one. The second is documented in [ADR 0003](0003-angular-22-upgrade.md).

## Decision

Upgrade the frontend from Angular 20 to Angular 21 as an independent step, with its own task and pull request. The upgrade must preserve the existing behavior of the application. No new features, visual changes or functional modifications are included.

### Migration approach

- Use `ng update` and apply the automatic migrations provided by Angular 21.
- Verify the build, the unit tests, the coverage and the main application flows before merging.
- Make one commit per file or per dependency change, so every change can be reviewed and reverted on its own.

### Compatibility decisions

- **AngularFire:** updated to 21.0.0, which supports Angular 21.
- **Firebase:** raised from v11 to v12 by the AngularFire migration, which requires it. A single copy of `firebase` is kept in the dependency tree.
- **TypeScript:** 5.9, as required by Angular 21.
- **Angular CDK:** updated to the stable 21.2 line. The prerelease version suggested by `ng update` was not used. The source code does not import the CDK directly.
- **Node.js:** the Node.js version already in use met the Angular 21 requirements, so the runtime was not changed in this step.
- **Other dependencies:** libraries not required to run on Angular 21 (FullCalendar, PrimeNG, Chart.js, Leaflet) were left untouched to keep the upgrade easy to isolate.

### Decisions that preserve existing behavior

- **Control flow:** the official migration to the built-in control flow syntax (`@if` / `@for`) only modified the component classes of seven components, removing the `CommonModule` imports that were no longer needed. No template files changed. Each component is a separate commit.
- **Zone.js:** the application already provided `provideZoneChangeDetection` in its configuration, so no change was needed.
- **Host binding type checking:** it is enabled by default in Angular 21. The build reported no new errors, so no configuration change was needed.

### Optional migrations not applied

- `use-application-builder`: the project already uses the new build system.
- `router-current-navigation`: a modernization that is not required by the upgrade.

## Alternatives considered

- **Stay on Angular 20:** avoids the migration work, but the project would fall behind on supported versions and compatible dependencies.
- **Upgrade directly from Angular 20 to Angular 22:** not supported by `ng update`, which only upgrades one major version at a time.
- **Update all outdated dependencies together with Angular:** it would have mixed unrelated breaking changes, making it hard to identify the cause of any failure.
- **Apply the optional migrations:** they are not required to run on Angular 21 and would have increased the size and risk of the change.
- **Use `npm audit fix` to reduce reported vulnerabilities:** it can change dependency versions outside the scope of the upgrade, so it was left for a separate task.

## Consequences

- The frontend runs on Angular 21 with TypeScript 5.9, AngularFire 21.0.0 and Angular CDK 21.2.
- The unit test suite passes with 1,017 tests and the same coverage as before the upgrade (Statements 98.57%, Branches 93.02%, Functions 97.81%, Lines 98.71%).
- The production build completes without errors. It reports two warnings: the initial bundle exceeds the 500 kB budget (592.03 kB) and `leaflet` is not an ES module. Neither was addressed in this step.
- The main application flows were verified manually in both API and mock modes.
- Seven components no longer import `CommonModule`.

### Follow-ups

- Continue to Angular 22, documented in [ADR 0003](0003-angular-22-upgrade.md).
- Review whether the Angular CDK dependency is still needed, since the source code does not import it.

---

[↑ Back to top](#adr-0002-upgrade-the-frontend-to-angular-21)