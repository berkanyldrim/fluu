import { ReactNode } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { NunitoFonts, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TextFieldProps = TextInputProps & {
  rightSlot?: ReactNode;
  invalid?: boolean;
};

export function TextField({ style, rightSlot, invalid, ...rest }: TextFieldProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrap}>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: theme.softBlue, color: theme.text, borderColor: 'transparent' },
          invalid ? { borderColor: theme.error } : null,
          rightSlot ? styles.inputWithSlot : null,
          style,
        ]}
        placeholderTextColor={theme.muted}
        {...rest}
      />
      {rightSlot ? <View style={styles.rightSlot}>{rightSlot}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    fontFamily: NunitoFonts.semiBold,
    fontSize: 14.5,
    borderRadius: Radius.control,
    borderWidth: 1.5,
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  inputWithSlot: {
    paddingRight: 44,
  },
  rightSlot: {
    position: 'absolute',
    right: 6,
    height: 34,
    width: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
