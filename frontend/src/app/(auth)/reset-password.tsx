import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { AuthScreen } from '@/components/auth/auth-screen';
import { FieldError } from '@/components/auth/field-error';
import { GhostButton } from '@/components/auth/ghost-button';
import { PasswordField } from '@/components/auth/password-field';
import { PrimaryButton } from '@/components/auth/primary-button';
import { ApiError } from '@/lib/api-client';
import { resetPasswordRequest } from '@/lib/auth-api';

const MIN_PASSWORD_LENGTH = 8;

export default function ResetPasswordScreen() {
  const { resetToken } = useLocalSearchParams<{ resetToken?: string }>();
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const canSubmit =
    password.length >= MIN_PASSWORD_LENGTH && password === passwordConfirm && !loading;

  async function handleSubmit() {
    if (!canSubmit) return;
    if (!resetToken) {
      setError('Doğrulama süresi dolmuş, baştan dene');
      return;
    }
    setError(undefined);
    setLoading(true);
    try {
      await resetPasswordRequest(resetToken, password);
      router.replace('/login');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Bir şeyler ters gitti, tekrar dene');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen title="Yeni Şifre Belirle" description="Hesabın için yeni bir şifre oluştur.">
      <PasswordField
        placeholder="Yeni şifre (en az 8 karakter)"
        value={password}
        onChangeText={setPassword}
        textContentType="newPassword"
      />
      <PasswordField
        placeholder="Yeni şifre (tekrar)"
        value={passwordConfirm}
        onChangeText={setPasswordConfirm}
        textContentType="newPassword"
      />
      <FieldError message={error} />
      <PrimaryButton title="Şifreyi Güncelle" onPress={handleSubmit} disabled={!canSubmit} loading={loading} />
      <GhostButton title="Girişe dön" onPress={() => router.replace('/login')} />
    </AuthScreen>
  );
}
