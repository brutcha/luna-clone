# Luna Clone

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Expo](https://img.shields.io/badge/Expo-54-000020.svg)](https://expo.dev/)

A local-first mobile app built with Expo and Livestore, featuring SQLite persistence and reactive state management.

> **Status:** Early development - Android only

## Features

- 🚀 Local-first architecture with SQLite persistence
- ⚡ Reactive state management with Livestore
- 📱 Android native app built with Expo
- 🎨 NativeWind (Tailwind CSS for React Native)
- 🔧 Effect-based service layer for configuration and dependency injection
- 🔄 React 19 with automatic compiler optimizations

## Tech Stack

### Core Framework

- **Expo** (v54) - React Native framework with dev client
- **React** (v19.1) - UI framework with compiler optimizations
- **React Native** (v0.81.4) - Mobile framework
- **TypeScript** (v5.9.3) - Type safety

### State & Data

- **Livestore** (v0.3.1) - Local-first state management and sync
  - `@livestore/adapter-expo` - Expo SQLite persistence adapter
  - `@livestore/react` - React hooks
  - `@livestore/devtools-expo` - Development tools
  - `@livestore/sync-cf` - Cloudflare sync (planned)

### Styling & UI

- **NativeWind** (v5 preview) - Tailwind CSS for React Native
- **@rn-primitives/portal** - Portal primitives
- **class-variance-authority** - Variant utilities
- **tailwindcss-animate** - Animation utilities

### Services

- **Effect** (v3.15.4) - Functional programming primitives for services, configuration, and logging

### Development Tools

- **Husky** - Git hooks for pre-commit checks
- **Lint-staged** - Run Prettier on staged files
- **Prettier** - Code formatting with Tailwind plugin
- **ESLint** - Code linting with Expo config + React Compiler plugin

## Architecture

### Platform

- **Client**: React Native app built with Expo (`src/app.tsx`)
- **Target**: Android only (iOS support TBD)
- **Local Database**: Livestore SQLite with Expo adapter
- **State Management**: Livestore with reactive queries

### Planned Features

- **Remote Sync**: Cloudflare Durable Objects via Livestore sync engine (TBD)
- **Encryption**: Awaiting Livestore native support or custom implementation (TBD)
- **Authorization**: Serverless solution preferred for production (currently mocked)
- **Conflict Resolution**: Latest-wins strategy (Livestore default) - may be enhanced later

> **Note:** Livestore's SQLite adapter has compatibility issues with Expo SDK 54, so `Livestore.Live` currently uses a test layer. Local data persists across restarts, but remote sync is disabled until the adapter is updated.

## Getting Started

### Prerequisites

- **Bun** >= 1.0.0 (JavaScript runtime and package manager)
- **Android Studio** and Android SDK (for Android development)

### Installation

1. **Clone the repository**:

   ```bash
   git clone git@github.com:brutcha/luna-clone.git
   cd luna-clone
   ```

2. **Install dependencies**:

   ```bash
   bun install
   ```

3. **Set up environment variables**:

   ```bash
   cp .env.example .env.local
   ```

   Available environment variables:
   - `EXPO_PUBLIC_LOG_LEVEL` - Log level (`Trace` | `Debug` | `Info` | `Warn` | `Error` | `Fatal`, default: `Info`)

4. **Run the app**:

   ```bash
   bun start
   ```

   Then press `a` to open on Android emulator/device.

### Available Scripts

| Command             | Description                                               |
| ------------------- | --------------------------------------------------------- |
| `bun start`         | Start Expo development server                             |
| `bun android`       | Build Android app (alias for `expo run:android`)          |
| `bun android:debug` | Build Android app in debug optimized mode                 |
| `bun lint`          | Run ESLint with Expo config                               |
| `bun prepare`       | Set up Husky git hooks (runs automatically after install) |

## Project Structure

```text
luna-clone/
├── assets/              # Images and static assets
├── docs/                # Documentation
│   └── adr/             # Architecture Decision Records
├── src/                 # Source code
│   ├── index.ts         # Entry point
│   ├── app.tsx          # Main app component with LiveStoreProvider
│   ├── global.css       # Global styles (NativeWind/Tailwind)
│   ├── components/      # React components
│   │   ├── cycle-ring/  # Cycle ring component
│   │   └── ui/          # UI primitives
│   ├── domain/          # Domain models and error types
│   ├── helpers/         # Utility helpers
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility libraries
│   ├── livestore/       # Livestore configuration
│   │   ├── schema.ts    # Database schema and events
│   │   ├── adapter.ts   # Expo SQLite adapter
│   │   ├── provider.tsx # LiveStoreProvider wrapper
│   │   └── queries.ts   # Reactive queries
│   ├── services/        # Effect-powered services
│   │   ├── auth-client.ts   # Authentication service (mocked)
│   │   ├── global-config.ts # Configuration service
│   │   ├── livestore.ts     # Livestore service
│   │   ├── logging.ts       # Logging service
│   │   └── runtime.ts       # App runtime
│   └── types/           # TypeScript type definitions
├── app.json             # Expo configuration
├── babel.config.js      # Babel configuration
├── eslint.config.js     # ESLint configuration
├── metro.config.js      # Metro bundler configuration
├── nativewind-env.d.ts  # NativeWind type definitions (must be in root)
├── package.json         # Project dependencies
├── postcss.config.js    # PostCSS configuration for Tailwind
└── tsconfig.json        # TypeScript configuration
```

## Development Guide

### Livestore Implementation

#### Schema (`src/livestore/schema.ts`)

Defines the database schema and state:

- **Tables**: SQLite tables for `users` and `config`
- **Events**: `userCreated` and `configSet` events for data mutations
- **Materializers**: Event processors for updating SQLite tables

#### Adapter (`src/livestore/adapter.ts`)

Configures `@livestore/adapter-expo` for SQLite persistence.

#### Provider (`src/livestore/provider.tsx`)

Wraps `LiveStoreProvider` with Effect-based configuration resolution.

#### Queries (`src/livestore/queries.ts`)

Reactive queries using `queryDb`:

- `config$` - Configuration data
- `userById$` - User data by ID
- `currentUser$` - Current authenticated user

#### Usage Example

```typescript
import { useQuery } from "@livestore/react";
import { currentUser$ } from "@/livestore/queries";

const Welcome = () => {
  const { name } = useQuery(currentUser$);
  return <Text>Welcome {name}!</Text>;
};
```

### TypeScript Configuration

#### Path Aliases

The project uses TypeScript path aliases for cleaner imports:

```typescript
import { schema } from "@/livestore/schema";
import { Livestore } from "@/services/livestore";
```

Configured in `tsconfig.json` with the `@/*` alias mapping to `./src/*`.

#### Type Definitions

- `nativewind-env.d.ts` - NativeWind/React Native CSS types (must be in root)
- `src/types/` - Custom type definitions and module augmentations

### Services Layer

The services layer uses Effect to provide dependency injection and configuration management. All services are bundled into `AppRuntime` for easy consumption.

#### Available Services

| Service        | Purpose                                         |
| -------------- | ----------------------------------------------- |
| `GlobalConfig` | Environment variables and session configuration |
| `Livestore`    | Livestore access with configuration resolution  |
| `AuthClient`   | Authentication interface (currently mocked)     |
| `Logging`      | Custom logger with Effect integration           |

#### Runtime Usage (`src/services/runtime.ts`)

```typescript
import { Effect } from "effect";
import { AppRuntime } from "@/services/runtime";
import { AuthClient } from "@/services/auth-client";

const program = Effect.gen(function* () {
  const { getToken } = yield* AuthClient;
  const token = yield* getToken();
  yield* Effect.logInfo("Retrieved auth token");
  return token;
});

const token = await AppRuntime.runPromise(program);
```

#### Livestore Service

The `Livestore` service enables code outside React components to read configuration state:

```typescript
import { Effect } from "effect";
import { Livestore } from "@/services/livestore";
import { AppRuntime } from "@/services/runtime";

const program = Effect.gen(function* () {
  const { sessionID } = yield* Livestore.getConfig();
  return sessionID;
});

const sessionID = await AppRuntime.runPromise(program);
```

### React Compiler

The project uses the **React 19 Compiler** for automatic performance optimizations:

#### Benefits

- Automatic memoization - no manual `useMemo`, `useCallback`, or `React.memo` needed
- Reduced boilerplate code
- Improved re-render efficiency
- Build-time optimization

#### Configuration

- ESLint plugin: `eslint-plugin-react-compiler` (v19.1.0-rc.2)
- Runs automatically during development and production builds
- Follow ESLint warnings to ensure optimal compiler results

### Git Hooks

The project uses Husky for automated code quality checks:

- **Pre-commit**: Runs Prettier on staged files via `lint-staged`
- **Setup**: Automatically configured by `bun prepare` (runs after `bun install`)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow the existing code style
- Run `bun lint` before committing
- Prettier will auto-format your code on commit

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Roadmap

- [ ] Resolve Livestore adapter compatibility with Expo SDK 54
- [ ] Implement remote sync with Cloudflare Durable Objects
- [ ] Add end-to-end encryption
- [ ] Replace mocked AuthClient with serverless authentication
- [ ] Add iOS support
- [ ] Enable Livestore devtools for debugging

## Acknowledgments

- [Livestore](https://github.com/livestore/livestore) - Local-first state management
- [Expo](https://expo.dev/) - React Native framework
- [Effect](https://effect.website/) - Functional programming for TypeScript
- [NativeWind](https://www.nativewind.dev/) - Tailwind CSS for React Native
