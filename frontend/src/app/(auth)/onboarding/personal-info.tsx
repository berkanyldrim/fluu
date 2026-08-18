import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthScreen } from '@/components/auth/auth-screen';
import { ChipRow } from '@/components/auth/chip-row';
import { PrimaryButton } from '@/components/auth/primary-button';
import { StepDots } from '@/components/auth/step-dots';
import { TextField } from '@/components/auth/text-field';
import { NunitoFonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { isAtLeastMinAge, isValidUsernameFormat, parseBirthDate } from '@/utils/auth-validation';

const TOTAL_STEPS = 3;

const GENDER_OPTIONS = [
  { label: 'Kadın', value: 'female' },
  { label: 'Erkek', value: 'male' },
  { label: 'Diğer', value: 'other' },
];

export default function OnboardingPersonalInfoScreen() {
  const theme = useTheme();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [birthDateInput, setBirthDateInput] = useState('');
  const [gender, setGender] = useState('');
  const [location, setLocation] = useState('');

  const usernameFormatValid = username.length > 0 && isValidUsernameFormat(username);
  // TODO: step 4 — burada GET /users/check-username ile debounce'lu gerçek
  // benzersizlik kontrolü yapılacak. Şimdilik sadece format doğrulanıyor.
  const [usernameAvailable, setUsernameAvailable] = useState(false);

  useEffect(() => {
    setUsernameAvailable(usernameFormatValid);
  }, [usernameFormatValid]);

  const birthDate = parseBirthDate(birthDateInput);
  const isOldEnough = birthDate !== null && isAtLeastMinAge(birthDate);

  const canSubmit =
    displayName.trim().length > 0 &&
    usernameAvailable &&
    isOldEnough &&
    gender.length > 0 &&
    location.trim().length > 0;

  function handleSubmit() {
    if (!canSubmit) return;
    // TODO: step 4 — PATCH /users/me ile profil bilgileri kaydedilip (tabs) köküne
    // yönlendirilecek.
    router.replace('/');
  }

  return (
    <AuthScreen
      title="Seni tanıyalım"
      description="Bu bilgiler Keşfet'te doğru kişilerle eşleşmeni sağlar."
      topSlot={<StepDots total={TOTAL_STEPS} activeCount={3} />}>
      <TextField placeholder="Görünen ad" value={displayName} onChangeText={setDisplayName} />

      <View>
        <TextField
          placeholder="Kullanıcı adı"
          value={username}
          onChangeText={(text) => setUsername(text.toLowerCase())}
          autoCapitalize="none"
          autoCorrect={false}
          rightSlot={
            usernameAvailable ? (
              <Ionicons name="checkmark-circle" size={18} color="#1EA362" />
            ) : null
          }
        />
        {username.length > 0 ? (
          <Text
            style={[
              styles.fieldHint,
              { color: usernameAvailable ? '#1EA362' : theme.error },
            ]}>
            {usernameAvailable
              ? 'Bu kullanıcı adı uygun. Benzersiz olmalı, profilinde görünür.'
              : 'En az 3, en fazla 20 karakter; sadece küçük harf, rakam ve _ kullanabilirsin.'}
          </Text>
        ) : null}
      </View>

      <TextField
        placeholder="Doğum tarihi (GG/AA/YYYY)"
        value={birthDateInput}
        onChangeText={setBirthDateInput}
        keyboardType="number-pad"
      />
      {birthDateInput.length === 10 && !isOldEnough ? (
        <Text style={[styles.fieldHint, { color: theme.error }]}>
          Fluu'yu kullanabilmek için 18 yaşından büyük olman gerekiyor.
        </Text>
      ) : null}

      <Text style={[styles.fieldLabel, { color: theme.muted }]}>Cinsiyet</Text>
      <ChipRow options={GENDER_OPTIONS} value={gender} onChange={setGender} />

      <TextField placeholder="Ülke / Şehir" value={location} onChangeText={setLocation} />

      <PrimaryButton title="Fluu'ya Başla" onPress={handleSubmit} disabled={!canSubmit} />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    fontFamily: NunitoFonts.bold,
    fontSize: 12,
    marginTop: 2,
  },
  fieldHint: {
    fontFamily: NunitoFonts.bold,
    fontSize: 11,
    marginTop: 6,
  },
});
