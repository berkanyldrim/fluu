import { z } from 'zod';

import { isAtLeastMinAge, isValidUsernameFormat } from '@/utils/auth-validation';

export const registerSchema = z
  .object({
    email: z.string().min(1, 'E-posta gerekli').email('Geçerli bir e-posta adresi gir'),
    password: z
      .string()
      .min(8, 'En az 8 karakter olmalı')
      .regex(/[a-z]/, 'En az bir küçük harf içermeli')
      .regex(/[A-Z]/, 'En az bir büyük harf içermeli')
      .regex(/[0-9]/, 'En az bir rakam içermeli'),
    passwordConfirm: z.string().min(1, 'Şifreni tekrar gir'),
    acceptedTerms: z.literal(true, { message: 'Devam etmek için koşulları kabul etmelisin' }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Şifreler eşleşmiyor',
    path: ['passwordConfirm'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const personalInfoSchema = z
  .object({
    firstName: z.string().min(1, 'İsim gerekli'),
    lastName: z.string().min(1, 'Soyisim gerekli'),
    username: z
      .string()
      .min(3, 'En az 3 karakter olmalı')
      .max(20, 'En fazla 20 karakter olmalı')
      .refine(isValidUsernameFormat, 'Sadece küçük harf, rakam ve _ kullanabilirsin'),
    birthDate: z.date({ message: 'Doğum tarihini seç' }),
    gender: z.enum(['female', 'male', 'other'], { message: 'Cinsiyet seçmelisin' }),
    country: z.string().min(1, 'Ülke seçmelisin'),
    city: z.string().nullable(),
  })
  .refine((data) => isAtLeastMinAge(data.birthDate), {
    message: "Fluu'yu kullanabilmek için 18 yaşından büyük olman gerekiyor",
    path: ['birthDate'],
  })
  .refine((data) => data.country !== 'Türkiye' || Boolean(data.city), {
    message: 'Şehir seçmelisin',
    path: ['city'],
  });

export type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;
