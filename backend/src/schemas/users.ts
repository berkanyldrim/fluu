import { z } from 'zod';

const TURKEY = 'Türkiye';

export const checkUsernameQuerySchema = z.object({
  u: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-z0-9_]+$/),
});

const MIN_AGE = 18;

function isAtLeastMinAge(birthDate: Date, today: Date = new Date()): boolean {
  let age = today.getFullYear() - birthDate.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age >= MIN_AGE;
}

export const updateProfileSchema = z
  .object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    username: z
      .string()
      .min(3)
      .max(20)
      .regex(/^[a-z0-9_]+$/, 'Sadece küçük harf, rakam ve _ kullanabilirsin'),
    birthDate: z.iso.date(),
    gender: z.enum(['female', 'male', 'other']),
    country: z.string().min(1).max(100),
    // city: yalnızca country="Türkiye" olduğunda dolu olmalı, aksi halde null — tam il listesiyle
    // eşleşip eşleşmediği burada doğrulanmıyor (bkz. FRONTEND.md/BACKEND.md notu), sadece
    // ülke/şehir tutarlılığı kontrol ediliyor.
    city: z.string().min(1).max(100).nullable(),
  })
  .refine((data) => isAtLeastMinAge(new Date(data.birthDate)), {
    message: '18 yaşından büyük olmalısın',
    path: ['birthDate'],
  })
  .refine((data) => (data.country === TURKEY ? Boolean(data.city) : data.city === null), {
    message: 'Türkiye dışı ülkelerde şehir alanı boş olmalı, Türkiye seçiliyse dolu olmalı',
    path: ['city'],
  });
