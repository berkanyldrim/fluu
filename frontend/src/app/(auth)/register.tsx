import { router } from 'expo-router';
import { useState } from 'react';

import { AuthScreen } from '@/components/auth/auth-screen';
import { BottomRow } from '@/components/auth/bottom-row';
import { CheckboxRow } from '@/components/auth/checkbox-row';
import { FieldError } from '@/components/auth/field-error';
import { PasswordField } from '@/components/auth/password-field';
import { PrimaryButton } from '@/components/auth/primary-button';
import { TextField } from '@/components/auth/text-field';
import { ApiError } from '@/lib/api-client';
import { registerSchema } from '@/schemas/auth';
import { useAuthStore } from '@/store/auth-store';

type FormErrors = Partial<Record<'email' | 'password' | 'passwordConfirm' | 'acceptedTerms', string>>;

export default function RegisterScreen() {
  const register = useAuthStore((state) => state.register);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    const result = registerSchema.safeParse({ email, password, passwordConfirm, acceptedTerms });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
        passwordConfirm: fieldErrors.passwordConfirm?.[0],
        acceptedTerms: fieldErrors.acceptedTerms?.[0],
      });
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { otpExpiresAt } = await register(normalizedEmail, password);
      router.push({
        pathname: '/verify-otp',
        params: { purpose: 'register', email: normalizedEmail, otpExpiresAt },
      });
    } catch (err) {
      setErrors({ email: err instanceof ApiError ? err.message : 'Bir şeyler ters gitti, tekrar dene' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen
      title="Hesap Oluştur"
      description="Anonim profilin birkaç adımda hazır."
      footer={<BottomRow question="Zaten hesabın var mı?" actionTitle="Giriş yap" onPress={() => router.push('/login')} />}>
      <TextField
        placeholder="E-posta"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setErrors((current) => ({ ...current, email: undefined }));
        }}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
        invalid={Boolean(errors.email)}
      />
      <FieldError message={errors.email} />

      <PasswordField
        placeholder="Şifre (en az 8 karakter)"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setErrors((current) => ({ ...current, password: undefined }));
        }}
        textContentType="newPassword"
        invalid={Boolean(errors.password)}
      />
      <FieldError message={errors.password} />

      <PasswordField
        placeholder="Şifre (tekrar)"
        value={passwordConfirm}
        onChangeText={(text) => {
          setPasswordConfirm(text);
          setErrors((current) => ({ ...current, passwordConfirm: undefined }));
        }}
        textContentType="newPassword"
        invalid={Boolean(errors.passwordConfirm)}
      />
      <FieldError message={errors.passwordConfirm} />

      <CheckboxRow
        checked={acceptedTerms}
        onToggle={() => {
          setAcceptedTerms((current) => !current);
          setErrors((current) => ({ ...current, acceptedTerms: undefined }));
        }}
        label="18 yaşından büyüğüm ve"
        linkLabel="Kullanım Koşulları'nı kabul ediyorum."
      />
      <FieldError message={errors.acceptedTerms} />

      <PrimaryButton title="Kayıt Ol" onPress={handleSubmit} loading={loading} />
    </AuthScreen>
  );
}
