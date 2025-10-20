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
- **@effect-atom/atom-react** (v0.3.3) - Reactive atoms with Effect integration

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
- **Local Database**: Multi-tenant SQLite with Expo adapter
- **State Management**: Livestore with reactive queries + Effect atoms for services

### Multi-Tenancy Architecture

The app uses a **dual-database architecture** for multi-tenancy:

- **System Database** (`luna-system`) - Stores cross-user configuration (sessionID, sync settings)
- **User Databases** (`luna-{sessionID}`) - Isolated per-user data (cycle data, symptoms, etc.)

This architecture enables:

- Persistent anonymous sessions that survive app restarts
- Seamless transition from anonymous to authenticated users
- Cross-device sync for authenticated users (sessionID = userId)
- Data isolation between users on shared devices

### State Management Patterns

**Livestore** - For user domain data (queries, mutations)
**Effect Atoms** - For service layer and cross-cutting concerns (auth, config)

Effect atoms provide reactive state with Effect integration, allowing service logic to be accessed from React components while maintaining Suspense compatibility.

### Planned Features

- **Remote Sync**: Cloudflare Durable Objects via Livestore sync engine (TBD)
- **Encryption**: Awaiting Livestore native support or custom implementation (TBD)
- **Authorization**: Serverless solution preferred for production (currently mocked)
- **Conflict Resolution**: Latest-wins strategy (Livestore default) - may be enhanced later

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
| `bun typecheck`     | Run TypeScript type checking                              |
| `bun prepare`       | Set up Husky git hooks (runs automatically after install) |

## Project Structure

```text
luna-clone/
├── assets/              # Images and static assets
├── docs/                # Documentation
│   └── adr/             # Architecture Decision Records
├── src/                 # Source code
│   ├── index.ts         # Entry point
│   ├── app.tsx          # Main app component
│   ├── global.css       # Global styles (NativeWind/Tailwind)
│   ├── components/      # React components
│   │   ├── cycle-ring/  # Cycle ring component
│   │   └── ui/          # UI primitives
│   ├── domain/          # Domain models and error types
│   ├── helpers/         # Utility helpers
│   └── lib/             # Core libraries
│       ├── atoms/       # Effect atoms (reactive service state)
│       ├── hooks/       # Custom React hooks
│       ├── livestore/   # Livestore configuration
│       │   ├── schema.ts        # User database schema
│       │   ├── system-schema.ts # System database schema
│       │   ├── adapter.ts       # Expo SQLite adapter
│       │   └── queries.ts       # Reactive queries
│       ├── providers/   # React context providers
│       │   └── livestore-provider.tsx # LiveStoreProvider wrapper
│       └── services/    # Effect services (auth, session, config, logging)
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

#### User Database Schema

Defines tables, events, and materializers for user-specific data (cycles, symptoms, etc.). Each user gets an isolated database instance.

#### System Database Schema

Defines tables for cross-user configuration (sessionID, sync settings). Single shared database for system-level state.

#### Adapter

Configures `@livestore/adapter-expo` for SQLite persistence with proper SQL.js configuration.

#### Provider

Wraps `LiveStoreProvider` and manages per-user store lifecycle. Uses session hooks to determine the correct database instance.

#### Queries

Reactive queries using Livestore's `queryDb` pattern. Queries automatically re-run when underlying data changes.

**Pattern:**

```typescript
import { useQuery } from "@livestore/react";

// Use reactive queries in components
const MyComponent = () => {
  const data = useQuery(myQuery$);
  return <View>{/* render data */}</View>;
};
```

### Effect Services

Services use Effect.Service pattern for dependency management and lifecycle control. Services are scoped, ensuring proper resource cleanup.

#### Available Services

- **AuthService** - Manages sessionID lifecycle, login/logout
- **SessionStoreService** - Manages system database for session persistence
- **LivestoreService** - Provides access to user Livestore instance
- **GlobalConfigService** - Environment variables and app configuration
- **LoggingService** - Structured logging with Effect integration

### Effect Atoms

Effect atoms bridge Effect services with React components, providing reactive state with Suspense support.

#### Atom Pattern

**Pattern:**

```typescript
// In atom file
const myRuntime = Atom.runtime(MyServiceLayer);
export const myAtom = myRuntime.atom(
  Effect.gen(function* () {
    const service = yield* MyService;
    return yield* service.getData();
  })
);

// In component
import { useAtomSuspense } from "@effect-atom/atom-react";

const MyComponent = () => {
  const { value } = useAtomSuspense(myAtom);
  return <Text>{value}</Text>;
};
```

### TypeScript Configuration

#### Path Aliases

The project uses TypeScript path aliases for cleaner imports:

```typescript
import { schema } from "@/lib/livestore/schema";
import { LivestoreService } from "@/lib/services/livestore-service";
```

Configured in `tsconfig.json` with the `@/*` alias mapping to `./src/*`.

#### Type Definitions

- `nativewind-env.d.ts` - NativeWind/React Native CSS types (must be in root)
- `src/types/` - Custom type definitions and module augmentations

### Authentication & Sessions

#### SessionID Lifecycle

SessionID is managed by AuthService with the following behavior:

- **Anonymous users**: SessionID is auto-generated and persisted in system database
- **Authenticated users**: SessionID equals userId for cross-device sync
- **Logout**: Creates new anonymous sessionID

#### Multi-Device Sync

When a user logs in with their userId:

1. SessionID is set to userId
2. User database changes from `luna-{randomID}` to `luna-{userId}`
3. Same database is used across all user's devices
4. Livestore sync handles data replication

#### Session Persistence

SessionID persists in the system database, surviving app restarts. On first launch:

1. AuthService checks system database for existing sessionID
2. If none exists, generates new anonymous sessionID
3. SessionID is used to determine which user database to load

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
