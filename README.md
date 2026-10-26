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

- [Fleet Manager](#fleet-manager)
  - [Table of Contents](#table-of-contents)
  - [Application Overview](#application-overview)
    - [Main Features](#main-features)
  - [Technologies](#technologies)
  - [Architecture](#architecture)
  - [Installation](#installation)
    - [Quick start (frontend)](#quick-start-frontend)
  - [Development Workflow](#development-workflow)
    - [Branch naming](#branch-naming)
    - [Commit messages](#commit-messages)
    - [Typical workflow](#typical-workflow)
  - [Usage](#usage)
  - [Roadmap](#roadmap)
  - [Project Preview](#project-preview)
      - [User Registration](#user-registration)
      - [User Login](#user-login)
      - [Vehicle Management (CRUD)](#vehicle-management-crud)
      - [Vehicle Management (Vehicle Filtering)](#vehicle-management-vehicle-filtering)
      - [Interactive Map (drag \& drop and vehicle filtering)](#interactive-map-drag--drop-and-vehicle-filtering)
      - [Vehicle Usage Calendar (CRUD)](#vehicle-usage-calendar-crud)
      - [Vehicle Usage Calendar (Event Filtering)](#vehicle-usage-calendar-event-filtering)
      - [Vehicle Usage Calendar (Validation: overlap and time consistency)](#vehicle-usage-calendar-validation-overlap-and-time-consistency)
      - [Statistics Dashboard](#statistics-dashboard)
  - [Tests](#tests)
  - [Documentation](#documentation)
  - [Contribution](#contribution)
  - [License](#license)
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

---

## Architecture

Fleet Manager follows a **feature-based architecture**, where the application is organized by business domains instead of grouping files only by their technical role. The code is divided into three main areas: `core` (application-wide infrastructure), `features` (self-contained business domains such as `auth`, `vehicle`, `invitations`, `map`, `calendar`, and `graphics`), and `shared` (reusable building blocks).

The full explanation and the project structure are documented in the [architecture guide](docs/architecture.md).

---

## Installation

The application is divided into two repositories:

- Frontend → Angular 20: https://github.com/JordiMiravet/FleetManager-Frontend.git
- Backend → NestJS: https://github.com/JordiMiravet/FleetManager-Backend.git

Both repositories need to be running to use the application with the real backend API. The frontend can also run independently using mock data by setting `dataSource` to `'mock'`. When configured to use the API, the application automatically falls back to mock data if the backend becomes unavailable.

### Quick start (frontend)

Prerequisites: Node.js v20 or higher and the Angular CLI (`npm install -g @angular/cli`).

Clone the frontend repository and install its dependencies:

```bash
git clone https://github.com/JordiMiravet/FleetManager-Frontend.git
cd FleetManager-Frontend
npm install
```

From the root of the frontend repository, edit (or create) `src/environments/environment.development.ts`, the file used by `ng serve`, with your Firebase configuration, and set `dataSource` to `'mock'` or `'api'`.

Firebase Authentication is required in every mode: mock data only replaces the vehicles and events normally provided by the backend.

Start the frontend:

```bash
ng serve
```

Open http://localhost:4200 in your browser.

For the Firebase setup, the environment files, the backend configuration, and more details, see the [full installation guide](docs/installation.md).

---

## Development Workflow

This project follows a simple Git workflow to keep contributions consistent and easy to review. Work is organized into epics, tasks, and pull requests, so every change can be traced from its objective to its implementation.

```text
Epic
 └─ Task          (linked to its parent epic in GitHub)
     └─ Pull Request   (references the task it implements)
```

The detailed conventions for epics, tasks, and pull requests are documented in the [development workflow guide](docs/development-workflow.md). GitHub loads the matching templates automatically from the [`.github`](.github) folder when you create an issue or open a pull request.

### Branch naming

Create a new branch from `main` using the following convention:

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

Commit messages follow this format:

```text
<type>(<scope>): <short description in English> (#<task-number>)
```

Examples:

```text
feat(vehicle): add vehicle filtering (#145)
fix(calendar): prevent overlapping events (#182)
docs(readme): document development workflow (#234)
```

Keep commit messages concise, write them in English, and focus each commit on a single logical change.

### Typical workflow

```bash
git checkout -b docs/234-development-workflow

# Make your changes

git add .
git commit -m "docs(readme): document development workflow (#234)"

git push --set-upstream origin docs/234-development-workflow
```

Then open a Pull Request targeting `main` and reference the related task. See the [pull request workflow](docs/development-workflow.md#pull-request-workflow) for details.

---

## Usage

A step-by-step guide to using the application (registration, vehicle management, invitations, map, calendar, and statistics) is available in the [usage guide](docs/usage.md). For a summary of what the application does, see [Main Features](#main-features).

---

## Roadmap

This project is continuously evolving to improve its scalability, maintainability, and production readiness. The planned features and architectural improvements are documented in the [project roadmap](docs/roadmap.md).

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

The project uses Jasmine and Karma for unit testing Angular components and services, and aims to keep test coverage above 90%. Run all unit tests with:

```bash
ng test
```

The testing strategy, how to run the tests for a specific feature, and the current coverage are documented in the [testing guide](docs/testing.md).

---

## Documentation

Detailed guides are available in the [`docs`](docs) folder:

| Guide | Description |
| --- | --- |
| [Installation](docs/installation.md) | Full setup of the frontend and the backend, including Firebase and environment configuration. |
| [Usage](docs/usage.md) | Step-by-step guide to using the application. |
| [Architecture](docs/architecture.md) | Feature-based architecture and project structure. |
| [Testing](docs/testing.md) | Testing strategy, how to run the tests, and current coverage. |
| [Development Workflow](docs/development-workflow.md) | Conventions for epics, tasks, branches, commits, and pull requests. |
| [Roadmap](docs/roadmap.md) | Planned features and architectural improvements. |

---

## Contribution

Fleet Manager is a personal portfolio project and is not offered as open-source software. Feedback, bug reports, and suggestions for improvement are welcome.

If you would like to propose a code change, please open an issue first to discuss it with the author. Any contribution intended for inclusion in the project must be agreed upon beforehand, and submitting a pull request does not guarantee that it will be accepted or grant permission to reuse the project's source code. Accepted contributions are included under the same terms as the rest of the project, and the copyright and usage terms described in the [License](#license) section continue to apply.

To report a bug or suggest an improvement, open an issue in the corresponding repository:

- Frontend: https://github.com/JordiMiravet/FleetManager-Frontend
- Backend: https://github.com/JordiMiravet/FleetManager-Backend

---

## License

Copyright (c) 2026 Jordi Miravet. All rights reserved.

Fleet Manager is a personal project published for portfolio presentation, demonstration, and professional evaluation purposes. Public access to this repository does not grant permission to reuse its source code. See the [LICENSE](LICENSE) file for the full copyright and usage terms.

---

## Author

[**Jordi Miravet**](https://www.linkedin.com/in/jordimiravet-dev/)

---

[↑ Back to top](#fleet-manager)
