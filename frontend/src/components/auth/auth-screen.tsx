import { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/auth/brand-mark';
import { NunitoFonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const MAX_WIDTH = 420;

type AuthScreenProps = PropsWithChildren<{
  title: string;
  description?: string;
  footer?: ReactNode;
  topSlot?: ReactNode;
}>;

export function AuthScreen({ title, description, footer, topSlot, children }: AuthScreenProps) {
  const theme = useTheme();

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled">
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <BrandMark />
        {topSlot}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          {description ? (
            <Text style={[styles.description, { color: theme.muted }]}>{description}</Text>
          ) : null}
        </View>
        <View style={styles.form}>{children}</View>
        {footer}
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  safeArea: {
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontFamily: NunitoFonts.extraBold,
    fontSize: 22,
    letterSpacing: -0.2,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontFamily: NunitoFonts.semiBold,
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    gap: 14,
  },
});
