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
import { ApiError } from '@/lib/api-client';
import { checkUsernameRequest, updateProfileRequest } from '@/lib/auth-api';
import { personalInfoSchema } from '@/schemas/auth';
import { useAuthStore } from '@/store/auth-store';
import { isValidUsernameFormat } from '@/utils/auth-validation';

const TOTAL_STEPS = 3;
const TURKEY = 'Türkiye';
const USERNAME_CHECK_DEBOUNCE_MS = 400;

const GENDER_OPTIONS = [
  { label: 'Kadın', value: 'female' },
  { label: 'Erkek', value: 'male' },
  { label: 'Diğer', value: 'other' },
];

type FormErrors = Partial<
  Record<'firstName' | 'lastName' | 'username' | 'birthDate' | 'gender' | 'country' | 'city', string>
>;

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function OnboardingPersonalInfoScreen() {
  const theme = useTheme();
  const authorizedRequest = useAuthStore((state) => state.authorizedRequest);
  const setProfile = useAuthStore((state) => state.setProfile);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  useEffect(() => {
    if (!username || !isValidUsernameFormat(username)) {
      setUsernameStatus('idle');
      return;
    }

    let cancelled = false;
    setUsernameStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const { available } = await checkUsernameRequest(username);
        if (!cancelled) setUsernameStatus(available ? 'available' : 'taken');
      } catch {
        if (!cancelled) setUsernameStatus('idle');
      }
    }, USERNAME_CHECK_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [username]);

  function handleCountryChange(value: string) {
    setCountry(value);
    if (value !== TURKEY) setCity(null);
    setErrors((current) => ({ ...current, country: undefined, city: undefined }));
  }

  async function handleSubmit() {
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

    if (usernameStatus === 'taken') {
      setErrors((current) => ({ ...current, username: 'Bu kullanıcı adı alınmış' }));
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const { profile } = await authorizedRequest((token) =>
        updateProfileRequest(token, {
          firstName: result.data.firstName,
          lastName: result.data.lastName,
          username: result.data.username,
          birthDate: toIsoDate(result.data.birthDate),
          gender: result.data.gender,
          country: result.data.country,
          city: result.data.city,
        }),
      );
      setProfile(profile);
      router.replace('/');
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setErrors({ username: err.message });
      } else {
        setErrors({ username: err instanceof ApiError ? err.message : 'Bir şeyler ters gitti, tekrar dene' });
      }
    } finally {
      setSubmitting(false);
    }
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
          invalid={Boolean(errors.username) || usernameStatus === 'taken'}
          rightSlot={
            usernameStatus === 'available' ? (
              <Ionicons name="checkmark-circle" size={18} color="#1EA362" />
            ) : usernameStatus === 'taken' ? (
              <Ionicons name="close-circle" size={18} color={theme.error} />
            ) : null
          }
        />
        {errors.username ? (
          <FieldError message={errors.username} />
        ) : usernameStatus === 'available' ? (
          <Text style={[styles.fieldHint, { color: '#1EA362' }]}>
            Bu kullanıcı adı uygun. Benzersiz olmalı, profilinde görünür.
          </Text>
        ) : usernameStatus === 'taken' ? (
          <Text style={[styles.fieldHint, { color: theme.error }]}>Bu kullanıcı adı alınmış.</Text>
        ) : username.length > 0 && !isValidUsernameFormat(username) ? (
          <Text style={[styles.fieldHint, { color: theme.error }]}>
            En az 3, en fazla 20 karakter; sadece küçük harf, rakam ve _ kullanabilirsin.
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

      <PrimaryButton title="Fluu'ya Başla" onPress={handleSubmit} loading={submitting} />
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
