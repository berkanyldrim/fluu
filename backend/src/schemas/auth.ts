import { z } from 'zod';

// Client'tan gelen hiçbir veri doğrulanmadan kullanılmaz (bkz. PROJE_KURALLARI.md) — frontend
// zaten aynı şifre kurallarını uyguluyor (frontend/src/schemas/auth.ts) ama sunucu kendi
// doğrulamasını bağımsız yapar, frontend'in kontrolüne güvenmez.
const passwordSchema = z
  .string()
  .min(8, 'En az 8 karakter olmalı')
  .regex(/[a-z]/, 'En az bir küçük harf içermeli')
  .regex(/[A-Z]/, 'En az bir büyük harf içermeli')
  .regex(/[0-9]/, 'En az bir rakam içermeli');

export const registerSchema = z.object({
  email: z.email(),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const sendVerificationOtpSchema = z.discriminatedUnion('purpose', [
  z.object({ purpose: z.literal('register') }),
  z.object({ purpose: z.literal('reset'), email: z.email() }),
]);

export const verifyEmailSchema = z.discriminatedUnion('purpose', [
  z.object({ purpose: z.literal('register'), code: z.string().length(6) }),
  z.object({ purpose: z.literal('reset'), email: z.email(), code: z.string().length(6) }),
]);

export const resetPasswordSchema = z.object({
  resetToken: z.string().min(1),
  newPassword: passwordSchema,
});
