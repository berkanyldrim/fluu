import { eq } from 'drizzle-orm';
import fp from 'fastify-plugin';
import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';

import { db } from '../db/client.js';
import { users } from '../db/schema.js';
import { verifyAccessToken } from '../lib/tokens.js';

declare module 'fastify' {
  interface FastifyRequest {
    userId: string;
  }
  interface FastifyInstance {
    authenticate: typeof authenticate;
  }
}

// Route handler'lardan da doğrudan çağrılabilir (ör. send-verification-otp/verify-email —
// purpose'a göre auth zorunlu olup olmadığı değiştiği için tüm route'a preHandler uygulanamıyor).
export async function getAuthenticatedUserId(request: FastifyRequest): Promise<string | null> {
  const header = request.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;
  if (!token) return null;

  const payload = verifyAccessToken(token);
  if (!payload) return null;

  // Token imzası geçerli olsa bile hesap o an dondurulmuş/silinmiş olabilir — bkz. BACKEND.md
  // "Her istekte iki ayrı kontrol katmanı çalışır: kimlik doğrulama ve yetkilendirme".
  const [user] = await db.select().from(users).where(eq(users.id, payload.userId)).limit(1);
  if (!user || user.status !== 'active') return null;

  return user.id;
}

async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return reply.code(401).send({ error: 'Yetkilendirme gerekli' });
  }
  request.userId = userId;
}

const authPlugin: FastifyPluginAsync = async (app) => {
  app.decorate('authenticate', authenticate);
};

export default fp(authPlugin);
