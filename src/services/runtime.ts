import { Layer, ManagedRuntime } from "effect";

import { Livestore } from "./livestore";
import { GlobalConfig } from "./global-config";
import { AuthClient } from "./auth-client";
import { Logging } from "./logging";

const LayerLive = Layer.mergeAll(
  Livestore.Live,
  GlobalConfig.Live,
  AuthClient.Live,
  Logging.Live,
);

export const AppRuntime = ManagedRuntime.make(LayerLive);
