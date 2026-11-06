# ADR 0003: Upgrade the frontend to Angular 22

Back to the [README](../../README.md).

- **Status:** Accepted
- **Date:** 2026-11-03
- **Related:** Epic #622, task #624. Builds on [ADR 0002](0002-angular-21-upgrade.md).

## Context

After upgrading to Angular 21 ([ADR 0002](0002-angular-21-upgrade.md)), the frontend was upgraded to Angular 22, the latest major version at the time. Angular 20 was approaching the end of its support window, and Angular 22 was already available.

The upgrade affects several dependencies and changes some framework defaults, such as change detection and strict template type checking. It also raises the minimum Node.js and TypeScript versions.

## Decision

Upgrade the frontend from Angular 21 to Angular 22 as an independent step, with its own task and pull request. The upgrade must preserve the existing behavior of the application. No new features, visual changes or functional modifications are included.

### Migration approach

- Use `ng update` and apply the automatic migrations provided by Angular 22.
- Verify the build, the unit tests, the coverage and the main application flows before merging.
- Make one commit per file or per dependency change, so every change can be reviewed and reverted on its own.

### Compatibility decisions

- **AngularFire:** installed as `22.0.0-rc.0`, because the latest stable release (21.x) does not support Angular 22. It was installed in the same `ng update` command as Angular, as its maintainers recommend, since `ng update` refuses to proceed while AngularFire 21 is installed. The project only uses AngularFire for authentication, which limits the risk. It must be moved to the stable release as soon as it is published.
- **Firebase:** AngularFire 22 treats `firebase` as a peer dependency. The existing 12.x version satisfies it, and a single copy is kept in the dependency tree.
- **FullCalendar:** kept on the 6.x line and updated to 6.1.22, which declares support for Angular 22. FullCalendar 7 changes the package structure and the imports, so it is out of scope.
- **TypeScript:** 6.0.3, as required by Angular 22.
- **Node.js:** Angular 22 requires Node.js v22.22.3 or v24.15.0 and later. The project uses the 22 line (verified with v22.23.4) to avoid mixing a larger runtime change with the framework upgrade. The documentation lists v22.22.3 as the minimum version.
- **Angular CDK:** updated to the stable 22.2 line, although the source code does not import it directly.

### Decisions that preserve existing behavior

- **Change detection:** Angular 22 changes the default change detection strategy. The official migration sets `ChangeDetectionStrategy.Eager` explicitly on 40 components and one test component, so they keep the behavior they had before. Each file is a separate commit.
- **HTTP client:** the official migration adds `withXhr()` to `provideHttpClient` in the application configuration and in 16 specs, so the XHR backend is kept explicitly.
- **TypeScript diagnostics:** the extended diagnostics `nullishCoalescingNotNullable` and `optionalChainNotNullable` are suppressed in the application and spec configurations, as set by the migration.
- **Strict templates:** it is enabled by default in Angular 22. The build reported no new errors, so no configuration change was needed.

### Optional migrations not applied

- `migrate-karma-to-vitest`: it replaces the whole unit-test runner, so it is outside the scope of a version upgrade.
- `use-application-builder`: the project already uses the new build system.

## Alternatives considered

- **Stop at Angular 21 and wait for a stable AngularFire 22:** the lowest-risk option, since Angular 21 remained a supported version. It was not chosen because the project only uses AngularFire for authentication and the release candidate is official, so the risk was considered acceptable. The cost is a pre-release dependency that has to be replaced later.
- **Force the installation (`--force` or `--legacy-peer-deps`):** it would have allowed Angular 22 with AngularFire 21, but it produces a dependency tree that is not supported by the packages' declared ranges. It was rejected.
- **Upgrade to FullCalendar 7 at the same time:** it supports Angular 22, but it requires changing imports and adding dependencies. It was postponed to avoid mixing unrelated breaking changes.
- **Move to `OnPush` during the upgrade:** it could introduce screens that do not update, which is hard to detect across dozens of components. It was rejected in favor of keeping `Eager` explicit and migrating later, feature by feature.
- **Migrate from Karma to Vitest during the upgrade:** it is a separate change with its own risks, so it was rejected.
- **Use Node.js 24:** Angular 22 supports it, but the 22 line required the smallest change. Node.js 26 was not verified against the toolchain.

