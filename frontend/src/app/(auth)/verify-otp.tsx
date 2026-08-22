import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthScreen } from '@/components/auth/auth-screen';
import { FieldError } from '@/components/auth/field-error';
import { GhostButton } from '@/components/auth/ghost-button';
import { LinkText } from '@/components/auth/link-text';
import { OtpInput } from '@/components/auth/otp-input';
import { PrimaryButton } from '@/components/auth/primary-button';
import { NunitoFonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ApiError } from '@/lib/api-client';
import { sendRegisterOtpRequest, sendResetOtpRequest, verifyRegisterOtpRequest, verifyResetOtpRequest } from '@/lib/auth-api';
import { useAuthStore } from '@/store/auth-store';
import { maskEmail } from '@/utils/auth-validation';

const OTP_LENGTH = 6;

function secondsUntil(isoDate?: string) {
  if (!isoDate) return 0;
  return Math.max(0, Math.round((new Date(isoDate).getTime() - Date.now()) / 1000));
}

export default function VerifyOtpScreen() {
  const theme = useTheme();
  const { purpose, email, otpExpiresAt } = useLocalSearchParams<{
    purpose?: string;
    email?: string;
    otpExpiresAt?: string;
  }>();
  const isReset = purpose === 'reset';
  const authorizedRequest = useAuthStore((state) => state.authorizedRequest);
  const markEmailVerified = useAuthStore((state) => state.markEmailVerified);

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [secondsLeft, setSecondsLeft] = useState(() => secondsUntil(otpExpiresAt));
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((current) => current - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const code = digits.join('');
  const canSubmit = code.length === OTP_LENGTH && !loading;
  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');

  async function handleVerify() {
    if (!canSubmit) return;
    setError(undefined);
    setLoading(true);
    try {
      if (isReset) {
        if (!email) throw new ApiError(400, 'E-posta bulunamadı, baştan dene');
        const { resetToken } = await verifyResetOtpRequest(email, code);
        router.push({ pathname: '/reset-password', params: { resetToken } });
      } else {
        await authorizedRequest((token) => verifyRegisterOtpRequest(token, code));
        markEmailVerified();
        router.push('/onboarding/photo');
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Bir şeyler ters gitti, tekrar dene');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (secondsLeft > 0) return;
    setError(undefined);
    try {
      let result: { otpExpiresAt: string };
      if (isReset) {
        if (!email) throw new ApiError(400, 'E-posta bulunamadı, baştan dene');
        result = await sendResetOtpRequest(email);
      } else {
        result = await authorizedRequest((token) => sendRegisterOtpRequest(token));
      }
      setSecondsLeft(secondsUntil(result.otpExpiresAt));
      setDigits(Array(OTP_LENGTH).fill(''));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Bir şeyler ters gitti, tekrar dene');
    }
  }

  return (
    <AuthScreen
      title="Kodu Doğrula"
      description={`${email ? maskEmail(email) : 'e-posta adresine'} gönderdiğimiz kodu gir.`}>
      <OtpInput value={digits} onChange={setDigits} />
      <FieldError message={error} />
      {secondsLeft > 0 ? (
        <Text style={[styles.timer, { color: theme.muted }]}>
          Kodu tekrar gönder <Text style={styles.timerDisabled}>({minutes}:{seconds})</Text>
        </Text>
      ) : (
        <View style={styles.resendRow}>
          <LinkText title="Kodu tekrar gönder" onPress={handleResend} />
        </View>
      )}
      <PrimaryButton title="Doğrula" onPress={handleVerify} disabled={!canSubmit} loading={loading} />
      <GhostButton title="Girişe dön" onPress={() => router.push('/login')} />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  timer: {
    fontFamily: NunitoFonts.semiBold,
    fontSize: 12.5,
    textAlign: 'center',
    marginTop: -6,
  },
  timerDisabled: {
    fontFamily: NunitoFonts.bold,
    opacity: 0.55,
  },
  resendRow: {
    alignItems: 'center',
    marginTop: -6,
  },
});
