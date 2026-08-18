import {
  boolean,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const userStatusEnum = pgEnum('user_status', ['active', 'frozen', 'deleted']);
export const genderEnum = pgEnum('gender', ['female', 'male', 'other']);
export const emailOtpPurposeEnum = pgEnum('email_otp_purpose', ['register', 'reset']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  // status=deleted: hard delete değil, anonymize — bkz. BACKEND.md "Hesap silme" notu.
  // messages.sender_id başka kullanıcıların sohbet geçmişine referans verdiği için satır kalır.
  status: userStatusEnum('status').notNull().default('active'),
  isEmailVerified: boolean('is_email_verified').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const profiles = pgTable('profiles', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  // username: benzersizlik burada DB seviyesinde garanti edilir (unique constraint) —
  // /users/check-username sadece UX için anlık geri bildirim, kayıt anında yine bu constraint'e
  // güvenilir (bkz. BACKEND.md "Girdi doğrulama & injection").
  username: varchar('username', { length: 20 }).notNull().unique(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  bio: varchar('bio', { length: 500 }),
  avatarUrl: varchar('avatar_url', { length: 1024 }),
  // age yerine birth_date saklanır — statik bir "age" alanı her yıl elle güncellenmesi gereken
  // bir bakım tuzağı olurdu, yaş her zaman birth_date'ten hesaplanır.
  birthDate: timestamp('birth_date', { mode: 'date' }).notNull(),
  gender: genderEnum('gender').notNull(),
  country: varchar('country', { length: 100 }).notNull(),
  // city: sadece country="Türkiye" ise dolu olabilir, aksi halde null — client'tan gelen değere
  // güvenmeden bu kural sunucuda da doğrulanır (bkz. FRONTEND.md onboarding notu).
  city: varchar('city', { length: 100 }),
  isVerified: boolean('is_verified').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  // Refresh token'ın kendisi DB'de asla düz metin tutulmaz, sadece hash'i — bkz. BACKEND.md
  // "Auth & oturum".
  tokenHash: varchar('token_hash', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const emailOtps = pgTable('email_otps', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  // Kod da refresh token gibi hash'lenerek saklanır, düz metin asla.
  codeHash: varchar('code_hash', { length: 255 }).notNull(),
  purpose: emailOtpPurposeEnum('purpose').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  consumedAt: timestamp('consumed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
