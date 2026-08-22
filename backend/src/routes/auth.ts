import { and, desc, eq, gt, isNull } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';

import { db } from '../db/client.js';
import { emailOtps, refreshTokens, users } from '../db/schema.js';
import { sendOtpEmail } from '../lib/mailer.js';
import { generateOtpCode, OTP_TTL_MS } from '../lib/otp.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import {
  generateRefreshToken,
  hashOpaqueToken,
  REFRESH_TOKEN_TTL_MS,
  signAccessToken,
  signResetToken,
  verifyResetToken,
} from '../lib/tokens.js';
import { getAuthenticatedUserId } from '../plugins/auth.js';
import {
  loginSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
  sendVerificationOtpSchema,
  verifyEmailSchema,
} from '../schemas/auth.js';

const GENERIC_LOGIN_ERROR = 'E-posta veya şifre hatalı';
const GENERIC_OTP_ERROR = 'Kod geçersiz veya süresi dolmuş';

async function issueTokenPair(userId: string) {
  const accessToken = signAccessToken(userId);
  const refreshToken = generateRefreshToken();

  await db.insert(refreshTokens).values({
    userId,
    tokenHash: hashOpaqueToken(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  });

  return { accessToken, refreshToken };
}

async function issueOtp(userId: string, email: string, purpose: 'register' | 'reset') {
  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);
  await db.insert(emailOtps).values({
    userId,
    codeHash: hashOpaqueToken(code),
    purpose,
    expiresAt,
  });
  await sendOtpEmail(email, code, purpose);
  return { expiresAt };
}

const authRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    '/auth/register',
    { config: { rateLimit: { max: 5, timeWindow: '15 minutes' } } },
    async (request, reply) => {
      const parsed = registerSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? 'Geçersiz istek' });
      }
      const email = parsed.data.email.toLowerCase();

      const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
      if (existing) {
        return reply.code(409).send({ error: 'Bu e-posta zaten kayıtlı' });
      }

      const passwordHash = await hashPassword(parsed.data.password);
      const [user] = await db
        .insert(users)
        .values({ email, passwordHash })
        .returning({ id: users.id, email: users.email, isEmailVerified: users.isEmailVerified });

      const { expiresAt } = await issueOtp(user.id, user.email, 'register');

      const tokens = await issueTokenPair(user.id);
      return reply.code(201).send({ ...tokens, user, otpExpiresAt: expiresAt.toISOString() });
    },
  );

  app.post(
    '/auth/login',
    { config: { rateLimit: { max: 10, timeWindow: '15 minutes' } } },
    async (request, reply) => {
      const parsed = loginSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: 'Geçersiz istek' });
      }
      const email = parsed.data.email.toLowerCase();

      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (!user || user.status === 'deleted') {
        return reply.code(401).send({ error: GENERIC_LOGIN_ERROR });
      }

      const validPassword = await verifyPassword(user.passwordHash, parsed.data.password);
      if (!validPassword) {
        return reply.code(401).send({ error: GENERIC_LOGIN_ERROR });
      }

      if (user.status === 'frozen') {
        return reply.code(403).send({ error: 'Hesabın dondurulmuş' });
      }

      const tokens = await issueTokenPair(user.id);
      return reply.send({
        ...tokens,
        user: { id: user.id, email: user.email, isEmailVerified: user.isEmailVerified },
      });
    },
  );

  app.post(
    '/auth/refresh',
    { config: { rateLimit: { max: 20, timeWindow: '15 minutes' } } },
    async (request, reply) => {
      const parsed = refreshSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: 'Geçersiz istek' });
      }

      const tokenHash = hashOpaqueToken(parsed.data.refreshToken);
      const [stored] = await db
        .select()
        .from(refreshTokens)
        .where(eq(refreshTokens.tokenHash, tokenHash))
        .limit(1);

      if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
        return reply.code(401).send({ error: 'Geçersiz veya süresi dolmuş oturum' });
      }

      await db.update(refreshTokens).set({ revokedAt: new Date() }).where(eq(refreshTokens.id, stored.id));

      const tokens = await issueTokenPair(stored.userId);
      return reply.send(tokens);
    },
  );

  app.post(
    '/auth/logout',
    { config: { rateLimit: { max: 20, timeWindow: '15 minutes' } } },
    async (request, reply) => {
      const parsed = refreshSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: 'Geçersiz istek' });
      }

      const tokenHash = hashOpaqueToken(parsed.data.refreshToken);
      await db
        .update(refreshTokens)
        .set({ revokedAt: new Date() })
        .where(and(eq(refreshTokens.tokenHash, tokenHash), isNull(refreshTokens.revokedAt)));

      return reply.send({ ok: true });
    },
  );

  app.post(
    '/auth/send-verification-otp',
    { config: { rateLimit: { max: 3, timeWindow: '10 minutes' } } },
    async (request, reply) => {
      const parsed = sendVerificationOtpSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: 'Geçersiz istek' });
      }

      if (parsed.data.purpose === 'register') {
        const userId = await getAuthenticatedUserId(request);
        if (!userId) return reply.code(401).send({ error: 'Yetkilendirme gerekli' });

        const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (!user) return reply.code(401).send({ error: 'Yetkilendirme gerekli' });

        const { expiresAt } = await issueOtp(user.id, user.email, 'register');
        return reply.send({ ok: true, otpExpiresAt: expiresAt.toISOString() });
      }

      // purpose === 'reset': hesap var mı yok mu sızdırmamak için her durumda aynı yanıt
      // (aynı otpExpiresAt hesaplama biçimi dahil) dönülür.
      const email = parsed.data.email.toLowerCase();
      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      const expiresAt =
        user && user.status === 'active'
          ? (await issueOtp(user.id, user.email, 'reset')).expiresAt
          : new Date(Date.now() + OTP_TTL_MS);
      return reply.send({ ok: true, otpExpiresAt: expiresAt.toISOString() });
    },
  );

  app.post(
    '/auth/verify-email',
    { config: { rateLimit: { max: 10, timeWindow: '15 minutes' } } },
    async (request, reply) => {
      const parsed = verifyEmailSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: 'Geçersiz istek' });
      }

      let userId: string;
      if (parsed.data.purpose === 'register') {
        const authedUserId = await getAuthenticatedUserId(request);
        if (!authedUserId) return reply.code(401).send({ error: 'Yetkilendirme gerekli' });
        userId = authedUserId;
      } else {
        const email = parsed.data.email.toLowerCase();
        const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
        if (!user) return reply.code(400).send({ error: GENERIC_OTP_ERROR });
        userId = user.id;
      }

      const codeHash = hashOpaqueToken(parsed.data.code);
      const [otp] = await db
        .select()
        .from(emailOtps)
        .where(
          and(
            eq(emailOtps.userId, userId),
            eq(emailOtps.purpose, parsed.data.purpose),
            eq(emailOtps.codeHash, codeHash),
            isNull(emailOtps.consumedAt),
            gt(emailOtps.expiresAt, new Date()),
          ),
        )
        .orderBy(desc(emailOtps.createdAt))
        .limit(1);

      if (!otp) {
        return reply.code(400).send({ error: GENERIC_OTP_ERROR });
      }

      await db.update(emailOtps).set({ consumedAt: new Date() }).where(eq(emailOtps.id, otp.id));

      if (parsed.data.purpose === 'register') {
        await db.update(users).set({ isEmailVerified: true }).where(eq(users.id, userId));
        return reply.send({ ok: true });
      }

      const resetToken = signResetToken(userId);
      return reply.send({ ok: true, resetToken });
    },
  );

  app.post(
    '/auth/reset-password',
    { config: { rateLimit: { max: 5, timeWindow: '15 minutes' } } },
    async (request, reply) => {
      const parsed = resetPasswordSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? 'Geçersiz istek' });
      }

      const payload = verifyResetToken(parsed.data.resetToken);
      if (!payload) {
        return reply.code(401).send({ error: 'Kod geçersiz veya süresi dolmuş, tekrar dene' });
      }

      const passwordHash = await hashPassword(parsed.data.newPassword);
      await db.update(users).set({ passwordHash }).where(eq(users.id, payload.userId));

      // Şifre değişince tüm mevcut refresh token'lar iptal edilir — başka bir cihaz/oturumda
      // açık kalmış eski bir session, şifre sıfırlandıktan sonra da geçerli kalmasın.
      await db
        .update(refreshTokens)
        .set({ revokedAt: new Date() })
        .where(and(eq(refreshTokens.userId, payload.userId), isNull(refreshTokens.revokedAt)));

      return reply.send({ ok: true });
    },
  );
};

export default authRoutes;
