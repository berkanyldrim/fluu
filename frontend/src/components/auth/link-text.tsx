import { Pressable, StyleSheet, Text } from 'react-native';

import { NunitoFonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type LinkTextProps = {
  title: string;
  onPress: () => void;
};

export function LinkText({ title, onPress }: LinkTextProps) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress} hitSlop={6} accessibilityRole="link">
      <Text style={[styles.text, { color: theme.primary }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: NunitoFonts.bold,
    fontSize: 13,
  },
});
