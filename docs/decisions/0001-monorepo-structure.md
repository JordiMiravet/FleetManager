# ADR 0001: Monorepo structure

Back to the [README](../../README.md).

- **Status:** Accepted
- **Date:** 2026-10-27

## Context

Fleet Manager was developed in two independent repositories: `FleetManager-Frontend` (Angular) and `FleetManager-Backend` (NestJS). The frontend repository also holds the product documentation, the GitHub templates, the issues, and the project planning, while the backend repository is small and has no documentation of its own. With two repositories, a feature that touches both the API and the UI is split across two issue trackers and two pull requests.

## Decision

Both applications are consolidated into a single repository with a simple monorepo structure, without workspace tooling:

```text
FleetManager/
├─ frontend/    # Angular application
├─ backend/     # NestJS API
├─ docs/        # Project documentation
├─ .github/     # Issue and pull request templates
├─ README.md
├─ LICENSE
└─ .gitignore
```

- **Base repository:** the existing frontend repository is renamed to `FleetManager`. This keeps its issues, pull requests, history, and links, and GitHub redirects the old URLs.
- **Independent applications:** `frontend/` and `backend/` keep their own `package.json`, lockfile, dependencies, configuration, and commands. There is no root `package.json`; commands are run from each application's folder.
- **Shared files:** `README.md`, `LICENSE`, `docs/`, `.github/`, and a root `.gitignore` for environment, dependency, and editor files live at the root. Everything else belongs to a single application.
- **Backend history:** preserved. The backend files are moved into `backend/` in a throwaway clone and then merged with `--allow-unrelated-histories`, so the original commits remain reachable with `git log --follow`. The pull request that imports it must be merged with a merge commit, not squashed.
- **Integration branch:** all the migration work is merged into a temporary `develop` branch and merged into `main` only after the result is verified.
- **Secrets:** `.env` files are never versioned. The backend provides a `.env.example` with placeholder values.
- **Tooling:** Nx, Turborepo, and npm workspaces are not introduced for now.
- **Old backend repository:** archived after the migration is verified, not deleted.

## Alternatives considered

- **Keep two repositories:** no migration cost, but cross-application changes stay split and the documentation and planning remain tied to the frontend repository.
- **Monorepo with Nx, Turborepo, or npm workspaces:** useful when there is shared code or long build times. Neither applies today, and it would add complexity and tooling to learn before it is needed.
- **New repository:** a clean start, but it would lose the existing issues, pull requests, and links.
- **Import the backend without history:** simpler, but it loses the record of how the backend evolved.

## Consequences

- A single issue tracker, project board, and README for the whole product.
- Changes that affect both applications can be reviewed in a single pull request.
- If CI is added, its workflows should use path filters so each application is built only when its folder changes.
- References such as `#12` in the imported backend commit messages are linked by GitHub to issue or pull request #12 of the monorepo.
- The decision should be revisited if shared code between applications or long build times appear.

---

[↑ Back to top](#adr-0001-monorepo-structure)
