import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthScreen } from '@/components/auth/auth-screen';
import { BottomRow } from '@/components/auth/bottom-row';
import { LinkText } from '@/components/auth/link-text';
import { PasswordField } from '@/components/auth/password-field';
import { PrimaryButton } from '@/components/auth/primary-button';
import { TextField } from '@/components/auth/text-field';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const canSubmit = email.trim().length > 0 && password.length > 0;

  function handleSubmit() {
    if (!canSubmit) return;
    // TODO: step 4 — POST /auth/login ile değiştirilecek, başarı sonrası token
    // Zustand store'a yazılıp (tabs) köküne yönlendirilecek.
    router.replace('/');
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
      <View style={styles.linkRow}>
        <LinkText title="Şifremi unuttum" onPress={() => router.push('/forgot-password')} />
      </View>
      <PrimaryButton title="Giriş Yap" onPress={handleSubmit} disabled={!canSubmit} />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  linkRow: {
    alignItems: 'flex-end',
    marginTop: -4,
  },
});
