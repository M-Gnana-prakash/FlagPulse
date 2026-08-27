# FlagPulse

FlagPulse is a real-time feature flag management and evaluation platform built with Spring Boot and React. It supports runtime flag toggles, targeting rules, percentage rollouts, Caffeine caching, and STOMP/WebSocket updates.

## Project structure


## Run locally

### Backend

Set the database values in your local environment before starting Spring Boot:

```powershell
$env:DB_USERNAME="your_database_username"
$env:DB_PASSWORD="your_database_password"
cd FlagPulse
 .\mvnw.cmd spring-boot:run
```

Use `FlagPulse/src/main/resources/application-local.properties.example` as a reference for local configuration. The API runs on `http://localhost:8083` by default.

### Frontend

```powershell
cd flagpulse-frontend
Copy-Item .env.example .env.local
npm install
npm run dev
```

The dashboard defaults to `http://localhost:5173`. Configure `VITE_API_BASE_URL` and `VITE_WEBSOCKET_URL` in `.env.local` when needed.

## Security

Local `.env` files, database credentials, and build output are ignored by Git. Never commit passwords, API keys, access tokens, or production configuration. Only the example configuration files belong in the repository.

## Validation

```powershell
cd flagpulse-frontend
npm run lint
npm run build
```
