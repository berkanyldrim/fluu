import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { NunitoFonts, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export function PrimaryButton({ title, onPress, disabled, loading }: PrimaryButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isDisabled ? theme.muted : pressed ? theme.primaryActive : theme.primary,
          opacity: isDisabled ? 0.6 : 1,
        },
      ]}>
      {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.text}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    borderRadius: Radius.control,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  text: {
    fontFamily: NunitoFonts.extraBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
});
