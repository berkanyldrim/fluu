import { eq } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';

import { db } from '../db/client.js';
import { profiles, users } from '../db/schema.js';
import { checkUsernameQuerySchema, updateProfileSchema } from '../schemas/users.js';

const usersRoutes: FastifyPluginAsync = async (app) => {
  app.get('/users/me', { preHandler: app.authenticate }, async (request, reply) => {
    const [user] = await db
      .select({ id: users.id, email: users.email, isEmailVerified: users.isEmailVerified })
      .from(users)
      .where(eq(users.id, request.userId))
      .limit(1);

    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, request.userId)).limit(1);

    return reply.send({ user, profile: profile ?? null });
  });

  app.get('/users/check-username', async (request, reply) => {
    const parsed = checkUsernameQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Geçersiz kullanıcı adı formatı' });
    }

    const [existing] = await db
      .select({ userId: profiles.userId })
      .from(profiles)
      .where(eq(profiles.username, parsed.data.u))
      .limit(1);

    return reply.send({ available: !existing });
  });

  app.patch('/users/me', { preHandler: app.authenticate }, async (request, reply) => {
    const parsed = updateProfileSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? 'Geçersiz istek' });
    }

    const { username, firstName, lastName, birthDate, gender, country, city } = parsed.data;

    const [usernameTaken] = await db
      .select({ userId: profiles.userId })
      .from(profiles)
      .where(eq(profiles.username, username))
      .limit(1);
    if (usernameTaken && usernameTaken.userId !== request.userId) {
      return reply.code(409).send({ error: 'Bu kullanıcı adı alınmış' });
    }

    // username unique constraint DB seviyesinde de var (bkz. schema.ts) — yukarıdaki kontrol
    // sadece hızlı/net bir hata mesajı için, asıl güvence bu constraint (iki kişi aynı anda aynı
    // kullanıcı adını alamaz). Constraint tetiklenirse aşağıdaki catch 409'a çevirir.
    try {
      const [profile] = await db
        .insert(profiles)
        .values({
          userId: request.userId,
          username,
          firstName,
          lastName,
          birthDate: new Date(birthDate),
          gender,
          country,
          city,
        })
        .onConflictDoUpdate({
          target: profiles.userId,
          set: {
            username,
            firstName,
            lastName,
            birthDate: new Date(birthDate),
            gender,
            country,
            city,
            updatedAt: new Date(),
          },
        })
        .returning();

      return reply.send({ profile });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === '23505') {
        return reply.code(409).send({ error: 'Bu kullanıcı adı alınmış' });
      }
      throw error;
    }
  });
};

export default usersRoutes;
