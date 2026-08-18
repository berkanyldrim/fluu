import { randomInt } from 'node:crypto';

export const OTP_TTL_MS = 10 * 60 * 1000; // 10 dakika
export const OTP_LENGTH = 6;

export function generateOtpCode(): string {
  return String(randomInt(0, 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, '0');
}
