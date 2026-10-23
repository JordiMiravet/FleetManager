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


