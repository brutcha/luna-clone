# ADR: Database Selection

- **Status**: Accepted
- **Date**: 2025-10-11

## Context

The Luna clone app is a menstrual cycle tracker that prioritizes **privacy** so sensitive calendar data stays on the device by default. A local storage solution must offer reliable offline access, integrate with Expo (without ejecting), and play nicely with the TypeScript/React. Cloudflare Durable Objects are currently favored for their price and developer experience, but the remote database will be decided later and may change if requirements demand another service. Any sync remains optional so users can keep data fully local.

## Decision

Use **Livestore with the Expo SQLite adapter** (`@livestore/adapter-expo`). Livestore tracks state changes as a history, which reminds me of Git-style workflows and fits how I'm used to thinking about syncing data. This model is familiar to the Redux store, which I have been using for years. The Livestore packages (adapter, React hooks, optional sync tooling) line up with my privacy goals. Encryption and authorization will be handled at app level. Expo ships SQLite support, so persistence works without custom native code. If I add sync later, I can layer `@livestore/sync-cf` or another backend on top without redoing the core data model.

## Consequences

- Positive: Data stays local unless I (or future users) opt into sync.
- Positive: Livestore queries make it easy to update screens in the app.
- Positive: No ejecting from Expo or maintaining native modules.
- Positive: Open to future privacy-friendly sync like Cloudflare Durable Objects.
- Negative: SQLite might need tuning if the app grows a lot.
- Negative: Livestore's API can change as it matures.
- Negative: Livestore lacks built-in encryption, so I must encrypt sensitive data myself.

## Alternatives Considered

- **ElectricDB**: I don't want to host a database and a API for this app.
- **TanstackDB**: Doesn't really support local-first functionality.
- **RxDB**: I don't like the pricing model.
- **Triplit**: Needs to be synced, I want to sync to be opt-in.
- **Evolu**: Needs to be synced, I want to sync to be opt-in.
- **TinyBase**: I didn't like the api.
- **WatermelonDB**: I didn't like the api.
- **JazzTools**: Is focused to multiplayer interactions, not great fit.
- **VLCN**: Docs are pretty thin, i don't really trust it.
