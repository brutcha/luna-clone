# Luna Clone

A local-first mobile app built with Expo and Livestore. This is an Android-only app that uses local-first architecture with SQLite persistence and reactive state management.

## Architecture

- **Client** (`src/app.tsx`): React Native app built with Expo
- **Platform**: Android only
- **Local Database**: Livestore SQLite with Expo adapter (local persistence enabled; multi-tenant sync TBD)
- **Remote Sync**: Powered by Livestore sync engine with Cloudflare Durable Objects currently planned as the remote storage
- **Sync Engine**: Livestore
- **State Management**: Livestore with reactive queries
- **Encryption**: TBD: Livestore will hopefully provide this in the future, otherwise need to implement own encryption before release
- **Configuration**: Effect-based services (`GlobalConfig`, `Livestore`, `Logging`, `AuthClient`)
- **Authorization**: Mocked `AuthClient` Effect service interface, serverless solution is preferred for live implementation
- **Conflict Resolution**: TBD: Latest wins strategy (implemented by Livestore sync engine) is enough for now, could be improved with conflict resolution logic in the future
- **UI**: NativeWind (Tailwind CSS for React Native)

## Tech Stack

- **Expo** (v54) - React Native framework with dev client
- **Livestore** (v0.3.1) - Local-first state management and sync
  - `@livestore/adapter-expo` - Expo SQLite persistence adapter (awaiting Livestore update to support Expo v54)
  - `@livestore/react` - React hooks for Livestore
  - `@livestore/devtools-expo` - Development tools (currently not supported, need to be validated with Expo v54)
  - `@livestore/sync-cf` - Cloudflare sync (TODO)
- **React** (v19.1) - UI framework
- **React Native** (v0.81.4) - Mobile framework
- **NativeWind** (v5 preview) - Tailwind CSS for React Native
- **TypeScript** (v5.9.3) - Type safety
- **Effect** (v3.15.4) - Service layer, configuration, and logging primitives

## Getting Started

### Prerequisites

- Bun >= 1.0.0 (JavaScript runtime and package manager)
- Android Studio and Android SDK (for Android development)

### Setup

1. **Install dependencies**:

   ```bash
   bun install
   ```

2. **Set up environment variables**:

   Create a `.env.local` file by copying the example:

   ```bash
   cp .env.example .env.local
   ```

   Configure optional environment variables:
   - `EXPO_PUBLIC_LOG_LEVEL` (`Debug` | `Info` | `Warn` | `Error` | `Fatal` | `Trace`, default: `Info`)

3. **Start the app** (builds and runs on Android):

   ```bash
   bun start
   ```

### Available Scripts

- `bun start` - Launch the Expo development server
- `bun build:android` - Build the Android app with Expo
- `bun build:android:debug` - Build the Android app in debug mode
- `bun lint` - Run Expo's ESLint configuration

## Project Structure

```
luna-clone/
├── assets/              # Images and static assets
├── docs/                # Documentation
│   ├── adr/             # Architecture Decision Records
├── src/                 # Source code
│   ├── index.ts         # Entry point
│   ├── app.tsx          # Main app component with LiveStoreProvider
│   ├── global.css       # Global styles (NativeWind/Tailwind)
│   ├── domain/          # Domain-level schemas and error types
│   ├── livestore/       # Livestore configuration and provider
│   │   ├── schema.ts    # Database schema and state definitions
│   │   ├── adapter.ts   # Expo SQLite adapter configuration
│   │   ├── provider.tsx # LiveStoreProvider wrapper with config lookup
│   │   └── queries.ts   # Reactive queries for data access
│   ├── services/        # Effect-powered services (config, auth, logging, livestore)
├── .prettierrc          # Prettier configuration
├── app.json             # Expo configuration
├── babel.config.js      # Babel configuration
├── eslint.config.js     # ESLint configuration
├── metro.config.js      # Metro bundler configuration
├── nativewind-env.d.ts  # NativeWind types override (required in root)
├── postcss.config.js    # PostCSS configuration for Tailwind
└── tsconfig.json        # TypeScript configuration
```

## Livestore Implementation

> **Note:** `Livestore.Live` currently aliases the test layer, due to Livestore's SQLite adapter not working with Expo v54 outside of the React Context. Local data persists across restarts, but tenancy is mocked and must be revisited before enabling remote sync.

### Schema (`src/livestore/schema.ts`)

Defines the database schema and state:

- **Tables**: SQLite tables for `users` and `config`
- **Events**: `userCreated` and `configSet` events for updating user and config data
- **Materializers**: SQLite materializers for event processing

### Adapter (`src/livestore/adapter.ts`)

Uses `@livestore/adapter-expo` for SQLite persistence with Expo.

### Provider (`src/livestore/provider.tsx`)

Resolves configuration via Effect services before mounting `LiveStoreProvider`.

### Queries (`src/livestore/queries.ts`)

Reactive queries using `queryDb`:

- `config$` - Query for config data
- `userById$` - Query for user data by ID
- `currentUser$` - Query for current user

### Usage in Components

```typescript
import { useQuery } from "@livestore/react";
import { currentUser$ } from "./livestore/queries";

const Welcome = () => {
  const { name } = useQuery(currentUser$);
  return <Text>Welcome {name}!</Text>;
};
```

## TypeScript

### Path Aliases

The project uses path aliases for cleaner imports:

```typescript
import { schema } from "@/livestore/schema";
import { Livestore } from "@/services/livestore";
```

### Type Definitions

- `nativewind.d.ts` - NativeWind/React Native CSS types, needs to be located in root directory
- Custom type definitions are in `src/types/`: Add new `.d.ts` files here for global types or module augmentations

## Development Tools

- **Husky** - Git hooks for pre-commit checks
- **Lint-staged** - Run Prettier on staged files
- **Prettier** - Code formatting with Tailwind plugin
- **ESLint** - Code linting with Expo config

## Services

The services layer encapsulates Effect-powered dependencies that supply configuration, logging, and authentication capabilities to the app while keeping React components declarative.

- `src/services/livestore.ts` - Provides Livestore access with session configuration getter
- `src/services/global-config.ts` - Loads environment variables and session configuration
- `src/services/logging.ts` - Custom logger implementation powered by Effect
- `src/services/auth-client.ts` - Mocked authentication client interface, live implementation TBD later
- `src/services/runtime.ts` - Bundles service layers into a single `AppRuntime`

### Runtime (`src/services/runtime.ts`)

`AppRuntime` merges all service layers into a single `AppRuntime`, to be used for any `Effect` programs.

```typescript
import { Effect } from "effect";
import { AppRuntime } from "@/services/runtime";
import { AuthClient } from "@/services/auth-client";

const program = Effect.gen(function* () {
  const { getToken } = yield* AuthClient;
  const token = yield* getToken();
  yield* Effect.logInfo(`Retrieved auth token`);
  return token;
});

const token = await AppRuntime.runPromise(program);
```

### Livestore service (`src/services/livestore.ts`)

This service wraps Livestore so code that runs outside React components can read configuration state without touching the React context store: it seeds the database, creates a session ID when needed, and offers a `getConfig()` method.

> **`getConfig()` method:** Returns the Livestore configuration document with the resolved `sessionID`. Callers use it to look up the current session without touching the React provider or the underlying store.
>
> **Mocking note:** `Livestore.Live` resolves to the test provider because Livestore's SQLite adapter currently conflicts with Expo SDK 54, causing runtime failures in the live service. The mock keeps the app running until the version gap closes.

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

The runtime ensures `Livestore`, `GlobalConfig`, `AuthClient`, and the logging service are all provisioned before the program runs.
