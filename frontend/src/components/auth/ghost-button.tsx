import { Pressable, StyleSheet, Text } from 'react-native';

import { NunitoFonts, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type GhostButtonProps = {
  title: string;
  onPress: () => void;
};

export function GhostButton({ title, onPress }: GhostButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        { borderColor: theme.border, backgroundColor: pressed ? theme.softBlue : 'transparent' },
      ]}>
      <Text style={[styles.text, { color: theme.text }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    borderRadius: Radius.control,
    borderWidth: 1.5,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  text: {
    fontFamily: NunitoFonts.bold,
    fontSize: 14,
  },
});
