import { useRef } from 'react';
import {
  NativeSyntheticEvent,
  StyleSheet,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from 'react-native';

import { NunitoFonts, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const LENGTH = 6;

type OtpInputProps = {
  value: string[];
  onChange: (value: string[]) => void;
};

export function OtpInput({ value, onChange }: OtpInputProps) {
  const theme = useTheme();
  const inputs = useRef<Array<TextInput | null>>([]);

  function handleChangeText(text: string, index: number) {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const next = [...value];
    next[index] = digit;
    onChange(next);
    if (digit && index < LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(event: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) {
    if (event.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  return (
    <View style={styles.row}>
      {Array.from({ length: LENGTH }).map((_, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            inputs.current[index] = ref;
          }}
          value={value[index] ?? ''}
          onChangeText={(text) => handleChangeText(text, index)}
          onKeyPress={(event) => handleKeyPress(event, index)}
          keyboardType="number-pad"
          maxLength={1}
          style={[styles.box, { backgroundColor: theme.softBlue, color: theme.text }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'center',
    marginBottom: 24,
  },
  box: {
    width: 42,
    height: 54,
    fontFamily: NunitoFonts.extraBold,
    fontSize: 21,
    textAlign: 'center',
    borderRadius: Radius.control,
  },
});
