# FlagPulse Frontend

The FlagPulse dashboard is a React and Vite frontend for managing feature flags, testing targeting rules, and generating SDK snippets.

## Local configuration

Copy `.env.example` to `.env.local` and adjust the service URLs for your environment. Vite exposes only variables prefixed with `VITE_`, so never put private API keys or other secrets in these values or in client-side code.

```bash
npm install
npm run dev
```

The default API is `http://localhost:8083/api/v1/flags` and the default WebSocket endpoint is `http://localhost:8083/ws`.

## Build

```bash
npm run build
```

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
