import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthScreen } from '@/components/auth/auth-screen';
import { BottomRow } from '@/components/auth/bottom-row';
import { FieldError } from '@/components/auth/field-error';
import { LinkText } from '@/components/auth/link-text';
import { PasswordField } from '@/components/auth/password-field';
import { PrimaryButton } from '@/components/auth/primary-button';
import { TextField } from '@/components/auth/text-field';
import { ApiError } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';

export default function LoginScreen() {
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;

  async function handleSubmit() {
    if (!canSubmit) return;
    setError(undefined);
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Bir şeyler ters gitti, tekrar dene');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen
      title="Giriş Yap"
      description="Hesabına devam etmek için e-posta ve şifreni gir."
      footer={
        <BottomRow question="Hesabın yok mu?" actionTitle="Kayıt ol" onPress={() => router.push('/register')} />
      }>
      <TextField
        placeholder="E-posta"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <PasswordField placeholder="Şifre" value={password} onChangeText={setPassword} />
      <FieldError message={error} />
      <View style={styles.linkRow}>
        <LinkText title="Şifremi unuttum" onPress={() => router.push('/forgot-password')} />
      </View>
      <PrimaryButton title="Giriş Yap" onPress={handleSubmit} disabled={!canSubmit} loading={loading} />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  linkRow: {
    alignItems: 'flex-end',
    marginTop: -4,
  },
});
