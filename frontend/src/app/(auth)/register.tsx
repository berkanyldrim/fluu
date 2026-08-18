import { router } from 'expo-router';
import { useState } from 'react';

import { AuthScreen } from '@/components/auth/auth-screen';
import { BottomRow } from '@/components/auth/bottom-row';
import { CheckboxRow } from '@/components/auth/checkbox-row';
import { PasswordField } from '@/components/auth/password-field';
import { PrimaryButton } from '@/components/auth/primary-button';
import { TextField } from '@/components/auth/text-field';

const MIN_PASSWORD_LENGTH = 8;

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const canSubmit =
    email.trim().length > 0 &&
    password.length >= MIN_PASSWORD_LENGTH &&
    password === passwordConfirm &&
    acceptedTerms;

  function handleSubmit() {
    if (!canSubmit) return;
    // TODO: step 4 — POST /auth/register + POST /auth/send-verification-otp ile
    // değiştirilecek. Şimdilik OTP ekranına e-postayla birlikte yönlendiriyoruz.
    router.push({ pathname: '/verify-otp', params: { purpose: 'register', email } });
  }

  return (
    <AuthScreen
      title="Hesap Oluştur"
      description="Anonim profilin birkaç adımda hazır."
      footer={<BottomRow question="Zaten hesabın var mı?" actionTitle="Giriş yap" onPress={() => router.push('/login')} />}>
      <TextField
        placeholder="E-posta"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <PasswordField
        placeholder="Şifre (en az 8 karakter)"
        value={password}
        onChangeText={setPassword}
        textContentType="newPassword"
      />
      <PasswordField
        placeholder="Şifre (tekrar)"
        value={passwordConfirm}
        onChangeText={setPasswordConfirm}
        textContentType="newPassword"
      />
      <CheckboxRow
        checked={acceptedTerms}
        onToggle={() => setAcceptedTerms((current) => !current)}
        label="18 yaşından büyüğüm ve"
        linkLabel="Kullanım Koşulları'nı kabul ediyorum."
      />
      <PrimaryButton title="Kayıt Ol" onPress={handleSubmit} disabled={!canSubmit} />
    </AuthScreen>
  );
}
