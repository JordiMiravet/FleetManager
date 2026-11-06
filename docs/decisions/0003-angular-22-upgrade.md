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