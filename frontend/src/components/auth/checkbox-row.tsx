import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { NunitoFonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type CheckboxRowProps = {
  checked: boolean;
  onToggle: () => void;
  label: string;
  linkLabel: string;
};

export function CheckboxRow({ checked, onToggle, label, linkLabel }: CheckboxRowProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onToggle}
      style={styles.row}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}>
      <View
        style={[
          styles.box,
          {
            borderColor: checked ? theme.primary : theme.border,
            backgroundColor: checked ? theme.primary : 'transparent',
          },
        ]}>
        {checked ? <Ionicons name="checkmark" size={12} color="#FFFFFF" /> : null}
      </View>
      <Text style={[styles.text, { color: theme.muted }]}>
        {label} <Text style={{ color: theme.primary, fontFamily: NunitoFonts.bold }}>{linkLabel}</Text>
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 2,
  },
  box: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    fontFamily: NunitoFonts.semiBold,
    fontSize: 12,
    lineHeight: 18,
  },
});
