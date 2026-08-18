import rateLimit from "@fastify/rate-limit";
import Fastify from "fastify";

import { env } from "./env.js";
import { redis } from "./lib/redis.js";
import authPlugin from "./plugins/auth.js";
import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";

const app = Fastify({ logger: true });

await app.register(rateLimit, {
  global: true,
  max: 100,
  timeWindow: "1 minute",
  redis,
});

await app.register(authPlugin);
await app.register(authRoutes);
await app.register(usersRoutes);

app.get("/health", async () => ({ status: "ok" }));

app.listen({ port: env.PORT, host: "0.0.0.0" }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
