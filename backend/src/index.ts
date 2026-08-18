import Fastify from "fastify";

import { env } from "./env.js";

const app = Fastify({ logger: true });

app.get("/health", async () => ({ status: "ok" }));

app.listen({ port: env.PORT, host: "0.0.0.0" }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
