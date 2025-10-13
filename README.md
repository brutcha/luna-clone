# Luna Clone

A local-first mobile app built with Expo and Livestore. This is an Android-only app that demonstrates local-first architecture with SQLite persistence and reactive state management.

## Architecture

- **Client** (`src/app.tsx`): React Native app built with Expo
- **Platform**: Android only
- **Local Database**: Livestore SQLite with Expo adapter
- **Remote Sync**: TBD: Cloudflare Durable Objects are prefered
- **Sync Engine**: Livestore
- **State Management**: Livestore with reactive queries
- **Encryption**: TBD: Livestore will hopefully provide this in the future
- **Configuration**: Effect-based services (`GlobalConfig`, `LivestoreConfig`, `Logging`)
- **Authorization**: Mocked `AuthClient` with Effect service interface, serverless solution is preferred for live implementation
- **Conflict Resolution**: TBD: Latest wins strategy is enough for now
- **UI**: NativeWind (Tailwind CSS for React Native)

## Tech Stack

- **Expo** (v54) - React Native framework with dev client
- **Livestore** (v0.3.1) - Local-first state management and sync
  - `@livestore/adapter-expo` - Expo SQLite persistence adapter
  - `@livestore/react` - React hooks for Livestore
  - `@livestore/devtools-expo` - Development tools
  - `@livestore/sync-cf` - Cloudflare sync (TODO)
- **React** (v19.1) - UI framework
- **React Native** (v0.81.4) - Mobile framework
- **NativeWind** (v5 preview) - Tailwind CSS for React Native
- **TypeScript** (v5.9.3) - Type safety
- **Effect** (v3.15.4) - Service layer, configuration, and logging primitives

## Getting Started

### Prerequisites

- Node.js >= 22.20.0
- pnpm >= 10.18.1
- Android Studio and Android SDK (for Android development)

### Setup

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

2. **Set up environment variables**:

   Create a `.env.local` file by copying the example:

   ```bash
   cp .env.example .env.local
   ```

   Update the `.env.local` file with your store ID and sync token.

   Configure optional environment variables:
   - `EXPO_PUBLIC_LOG_LEVEL` (`Debug` | `Info` | `Warn` | `Error` | `Fatal` | `Trace`, default: `Info`)

3. **Start the app** (builds and runs on Android):

   ```bash
   pnpm start
   ```

### Available Scripts

- `pnpm start` - Launch the Expo development server
- `pnpm build:android` - Build the Android app with Expo
- `pnpm build:android:debug` - Build the Android app in debug mode
- `pnpm lint` - Run Expo's ESLint configuration

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
│   ├── services/        # Effect-powered services (config, auth, logging)
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

### Schema (`src/livestore/schema.ts`)

Defines the database schema and state:

- **Tables**: `user` table with client document (SQLite-backed)
- **Events**: `userSet` event for updating user data
- **Materializers**: SQLite materializers for event processing

### Adapter (`src/livestore/adapter.ts`)

Uses `@livestore/adapter-expo` for SQLite persistence with Expo.

### Provider (`src/livestore/provider.tsx`)

Resolves configuration via Effect services before mounting `LiveStoreProvider`.

### Queries (`src/livestore/queries.ts`)

Reactive queries using `queryDb`:

- `user$` - Query for user data

### Usage in Components

```typescript
import { useQuery } from "@livestore/react";
import { user$ } from "./livestore/queries";

const Welcome = () => {
  const { name } = useQuery(user$);
  return <Text>Welcome {name}!</Text>;
};
```

## TypeScript

### Path Aliases

The project uses path aliases for cleaner imports:

```typescript
import { schema } from "@/livestore/schema";
import { user$ } from "@/livestore/queries";
```

### Type Definitions

Custom type definitions are in `src/types/`:

- `nativewind.d.ts` - NativeWind/React Native CSS types
- Add new `.d.ts` files here for global types or module augmentations

## Development Tools

- **Husky** - Git hooks for pre-commit checks
- **Lint-staged** - Run Prettier on staged files
- **Prettier** - Code formatting with Tailwind plugin
- **ESLint** - Code linting with Expo config

## Services

The services layer encapsulates Effect-powered dependencies that supply configuration, logging, and authentication capabilities to the app while keeping React components declarative.

- `src/services/global-config.ts` - Loads environment and logging configuration via Effect
- `src/services/livestore-config.ts` - Provides Livestore identifiers and sync flags
- `src/services/logging.ts` - Effect logger implementation
- `src/services/auth-client.ts` - Mocked authentication client interface
- `src/services/runtime.ts` - Bundles all live service layers into a single `ManagedRuntime`

### Runtime (`src/services/runtime.ts`)

`AppRuntime` merges all live Effect layers so you can execute `Effect` programs anywhere in the app without rebuilding dependencies.

```typescript
import { Effect } from "effect";
import { AppRuntime } from "@/services/runtime";
import { AuthClient } from "@/services/auth-client";

const loadUser = Effect.gen(function* () {
  const { getToken } = yield* AuthClient;
  const token = yield* getToken();
  yield* Effect.logInfo(`Retrieved auth token`);
  return token;
});
 const loadUser = Effect.gen(function* () {
   const { getToken } = yield* AuthClient;
   const token = yield* getToken();
   yield* Effect.logInfo(`Retrieved auth token`);
   return token;
 });
const user = await AppRuntime.runPromise(loadUser);
```

The runtime ensures `GlobalConfig`, `LivestoreConfig`, `AuthClient`, and custom Logger are all provisioned before the program runs.
