import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthScreen } from '@/components/auth/auth-screen';
import { GhostButton } from '@/components/auth/ghost-button';
import { LinkText } from '@/components/auth/link-text';
import { OtpInput } from '@/components/auth/otp-input';
import { PrimaryButton } from '@/components/auth/primary-button';
import { NunitoFonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { maskEmail } from '@/utils/auth-validation';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 47;

export default function VerifyOtpScreen() {
  const theme = useTheme();
  const { purpose, email } = useLocalSearchParams<{ purpose?: string; email?: string }>();
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((current) => current - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const code = digits.join('');
  const canSubmit = code.length === OTP_LENGTH;
  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');

  function handleVerify() {
    if (!canSubmit) return;
    // TODO: step 4 — POST /auth/verify-email (purpose=register) ile değiştirilecek.
    if (purpose === 'reset') {
      router.push({ pathname: '/reset-password', params: { email } });
    } else {
      router.push('/onboarding/photo');
    }
  }

  function handleResend() {
    if (secondsLeft > 0) return;
    // TODO: step 4 — POST /auth/send-verification-otp ile değiştirilecek.
    setSecondsLeft(RESEND_COOLDOWN_SECONDS);
    setDigits(Array(OTP_LENGTH).fill(''));
  }

  return (
    <AuthScreen
      title="Kodu Doğrula"
      description={`${email ? maskEmail(email) : 'e-posta adresine'} gönderdiğimiz kodu gir.`}>
      <OtpInput value={digits} onChange={setDigits} />
      {secondsLeft > 0 ? (
        <Text style={[styles.timer, { color: theme.muted }]}>
          Kodu tekrar gönder <Text style={styles.timerDisabled}>({minutes}:{seconds})</Text>
        </Text>
      ) : (
        <View style={styles.resendRow}>
          <LinkText title="Kodu tekrar gönder" onPress={handleResend} />
        </View>
      )}
      <PrimaryButton title="Doğrula" onPress={handleVerify} disabled={!canSubmit} />
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
