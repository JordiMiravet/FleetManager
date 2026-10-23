# Installation

This guide explains how to install and run Fleet Manager locally.

The application is divided into two repositories:

- Frontend → Angular 20: https://github.com/JordiMiravet/FleetManager-Frontend.git
- Backend → NestJS: https://github.com/JordiMiravet/FleetManager-Backend.git

Both repositories need to be running to use the application with the real backend API. The frontend can also run independently using mock data by setting `dataSource` to `'mock'`. When configured to use the API, the application automatically falls back to mock data if the backend becomes unavailable.

Back to the [README](../README.md#installation).

## Prerequisites

- Node.js v20 or higher
- Angular CLI (`npm install -g @angular/cli`)
- MongoDB running

## 1. Frontend

Clone the repository:

```bash
git clone https://github.com/JordiMiravet/FleetManager-Frontend.git
cd FleetManager-Frontend
npm install
```

### Firebase Authentication configuration

- Create a project in Firebase Console.
- Enable Email/Password Authentication.
- Add a web application and copy the configuration.

From the root of the frontend repository, create the file src/environments/environment.ts. This file contains the Firebase configuration and the settings required to connect to the backend API.

Replace the placeholder values with your Firebase project configuration:

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

The `apiUrl` property must contain the URL where the backend API is running. For local development, use:

```typescript
apiUrl: 'http://localhost:3000'
```

> If the backend is running on a different host or port, update `apiUrl` accordingly.

The `dataSource` property controls whether the application uses mock data or communicates with the backend API. Use `'mock'` for local development without a running backend, or `'api'` to use the real backend. If `dataSource` is set to `'api'` and the backend becomes unavailable, the application automatically falls back to mock data without requiring manual configuration changes.

Firebase Authentication is required in every mode: mock data only replaces the vehicles and events normally provided by the backend.

## 2. Backend

Clone the backend repository:

```bash
git clone https://github.com/JordiMiravet/FleetManager-Backend.git
cd FleetManager-Backend
npm install
```

Create a `.env` file in the project root with the following content:

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

- `project_id`
- `client_email`
- `private_key`

The `private_key` must remain on a single line and preserve the `\n` characters.

## 3. Run the application

First, start the backend:

```bash
npm run start:dev
```

Then, in another terminal inside the frontend project, start the frontend:

```bash
ng serve
```

Open the application in your browser:

```text
http://localhost:4200
```

