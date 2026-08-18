import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthScreen } from '@/components/auth/auth-screen';
import { FieldError } from '@/components/auth/field-error';
import { GhostButton } from '@/components/auth/ghost-button';
import { PrimaryButton } from '@/components/auth/primary-button';
import { TextField } from '@/components/auth/text-field';
import { useTheme } from '@/hooks/use-theme';
import { ApiError } from '@/lib/api-client';
import { sendResetOtpRequest } from '@/lib/auth-api';

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const canSubmit = email.trim().length > 0 && !loading;

  async function handleSubmit() {
    if (!canSubmit) return;
    setError(undefined);
    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      await sendResetOtpRequest(normalizedEmail);
      router.push({ pathname: '/verify-otp', params: { purpose: 'reset', email: normalizedEmail } });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Bir şeyler ters gitti, tekrar dene');
    } finally {
      setLoading(false);
    }
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
      <FieldError message={error} />
      <PrimaryButton title="Kod Gönder" onPress={handleSubmit} disabled={!canSubmit} loading={loading} />
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
