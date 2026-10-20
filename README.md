# Fleet Manager

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-TS-blue?style=for-the-badge)
![SCSS](https://img.shields.io/badge/SCSS-CC6699?style=for-the-badge&logo=sass&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)

![PrimeNG](https://img.shields.io/badge/PrimeNG-6C2BD9?style=for-the-badge&logo=primeng&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)
![FullCalendar](https://img.shields.io/badge/FullCalendar-3788D8?style=for-the-badge&logo=fullcalendar&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)
![Tests](https://img.shields.io/badge/Tests-Jasmine%20%26%20Karma-8A4Baf?style=for-the-badge&logo=jasmine&logoColor=white)

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Firebase Auth](https://img.shields.io/badge/Firebase_Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

## Table of Contents

- [Application Overview](#application-overview)
- [Technologies](#technologies)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Development Workflow](#development-workflow)
- [Usage](#usage)
- [Roadmap](#roadmap)
- [Project Preview](#project-preview)
- [Tests](#tests)
- [Contribution](#contribution)
- [Author](#author)

---

## Application Overview

Fleet Manager is an Angular 20 application designed to help users manage their personal vehicle garage. It allows users to organize their vehicles, share access with other users through an invitation system, track vehicle locations, schedule vehicle usage through an interactive calendar, and visualize detailed usage statistics.

The application follows a modular architecture based on reusable components and integrates user authentication, route guards, API communication, state management, reactive forms with validation, and data persistence.

### Main Features

- **User Authentication:** Register and sign in using an email address and password. Each user has an independent account with their own personal data.
- **Vehicle Management (CRUD):** Create, view, update, and delete vehicles within your personal garage. The vehicle table includes search and sorting capabilities to quickly find and organize vehicles. Vehicle owners have full control over their vehicles and their configuration.
- **Vehicle Sharing and Permissions:** Share vehicles with other users and manage access levels. Users with granted access can view vehicle information, update locations, create and manage usage events, and access statistics, while owner-only actions such as editing or deleting the vehicle remain restricted to the owner.
- **Invitations and Notifications:** Manage vehicle access through an invitation system with invitation status tracking. View notifications and access relevant information through the notification interface.
- **Interactive Map:** View all registered vehicles on an interactive map. Vehicle locations can be updated by dragging and dropping markers or by using the geolocation feature to automatically set a vehicle's location based on the user's current position. The map also supports filtering vehicles to display a specific vehicle.
- **Vehicle Usage Calendar:** Schedule vehicle usage events with specific start and end dates and times.
- **Event Management (CRUD):** Create, view, update, and delete usage events directly from the calendar.
- **Usage Validation:** Prevent overlapping usage events for the same vehicle and validate that event time ranges are logically consistent, avoiding invalid schedules where the end time occurs before the start time.
- **Dynamic Filtering:** Filter usage events by vehicle or display events from the entire garage.
- **Comments:** Add comments to scheduled events.
- **Statistics Dashboard:**
  - Total accumulated usage hours per vehicle.
  - Most-used vehicle.
  - Distribution of usage hours by day of the week.

Fleet Manager provides a centralized solution for managing vehicles, planning usage, and analyzing vehicle activity through an integrated platform.

---

## Technologies

### Frontend
- `Angular 20`
- `TypeScript`
- `SCSS`
- `HTML5`

### UI Libraries and Visualization
- `PrimeNG`
- `Leaflet`
- `FullCalendar`
- `Chart.js`

### Backend
- `NestJS`
- `MongoDB`

### Authentication
- `Firebase Authentication`

### Testing
- `Jasmine & Karma`

---

## Architecture

Fleet Manager follows a **feature-based architecture**, where the application is organized by business domains instead of grouping files only by their technical role. This approach keeps related functionality together, making the codebase easier to understand, maintain, and extend.

The application is divided into three main areas:

### Core

The `core` folder contains application-wide infrastructure that is shared across the entire application. These elements are created once and are not tied to a specific business feature.

Examples include:

- Global layout components such as the header, navigation, account drawer and notification interface.
- Route guards for authentication and guest access.
- Cross-cutting services such as authorization, data source management, geolocation, theme management and layout messages.

### Features

The `features` folder contains the application's business domains. Each feature is self-contained and groups together everything required for that area of functionality.

Depending on its needs, a feature owns its:

- Pages.
- Components.
- Data-access services.
- State management.
- Routes.
- Domain models, interfaces, enums and other feature-specific resources.

For example:

- `auth` manages authentication and registration.
- `vehicle` contains vehicle management functionality.
- `invitations` manages vehicle access invitations and their statuses.
- `map` provides the interactive map experience.
- `calendar` manages vehicle usage scheduling.
- `graphics` contains the statistics dashboard.

Internationalization message services are also organized within individual features to keep their messages close to the functionality they support.

Keeping these resources together allows each feature to evolve independently while reducing coupling between different parts of the application.

### Shared

The `shared` folder contains reusable building blocks that are not specific to any single feature.

This includes:

- Reusable UI components, such as buttons.
- Generic modal components.

Resources placed in `shared` are intended to be reused across multiple features without containing business-specific logic.

---

## Project Structure

```bash
src/
├─ app/
│  ├─ core/                         # Global application infrastructure
│  │  ├─ guards/                    # Authentication and guest guards
│  │  ├─ layout/                    # Header, navigation, account drawer, notifications
│  │  └─ services/                  # Shared application services
│  │
│  ├─ features/                     # Main application features
│  │  ├─ auth/                      # Login, registration and authentication
│  │  ├─ calendar/                  # Events and scheduling (FullCalendar)
│  │  ├─ graphics/                  # Statistics and data visualization (Chart.js)
│  │  ├─ invitations/               # Vehicle access invitations
│  │  ├─ map/                       # Interactive map (Leaflet)
│  │  └─ vehicle/                   # Vehicle management, access and permissions
│  │
│  ├─ shared/                       # Reusable UI components
│  │  └─ ui/                        # Buttons and generic modals
│  │
│  ├─ app.config.ts
│  ├─ app.routes.ts
│  ├─ app.html
│  ├─ app.scss
│  └─ app.ts
│
├─ assets/
│  ├─ icons/
│  └─ readme/
│
├─ environments/                    # Environment configurations
│
├─ styles/                          # Global SCSS styling system
│  ├─ abstracts/                    # Variables and mixins
│  ├─ base/                         # Base styles and typography
│  ├─ themes/                       # Light and dark themes
│  ├─ tokens/                       # Design tokens
│  └─ utilities/                    # SCSS helpers
│
├─ index.html
├─ main.ts
└─ styles.scss
```

---

## Installation

The application is divided into two repositories:
- Frontend → Angular 20 https://github.com/JordiMiravet/FleetManager-Frontend.git
- Backend → NestJS https://github.com/JordiMiravet/FleetManager-Backend.git

Both repositories need to be running to use the application with the real backend API. The frontend can also run independently using mock data by setting dataSource to 'mock'. When configured to use the API, the application automatically falls back to mock data if the backend becomes unavailable.

#### Prerequisites

- Node.js v20 or higher
- Angular CLI (`npm install -g @angular/cli`)
- MongoDB running

#### 1. Frontend

Clone the repository:

```bash
    git clone https://github.com/JordiMiravet/FleetManager-Frontend.git
    cd fleetmanager-frontend
    npm install
```
Firebase Authentication configuration:

- Configure Firebase Authentication:
    - Create a project in Firebase Console
    - Enable Email/Password Authentication
    - Add a web application and copy the configuration

Create the file `src/environments/environment.ts` with your Firebase configuration:

```bash
    src/environments/environment.ts
```

With the following content, replacing the values with your project configuration:

```typescript
    export const environment = {
        production: true,
        apiUrl: 'http://localhost:3000',
        dataSource: 'api', // 'mock' | 'api'
        firebaseConfig: {
            apiKey: "YOUR_API_KEY",
            authDomain: "YOUR_AUTH_DOMAIN",
            projectId: "YOUR_PROJECT_ID",
            storageBucket: "YOUR_STORAGE_BUCKET",
            messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
            appId: "YOUR_APP_ID"
        }
    };
```

Replace the placeholder values with your Firebase project configuration.

The `apiUrl` property must contain the URL where the backend API is running. For local development, use:

```
apiUrl: 'http://localhost:3000'
```

> If the backend is running on a different host or port, update apiUrl accordingly.

The `dataSource` property controls whether the application uses mock data or communicates with the backend API. Use `'mock'` for local development without a running backend, or `'api'` to use the real backend. If `dataSource` is set to `'api'` and the backend becomes unavailable, the application automatically falls back to mock data without requiring manual configuration changes.

#### 2. Backend

Clone the backend repository:

```bash
    git clone https://github.com/JordiMiravet/FleetManager-Backend.git
    cd fleetmanager-backend
    npm install
```

Create a .env file in the project root with the following content:

```env
    PORT=3000
    MONGO_URI=mongodb://localhost:27017/whereismycar

    FIREBASE_PROJECT_ID=your_project_id
    FIREBASE_CLIENT_EMAIL=your_client_email
    FIREBASE_PRIVATE_KEY=your_private_key
```

Firebase credentials can be obtained from:

Firebase Console → Project Settings → Service Accounts → Generate new private key.

From the downloaded JSON file, you need:

- project_id
- client_email
- private_key

The private_key must remain on a single line and preserve the \n characters.

#### 3. Run the application

First, start the backend:

```code
    npm run start:dev
```

Then, in another terminal inside the frontend project, start the frontend:

```bash
    ng serve
```

Open the application in your browser:

```bash
    http://localhost:4200
```


Notes
- Node.js must be installed.
- Angular CLI must be installed globally:
```bash
    npm install -g @angular/cli
```
- Real credentials are not included in the repository.
- Each developer must use their own Firebase project.

---

## Development Workflow

This project follows a simple Git workflow to keep contributions consistent and easy to review.

### Issue and Pull Request Structure

Development work is organized into epics, tasks, and pull requests to define clear objectives, break work into manageable steps, and ensure that changes are easy to review and maintain.

- **Epics:** Define broader objectives, features, or improvements, establishing their motivation, scope, and acceptance criteria.
- **Tasks:** Break epics down into specific, actionable steps that contribute to achieving the epic's overall objective. Each task defines a clear goal, implementation scope, and verifiable acceptance criteria.
- **Pull Requests (PRs):** Document and submit the changes implemented for a task, providing the context and details needed to review the implementation before merging it into the `main` branch.

The typical workflow is:

1. Create an epic to define the overall objective, scope, and expected outcome.
2. Create individual tasks that represent the steps required to complete the epic, linking each task to its parent epic.
3. Create a dedicated branch for each task, following the [branch naming](#branch-naming) convention.
4. Implement the task through small, granular commits, each focused on a single responsibility or logical change. This improves code readability, simplifies reviews, and supports long-term maintainability.
5. Open a PR referencing the corresponding task. Describe the changes using the project's established PR structure, including a summary, affected components, implemented changes, and relevant notes.
6. Review the PR, address any feedback, and merge it into `main` once it is approved.

This structure maintains traceability from the initial objective to the individual implementation steps and their corresponding PRs, ensuring that each change can be reviewed independently and that development work remains organized, understandable, and maintainable.

### Epic Structure and Conventions

Epics organize larger features, improvements, or technical objectives into a single initiative that can be completed through multiple related tasks.

#### Title

Epic titles must follow this format:

`[CATEGORY] - Short description of the objective`

The category identifies the type of work, and the description summarizes the overall objective of the epic.

Example:
`[DOCS] - Document project workflow and issue templates`

#### Structure

Every epic must contain the following sections in this order:

1. Description
2. Scope
3. Acceptance Criteria

Use the following guidelines when writing each section.

**Description**

Explain the problem, need, or objective behind the epic. Provide enough context to understand why the work is necessary and what it aims to achieve.

The description should introduce the overall goal without listing every implementation step. When relevant, explain the current situation and the improvement expected from the proposed work.

**Scope**

Define the work covered by the epic using a bullet list.

- Describe the main changes, improvements, or deliverables included in the epic.
- Keep each item focused on a specific area of work.
- Establish clear boundaries to prevent unrelated changes from being included.
- Ensure the scope is consistent with the objective described above.

**Acceptance Criteria**

List the conditions that must be satisfied for the epic to be considered complete.

- Use a checklist with Markdown checkboxes (`- [ ]`).
- Describe specific, verifiable outcomes rather than implementation steps.
- Ensure each criterion corresponds to the epic's objective and scope.
- Include relevant constraints, such as preserving existing functionality or limiting changes to documentation, when applicable.

#### Example

The following example illustrates how these sections fit together in a real epic.

**Title**

`[DOCS] - Document project workflow and issue templates`

```markdown
**Description**

Document the project's development workflow and establish consistent conventions for organizing and documenting development work.

The project already follows a structured workflow using epics, tasks, branches, commits, and pull requests. However, these conventions are not yet fully documented in the README.

The goal is to document the existing workflow and define reusable structures for epics, tasks, and pull requests, ensuring that future work follows a consistent and professional standard.

**Scope**

- Document the overall issue and pull request organization strategy in the README.
- Document the structure and expected content of epics.
- Document the structure and expected content of tasks.
- Document the structure and expected content of pull requests.
- Provide examples consistent with the conventions already used in the project.
- Explain how epics, tasks, and pull requests relate to each other.
- Keep the documentation concise, practical, and easy to follow.
- Preserve the existing branch naming and commit message conventions.
- Avoid unnecessary changes to the existing development workflow.

**Acceptance Criteria**

- [ ] The README documents the project's issue and pull request organization strategy.
- [ ] The expected structure of epics is documented.
- [ ] The expected structure of tasks is documented.
- [ ] The expected structure of pull requests is documented.
- [ ] Examples follow the conventions already used in the project.
- [ ] The relationship between epics, tasks, and pull requests is clearly explained.
- [ ] Existing branch naming and commit message conventions remain documented and unchanged.
- [ ] The documentation is consistent, readable, and written in English.
- [ ] No application code or functionality is modified as part of this epic.
```

#### Relationship with Tasks

An epic represents the overall objective, while its tasks define the individual pieces of work required to achieve it.

Create separate tasks for specific, manageable parts of the epic. Each task should contribute to one or more of the epic's acceptance criteria, and the epic should only be considered complete when its required work and acceptance criteria have been satisfied.

Each task must be linked to its parent epic in GitHub to maintain traceability between the overall objective and the work required to complete it.

### Branch naming

Create a new branch from the main branch using the following convention:

```text
    <type>/<task-number>-<short-description>
```

Examples:

```text
    feature/234-document-development-workflow
    fix/198-handle-null-response
    docs/234-update-readme
```

### Commit messages

Commit messages should follow the following format:

```text
    <type>(<scope>): <short description in English> (#<task-number>)
```

Examples:

```text
    feat(vehicle): add vehicle filtering (#145)
    fix(calendar): prevent overlapping events (#182)
    docs(readme): document development workflow (#234)
```

To keep commits consistent:
- Keep commit messages concise.
- Write them in English.
- Focus each commit on a single logical change.

### Pull Request workflow

When your work is ready:

1. Ensure your branch is up to date.
2. Push your branch to the remote repository.
3. Open a Pull Request targeting the main branch.
4. Reference the related task in the Pull Request.
5. Address any review feedback before the Pull Request is merged.

### Typical workflow

```bash
    git checkout -b docs/234-development-workflow

    # Make your changes

    git add .
    git commit -m "docs(readme): document development workflow (#234)"

    git push --set-upstream origin docs/234-development-workflow
```

---

## Usage

1. Open the application in your browser: http://localhost:4200
2. Register a new user account using an email address and password.
3. Sign in with your credentials.
4. Manage your vehicles from the vehicle management panel:
   - Create, edit, and delete vehicles.
   - Search and sort vehicles using the table controls.
   - Share vehicles with other users and manage access permissions.
5. Manage invitations and notifications:
   - View notifications through the notification interface.
   - View vehicle access invitations and check their statuses.
   - Accept or reject invitations when applicable.
6. View and manage vehicles on the interactive map (Map):
   - All registered vehicles are displayed by default.
   - Filter vehicles to display a specific vehicle on the map.
   - Update vehicle locations by dragging and dropping map markers.
   - Update a vehicle location automatically using the geolocation feature to set it to the user's current position.
7. Schedule and manage vehicle usage events through the calendar (Calendar):
   - Create, edit, and delete usage events for each vehicle.
   - Define specific start and end dates and times for each event.
   - The application prevents overlapping usage events for the same vehicle.
   - The application validates that event time ranges are consistent, preventing invalid schedules where the end time occurs before the start time.
   - Events can be filtered by vehicle or displayed for the entire garage.
   - Add comments to scheduled events.
8. View vehicle statistics in the dashboard (Graphics):
   - Analyze total accumulated usage hours per vehicle.
   - Identify the most-used vehicle.
   - View usage hour distribution by day of the week.
   - Filter statistics by period: This Month, This Year, and All Time.

---

## Roadmap

This project is continuously evolving to improve its scalability, maintainability, and production readiness. The following roadmap outlines planned features and architectural improvements that will be introduced progressively.

### 1. Notification & Invitation System (In Progress)
- Frontend implementation of the invitation and notification interfaces is complete.
- Integrate the invitation and notification system with the backend API.
- Ensure invitation statuses and notification data are managed and synchronized through the backend.

### 2. Internationalization (i18n) (In Progress)
- Complete and standardize the existing message services across the application.
- Refactor the current approach to support a more scalable internationalization system.
- Implement language selection and apply the selected language consistently across the application.
- Prepare the application for additional languages in the future.

### 3. Design System and Theme Improvements
- Refine the existing design system as the application evolves.
- Review design tokens and component styling following future visual redesigns.
- Evaluate improvements to theme consistency and user preferences.

### 4. State Management Improvements
- Review state management patterns as the application grows.
- Improve state consistency and separation of responsibilities where needed.
- Evaluate opportunities to simplify state handling across features.

### 5. Backend and Data Architecture Improvements
- Improve API contracts and data validation as the application evolves.
- Review data models and persistence strategies when new requirements arise.
- Maintain clear separation of responsibilities between frontend and backend.

### 6. Testing and Code Quality
- Maintain test coverage above 90% as the application evolves.
- Ensure new features and bug fixes include appropriate tests.
- Continue improving test quality, readability, and maintainability.

### 7. Deployment and CI/CD
- Review and improve the existing GitHub Actions workflows.
- Evaluate opportunities to automate testing, build validation, and releases.
- Deploy the application to a production environment.

---

## Project Preview

The following section shows a preview of the application in operation:

#### User Registration
![Register](src/assets/readme/FM-register.gif)

#### User Login
![Login](src/assets/readme/FM-login.gif)

#### Vehicle Management (CRUD)
![Create Vehicle](src/assets/readme/FM-vehicle-create.gif)
![Edit Vehicle](src/assets/readme/FM-vehicle-edit.gif)
![Delete Vehicle](src/assets/readme/FM-vehicle-delete.gif)

#### Vehicle Management (Vehicle Filtering)
![Vehicle Filter](src/assets/readme/FM-vehicle-filter.gif)

#### Interactive Map (drag & drop and vehicle filtering)
![Drag & Drop](src/assets/readme/FM-map_drag-drop.gif)
![Geolocation Update Button](src/assets/readme/FM-map_geolocation-button.gif)

#### Vehicle Usage Calendar (CRUD)
![Create Event](src/assets/readme/FM-event-create.gif)
![Edit Event](src/assets/readme/FM-event-edit.gif)

#### Vehicle Usage Calendar (Event Filtering)
![Event filter](src/assets/readme/FM-event-filter.gif)

#### Vehicle Usage Calendar (Validation: overlap and time consistency)
![Overlap validation](src/assets/readme/FM-event-valid-overlap.gif)
![Event time validation](src/assets/readme/FM-event-valid-time.gif)

#### Statistics Dashboard
![Graphics](src/assets/readme/FM-graphics.gif)

---

## Tests

### Testing Strategy

The project uses Jasmine and Karma for unit testing Angular components and services.

Tests cover component rendering, user interactions, business logic, validation rules, error handling, and fallback scenarios. The goal is to ensure reliable behavior across the application's main features.

### Running Tests

Run all unit tests:

```bash
    ng test
```

Run tests for a specific feature:

```bash
    ng test --include "src/app/features/<feature>/**/*.spec.ts"
```

This allows running tests for a specific feature without executing the complete test suite.

### Coverage

Current test coverage:

```text
=============================== Coverage summary ===============================
Statements   : 98.57% ( 1108/1124 )
Branches     : 93.02% ( 200/215 )
Functions    : 97.81% ( 314/321 )
Lines        : 98.71% ( 999/1012 )
================================================================================

TOTAL: 1017 SUCCESS
```

---

## Contribution

Contributions are welcome.

To contribute:

1. Fork the repository you want to contribute to:
   - Frontend: https://github.com/JordiMiravet/FleetManager-Frontend.git
   - Backend: https://github.com/JordiMiravet/FleetManager-Backend.git
2. Create a branch following the **Branch naming** convention described in the [Development Workflow](#development-workflow).
3. Commit your changes following the **Commit messages** convention described in the [Development Workflow](#development-workflow).
4. Push your branch and open a Pull Request targeting the `main` branch.
5. Follow the Pull Request expectations described in the [Development Workflow](#development-workflow).

---

## Author

[**Jordi Miravet**](https://www.linkedin.com/in/jordimiravet-dev/)