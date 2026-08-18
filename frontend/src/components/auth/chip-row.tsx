import { Pressable, StyleSheet, Text, View } from 'react-native';

import { NunitoFonts, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ChipOption = {
  label: string;
  value: string;
};

type ChipRowProps = {
  options: ChipOption[];
  value: string;
  onChange: (value: string) => void;
};

export function ChipRow({ options, value, onChange }: ChipRowProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            style={[
              styles.chip,
              {
                borderColor: selected ? theme.primary : theme.border,
                backgroundColor: selected ? theme.primary : 'transparent',
              },
            ]}>
            <Text style={[styles.label, { color: selected ? '#FFFFFF' : theme.text }]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.button,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  label: {
    fontFamily: NunitoFonts.bold,
    fontSize: 13,
  },
});
