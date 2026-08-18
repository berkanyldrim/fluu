import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthScreen } from '@/components/auth/auth-screen';
import { BirthDatePicker } from '@/components/auth/birth-date-picker';
import { ChipRow } from '@/components/auth/chip-row';
import { FieldError } from '@/components/auth/field-error';
import { PrimaryButton } from '@/components/auth/primary-button';
import { SelectField } from '@/components/auth/select-field';
import { StepDots } from '@/components/auth/step-dots';
import { TextField } from '@/components/auth/text-field';
import { NunitoFonts } from '@/constants/theme';
import { COUNTRIES } from '@/data/countries';
import { TURKEY_CITIES } from '@/data/turkey-cities';
import { useTheme } from '@/hooks/use-theme';
import { personalInfoSchema } from '@/schemas/auth';
import { isValidUsernameFormat } from '@/utils/auth-validation';

const TOTAL_STEPS = 3;
const TURKEY = 'Türkiye';

const GENDER_OPTIONS = [
  { label: 'Kadın', value: 'female' },
  { label: 'Erkek', value: 'male' },
  { label: 'Diğer', value: 'other' },
];

type FormErrors = Partial<
  Record<'firstName' | 'lastName' | 'username' | 'birthDate' | 'gender' | 'country' | 'city', string>
>;

export default function OnboardingPersonalInfoScreen() {
  const theme = useTheme();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const usernameFormatValid = username.length > 0 && isValidUsernameFormat(username);
  // TODO: step 4 — burada GET /users/check-username ile debounce'lu gerçek
  // benzersizlik kontrolü yapılacak. Şimdilik sadece format doğrulanıyor.
  const [usernameAvailable, setUsernameAvailable] = useState(false);

  useEffect(() => {
    setUsernameAvailable(usernameFormatValid);
  }, [usernameFormatValid]);

  function handleCountryChange(value: string) {
    setCountry(value);
    if (value !== TURKEY) setCity(null);
    setErrors((current) => ({ ...current, country: undefined, city: undefined }));
  }

  function handleSubmit() {
    const result = personalInfoSchema.safeParse({
      firstName,
      lastName,
      username,
      birthDate,
      gender,
      country: country ?? '',
      city,
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        firstName: fieldErrors.firstName?.[0],
        lastName: fieldErrors.lastName?.[0],
        username: fieldErrors.username?.[0],
        birthDate: fieldErrors.birthDate?.[0],
        gender: fieldErrors.gender?.[0],
        country: fieldErrors.country?.[0],
        city: fieldErrors.city?.[0],
      });
      return;
    }

    setErrors({});
    // TODO: step 4 — PATCH /users/me ile profil bilgileri kaydedilip (tabs) köküne
    // yönlendirilecek.
    router.replace('/');
  }

  return (
    <AuthScreen
      title="Seni tanıyalım"
      description="Bu bilgiler Keşfet'te doğru kişilerle eşleşmeni sağlar."
      topSlot={<StepDots total={TOTAL_STEPS} activeCount={3} />}>
      <TextField
        placeholder="İsim"
        value={firstName}
        onChangeText={(text) => {
          setFirstName(text);
          setErrors((current) => ({ ...current, firstName: undefined }));
        }}
        invalid={Boolean(errors.firstName)}
      />
      <FieldError message={errors.firstName} />

      <TextField
        placeholder="Soyisim"
        value={lastName}
        onChangeText={(text) => {
          setLastName(text);
          setErrors((current) => ({ ...current, lastName: undefined }));
        }}
        invalid={Boolean(errors.lastName)}
      />
      <FieldError message={errors.lastName} />

      <View>
        <TextField
          placeholder="Kullanıcı adı"
          value={username}
          onChangeText={(text) => {
            setUsername(text.toLowerCase());
            setErrors((current) => ({ ...current, username: undefined }));
          }}
          autoCapitalize="none"
          autoCorrect={false}
          invalid={Boolean(errors.username)}
          rightSlot={usernameAvailable ? <Ionicons name="checkmark-circle" size={18} color="#1EA362" /> : null}
        />
        {errors.username ? (
          <FieldError message={errors.username} />
        ) : username.length > 0 && usernameAvailable ? (
          <Text style={[styles.fieldHint, { color: '#1EA362' }]}>
            Bu kullanıcı adı uygun. Benzersiz olmalı, profilinde görünür.
          </Text>
        ) : null}
      </View>

      <BirthDatePicker
        value={birthDate}
        onChange={(date) => {
          setBirthDate(date);
          setErrors((current) => ({ ...current, birthDate: undefined }));
        }}
        invalid={Boolean(errors.birthDate)}
      />
      <FieldError message={errors.birthDate} />

      <Text style={[styles.fieldLabel, { color: theme.muted }]}>Cinsiyet</Text>
      <ChipRow
        options={GENDER_OPTIONS}
        value={gender}
        onChange={(value) => {
          setGender(value);
          setErrors((current) => ({ ...current, gender: undefined }));
        }}
      />
      <FieldError message={errors.gender} />

      <SelectField
        placeholder="Ülke"
        searchPlaceholder="Ülke ara"
        options={COUNTRIES}
        value={country}
        onChange={handleCountryChange}
        invalid={Boolean(errors.country)}
      />
      <FieldError message={errors.country} />

      {country === TURKEY ? (
        <>
          <SelectField
            placeholder="Şehir"
            searchPlaceholder="Şehir ara"
            options={TURKEY_CITIES}
            value={city}
            onChange={(value) => {
              setCity(value);
              setErrors((current) => ({ ...current, city: undefined }));
            }}
            invalid={Boolean(errors.city)}
          />
          <FieldError message={errors.city} />
        </>
      ) : null}

      <PrimaryButton title="Fluu'ya Başla" onPress={handleSubmit} />
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
