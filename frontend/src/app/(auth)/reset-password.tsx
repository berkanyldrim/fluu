import { router } from 'expo-router';
import { useState } from 'react';

import { AuthScreen } from '@/components/auth/auth-screen';
import { GhostButton } from '@/components/auth/ghost-button';
import { PasswordField } from '@/components/auth/password-field';
import { PrimaryButton } from '@/components/auth/primary-button';

const MIN_PASSWORD_LENGTH = 8;

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const canSubmit = password.length >= MIN_PASSWORD_LENGTH && password === passwordConfirm;

  function handleSubmit() {
    if (!canSubmit) return;
    // TODO: step 4 — doğrulanmış OTP koduyla birlikte şifre sıfırlama endpoint'ine
    // (BACKEND.md'ye eklenecek) bağlanacak. Şimdilik girişe yönlendiriyoruz.
    router.replace('/login');
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
      <PrimaryButton title="Şifreyi Güncelle" onPress={handleSubmit} disabled={!canSubmit} />
      <GhostButton title="Girişe dön" onPress={() => router.replace('/login')} />
    </AuthScreen>
  );
}
