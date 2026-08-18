import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AuthScreen } from '@/components/auth/auth-screen';
import { GhostButton } from '@/components/auth/ghost-button';
import { PrimaryButton } from '@/components/auth/primary-button';
import { StepDots } from '@/components/auth/step-dots';
import { useTheme } from '@/hooks/use-theme';

const TOTAL_STEPS = 3;

export default function OnboardingPhotoScreen() {
  const theme = useTheme();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  async function handlePickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  }

  function handleContinue() {
    // TODO: step 4 — seçilen fotoğraf expo-image-manipulator ile sıkıştırılıp
    // presigned upload akışıyla (BACKEND.md medya pipeline) yüklenecek.
    router.push('/onboarding/personal-info');
  }

  return (
    <AuthScreen
      title="Bir fotoğraf ekle"
      description="İstersen atlayabilirsin, istediğin zaman profilinden ekleyebilirsin."
      topSlot={<StepDots total={TOTAL_STEPS} activeCount={2} />}>
      <Pressable
        onPress={handlePickImage}
        style={[styles.avatar, { backgroundColor: theme.softBlue, borderColor: theme.border }]}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatarImage} contentFit="cover" />
        ) : (
          <Ionicons name="image-outline" size={30} color={theme.muted} />
        )}
        <View style={[styles.camBadge, { backgroundColor: theme.primary, borderColor: theme.surface }]}>
          <Ionicons name="add" size={15} color="#FFFFFF" />
        </View>
      </Pressable>
      <PrimaryButton
        title={avatarUri ? 'Devam Et' : 'Galeriden Seç'}
        onPress={avatarUri ? handleContinue : handlePickImage}
      />
      <GhostButton title="Şimdilik atla" onPress={handleContinue} />
    </AuthScreen>
  );
}

const AVATAR_SIZE = 104;

const styles = StyleSheet.create({
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 8,
  },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  camBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
