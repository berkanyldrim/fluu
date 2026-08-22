import { StyleSheet, Text } from 'react-native';

import { NunitoFonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type FieldErrorProps = {
  message?: string;
  center?: boolean;
};

export function FieldError({ message, center }: FieldErrorProps) {
  const theme = useTheme();

  if (!message) return null;

  return <Text style={[styles.text, center && styles.centered, { color: theme.error }]}>{message}</Text>;
}

const styles = StyleSheet.create({
  text: {
    fontFamily: NunitoFonts.bold,
    fontSize: 11,
    marginTop: 6,
  },
  centered: {
    textAlign: 'center',
  },
});
