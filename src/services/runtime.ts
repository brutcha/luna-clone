import { Layer, ManagedRuntime } from "effect";
import { LivestoreConfig } from "./livestore-config";
import { GlobalConfig } from "./global-config";
import { AuthClient } from "./auth-client";
import { Logging } from "./logging";

const LayerLive = Layer.mergeAll(
  LivestoreConfig.Live,
  GlobalConfig.Live,
  AuthClient.Live,
  Logging.Live,
);

export const AppRuntime = ManagedRuntime.make(LayerLive);
