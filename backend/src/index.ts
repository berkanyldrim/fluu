import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import Fastify from "fastify";

import { env } from "./env.js";
import { redis } from "./lib/redis.js";
import authPlugin from "./plugins/auth.js";
import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";

const app = Fastify({ logger: true });

// TODO: prod'a çıkmadan önce origin: true kaldırılıp gerçek app domain/scheme'iyle
// whitelist'e çevrilecek (bkz. BACKEND.md "CORS whitelist"). Şu an sadece Expo web (localhost,
// değişken port) + native (Origin header göndermez, CORS'tan etkilenmez) dev ortamı var.
// methods'i elle belirtmek gerekiyor — @fastify/cors'un varsayılanı sadece GET,HEAD,POST,
// PATCH/DELETE kullanan /users/me gibi route'larda preflight'ı sessizce reddediyordu.
await app.register(cors, { origin: true, methods: ['GET', 'POST', 'PATCH', 'DELETE'] });

function formatWaitTime(ms: number) {
  const totalSeconds = Math.ceil(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds} saniye`;
  return `${Math.ceil(totalSeconds / 60)} dakika`;
}

await app.register(rateLimit, {
  global: true,
  max: 100,
  timeWindow: "1 minute",
  redis,
  errorResponseBuilder: (_request, context) => ({
    error: `Çok fazla istek gönderdin, ${formatWaitTime(context.ttl)} sonra tekrar dene`,
  }),
});

await app.register(authPlugin);
await app.register(authRoutes);
await app.register(usersRoutes);

app.get("/health", async () => ({ status: "ok" }));

app.listen({ port: env.PORT, host: "0.0.0.0" }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
