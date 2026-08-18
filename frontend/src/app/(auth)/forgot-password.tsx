import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthScreen } from '@/components/auth/auth-screen';
import { GhostButton } from '@/components/auth/ghost-button';
import { PrimaryButton } from '@/components/auth/primary-button';
import { TextField } from '@/components/auth/text-field';
import { useTheme } from '@/hooks/use-theme';

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const [email, setEmail] = useState('');

  const canSubmit = email.trim().length > 0;

  function handleSubmit() {
    if (!canSubmit) return;
    // TODO: step 4 — POST /auth/send-verification-otp ile değiştirilecek.
    router.push({ pathname: '/verify-otp', params: { purpose: 'reset', email } });
  }

  return (
    <AuthScreen
      title="Şifreni mi unuttun?"
      description="Sorun değil. E-posta adresine 6 haneli bir doğrulama kodu göndereceğiz."
      topSlot={
        <View style={[styles.iconBadge, { backgroundColor: theme.softBlue }]}>
          <Ionicons name="lock-closed-outline" size={26} color={theme.primary} />
        </View>
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
      <PrimaryButton title="Kod Gönder" onPress={handleSubmit} disabled={!canSubmit} />
      <GhostButton title="Girişe dön" onPress={() => router.push('/login')} />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
});
