# ADR 0002: Upgrade the frontend to Angular 22

Back to the [README](../../README.md).

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

### Decisions that preserve existing behavior

- **Change detection:** Angular 22 changes the default change detection strategy. The official migration sets `ChangeDetectionStrategy.Eager` explicitly on every component (40 components and one test component), so they keep the behavior they had before.
- **HTTP client:** the official migration adds `withXhr()` to `provideHttpClient` in the application configuration and in 16 specs, so the XHR backend is kept explicitly.
- **Control flow:** in the first step, the official migration converts the templates to the `@if` / `@for` syntax and removes the `CommonModule` imports that are no longer needed.
- **TypeScript diagnostics:** the extended diagnostics `nullishCoalescingNotNullable` and `optionalChainNotNullable` are suppressed in the application and spec configurations, as set by the Angular 22 migration.
- **Zone.js:** the application keeps using `provideZoneChangeDetection`, which was already present in the application configuration.

### Optional migrations not applied

- `use-application-builder`: the project already uses the new build system.
- `router-current-navigation`: a modernization that is not required by the upgrade.
- `migrate-karma-to-vitest`: it replaces the whole unit-test runner, so it is outside the scope of a version upgrade.

## Alternatives considered

- **Stay on Angular 20:** avoids the migration work, but the project would fall behind on supported versions and compatible dependencies.
- **Stop at Angular 21 and wait for a stable AngularFire 22:** the lowest-risk option, since Angular 21 remained a supported version. It was not chosen because the project only uses AngularFire for authentication and the release candidate is official, so the risk was considered acceptable. The cost is a pre-release dependency that has to be replaced later.
- **Force the installation (`--force` or `--legacy-peer-deps`):** it would have allowed Angular 22 with AngularFire 21, but it produces a dependency tree that is not supported by the packages' declared ranges. It was rejected.
- **Upgrade to FullCalendar 7 at the same time:** it supports Angular 22, but it requires changing imports and adding dependencies. It was postponed to avoid mixing unrelated breaking changes.
- **Move to `OnPush` during the upgrade:** it could introduce screens that do not update, which is hard to detect across dozens of components. It was rejected in favor of keeping `Eager` explicit and migrating later, feature by feature.
- **Migrate from Karma to Vitest during the upgrade:** it is a separate change with its own risks, so it was rejected.
- **Use Node.js 24 or 26:** both are supported or likely to be, but moving to the 22 line changed the least while meeting the Angular 22 requirement.

## Consequences

- The frontend runs on Angular 22 with TypeScript 6.0.3, AngularFire `22.0.0-rc.0`, FullCalendar 6.1.22 and Angular CDK 22.2.
- The documentation lists Node.js v22.22.3 as the minimum version.
- The unit test suite passes with 1,017 tests and the same coverage as before the upgrade (Statements 98.57%, Branches 93.02%, Functions 97.81%, Lines 98.71%).
- The production build completes without errors. It reports two warnings that were already present before the upgrade: the initial bundle exceeds the 500 kB budget and `leaflet` is not an ES module. The initial bundle grew from 592.03 kB to 622.01 kB during the second step.
- The main application flows were verified manually in both API and mock modes.
- Components keep an explicit `Eager` change detection strategy. This is a transitional state, not a final design.

### Follow-ups

- Move `@angular/fire` from the release candidate to the stable 22 release when it is published.
- Migrate components from `Eager` to `OnPush` progressively, feature by feature, verifying each one.
- Evaluate migrating the unit-test runner from Karma to Vitest.
- Review the initial bundle size and the `leaflet` module format warning.

Future major upgrades should follow the same approach: one major version at a time, official migrations, no behavior changes and verification before merging.
