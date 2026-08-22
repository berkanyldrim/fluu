import { Redirect, Stack } from 'expo-router';

import { useAuthStore } from '@/store/auth-store';

export default function AuthLayout() {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);

  // Zaten tam kayıtlı bir kullanıcı manuel olarak /login gibi bir auth ekranına giderse
  // (auth) grubu dışına, doğrudan (tabs)'a yönlendirilir.
  if (status === 'authenticated' && user?.isEmailVerified && profile) {
    return <Redirect href="/chats" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
