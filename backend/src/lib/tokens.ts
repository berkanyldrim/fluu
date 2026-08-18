import { createHash, randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';

import { env } from '../env.js';

const ACCESS_TOKEN_TTL = '20m';
const RESET_TOKEN_TTL = '10m';
export const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 gün

type AccessTokenPayload = {
  sub: string;
  type: 'access';
};

type ResetTokenPayload = {
  sub: string;
  type: 'password_reset';
};

export function signAccessToken(userId: string): string {
  return jwt.sign({ sub: userId, type: 'access' } satisfies AccessTokenPayload, env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  });
}

export function verifyAccessToken(token: string): { userId: string } | null {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
    if (payload.type !== 'access') return null;
    return { userId: payload.sub };
  } catch {
    return null;
  }
}

export function signResetToken(userId: string): string {
  return jwt.sign({ sub: userId, type: 'password_reset' } satisfies ResetTokenPayload, env.JWT_SECRET, {
    expiresIn: RESET_TOKEN_TTL,
  });
}

export function verifyResetToken(token: string): { userId: string } | null {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as ResetTokenPayload;
    if (payload.type !== 'password_reset') return null;
    return { userId: payload.sub };
  } catch {
    return null;
  }
}

// Refresh token'lar JWT değil — rastgele, yüksek entropili opak string. DB'de sadece hash'i
// tutulur (bkz. hashOpaqueToken) ki bu sayede tek tek geçersiz kılınabilir/rotasyona
// uğrayabilirler; bir JWT imza doğrulamasıyla stateless kontrol edilseydi rotasyon/iptal
// mümkün olmazdı.
export function generateRefreshToken(): string {
  return randomBytes(48).toString('hex');
}

// SHA-256 kasıtlı: hem refresh token hem OTP kodu zaten yüksek entropili/kısa ömürlü veriler,
// argon2'nin yavaşlığı burada güvenlik katmıyor (asıl koruma rate limiting + expiry'den geliyor)
// — şifre hash'lemede (bkz. lib/password.ts) argon2 kullanılmasının sebebi farklı: şifreler
// düşük entropili ve kullanıcı tarafından tekrar girilebilir olduğu için çevrimdışı brute-force'a
// karşı yavaş hash gerekiyor, opak token/OTP'de bu tehdit modeli geçerli değil.
export function hashOpaqueToken(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}
