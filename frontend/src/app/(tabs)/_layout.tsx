import { Redirect } from 'expo-router';

import AppTabs from '@/components/app-tabs';
import { useAuthStore } from '@/store/auth-store';

export default function TabsLayout() {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);

  if (status === 'unauthenticated') {
    return <Redirect href="/login" />;
  }

  if (user && !user.isEmailVerified) {
    return <Redirect href={{ pathname: '/verify-otp', params: { purpose: 'register', email: user.email } }} />;
  }

  if (!profile) {
    return <Redirect href="/onboarding/personal-info" />;
  }

  return <AppTabs />;
}
