# Roadmap

This project is continuously evolving to improve its scalability, maintainability, and production readiness. The following roadmap outlines ongoing work and planned features and architectural improvements.

Back to the [README](../README.md#roadmap).

## Table of Contents

- [Roadmap](#roadmap)
  - [Table of Contents](#table-of-contents)
  - [Status Definitions](#status-definitions)
  - [Planned and Ongoing Work](#planned-and-ongoing-work)
    - [Notification \& Invitation System](#notification--invitation-system)
    - [Internationalization (i18n)](#internationalization-i18n)
    - [Design System and Theme Improvements](#design-system-and-theme-improvements)
    - [Loading States and Skeleton Components](#loading-states-and-skeleton-components)
    - [State Management Improvements](#state-management-improvements)
    - [Backend and Data Architecture Improvements](#backend-and-data-architecture-improvements)
    - [Testing and Code Quality](#testing-and-code-quality)
    - [Deployment and CI/CD](#deployment-and-cicd)
  - [Related Documentation](#related-documentation)
  
## Status Definitions

- **In Progress:** Work has started and is currently being actively developed.
- **Planned:** Identified as a future improvement but implementation has not started yet.
- **Ongoing:** Continuous activities that are maintained and improved throughout the project's development.

## Planned and Ongoing Work

### Notification & Invitation System

**Status:** In Progress

- Complete the integration of the invitation and notification system with the backend API.
- Ensure invitation statuses and notification data are managed and synchronized through the backend.
- Maintain consistency between the frontend interfaces and backend data.

### Internationalization (i18n)

**Status:** In Progress

- Complete and standardize the existing message services across the application.
- Refactor the current approach to support a more scalable internationalization system.
- Implement language selection and apply the selected language consistently across the application.
- Prepare the application for additional languages in the future.

### Design System and Theme Improvements

**Status:** Planned

- Refine the existing design system as the application evolves.
- Review design tokens and component styling following future visual redesigns.
- Evaluate improvements to theme consistency and user preferences.

### Loading States and Skeleton Components

**Status:** Planned

- Add skeleton placeholders that mimic the layout of the main components (vehicle table, map, calendar and statistics) while their data is loading.
- Replace the skeleton with the real component once the data is available.
- Define a fallback state for when the data fails to load.
- Introduce them after the visual refactoring, so the skeletons follow the final design system.

### State Management Improvements

**Status:** Planned

- Review state management patterns as the application grows.
- Improve state consistency and separation of responsibilities where needed.
- Evaluate opportunities to simplify state handling across features.

### Backend and Data Architecture Improvements

**Status:** Planned

- Improve API contracts and data validation as the application evolves.
- Review data models and persistence strategies when new requirements arise.
- Maintain clear separation of responsibilities between frontend and backend.

### Testing and Code Quality

**Status:** Ongoing

- Maintain test coverage above 90% as the application evolves.
- Ensure new features and bug fixes include appropriate tests.
- Continue improving test quality, readability, and maintainability.

### Deployment and CI/CD

**Status:** Planned

- Review and improve the existing GitHub Actions workflows.
- Evaluate opportunities to automate testing, build validation, and releases.
- Deploy the application to a production environment.

## Related Documentation

- [Architecture Guide](architecture.md)
- [Testing Guide](testing.md)

---

[↑ Back to top](#roadmap)